import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { JobStatus, CandidateStatus, CandidateGender, InterviewStatus } from '@prisma/client';
import { createActivity } from './activity.service';
import { createNotification } from './notification.service';

// ── Job Openings ──────────────────────────────────────────────────────────────

export async function getJobOpenings(query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.status) where.status = query.status as JobStatus;
  if (query.department) where.department = { contains: query.department, mode: 'insensitive' };

  const [jobs, total] = await Promise.all([
    prisma.jobOpening.findMany({
      where, skip, take: limit,
      include: { _count: { select: { candidates: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.jobOpening.count({ where }),
  ]);
  return paginatedResponse(jobs, total, { page, limit, skip });
}

export async function getJobOpeningById(id: string) {
  const job = await prisma.jobOpening.findUnique({
    where: { id },
    include: { candidates: { orderBy: { createdAt: 'desc' } } },
  });
  if (!job) throw new AppError('Job opening not found', 404);
  return job;
}

export async function createJobOpening(data: any, userId: string) {
  const job = await prisma.jobOpening.create({ data: { ...data, createdById: userId } });
  await createActivity({ userId, action: 'posted job opening', target: job.title, type: 'general' });
  return job;
}

export async function updateJobOpening(id: string, data: any) {
  const job = await prisma.jobOpening.findUnique({ where: { id } });
  if (!job) throw new AppError('Job opening not found', 404);
  return prisma.jobOpening.update({ where: { id }, data });
}

export async function deleteJobOpening(id: string) {
  const job = await prisma.jobOpening.findUnique({ where: { id } });
  if (!job) throw new AppError('Job opening not found', 404);
  await prisma.jobOpening.delete({ where: { id } });
}

// ── Candidates ────────────────────────────────────────────────────────────────

export async function getCandidates(query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.status) where.status = query.status as CandidateStatus;
  if (query.gender) where.gender = query.gender as CandidateGender;
  if (query.jobOpeningId) where.jobOpeningId = query.jobOpeningId;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { appliedPosition: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where, skip, take: limit,
      include: {
        jobOpening: { select: { id: true, title: true } },
        interviews: { orderBy: { scheduledAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.candidate.count({ where }),
  ]);
  return paginatedResponse(candidates, total, { page, limit, skip });
}

export async function getCandidateById(id: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      jobOpening: true,
      interviews: { orderBy: { scheduledAt: 'asc' } },
    },
  });
  if (!candidate) throw new AppError('Candidate not found', 404);
  return candidate;
}

export async function createCandidate(data: any) {
  return prisma.candidate.create({ data });
}

export async function updateCandidate(id: string, data: any) {
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) throw new AppError('Candidate not found', 404);
  return prisma.candidate.update({ where: { id }, data });
}

export async function updateCandidateStatus(id: string, status: CandidateStatus, updaterId?: string) {
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) throw new AppError('Candidate not found', 404);
  const updated = await prisma.candidate.update({ where: { id }, data: { status } });
  if (updaterId) {
    // fire-and-forget: don't block the response
    Promise.all([
      createActivity({
        userId: updaterId,
        action: `moved candidate to ${status.replace(/_/g, ' ')}`,
        target: candidate.name,
        type: 'general',
      }),
      status === 'selected'
        ? prisma.user.findMany({ where: { role: { in: ['hr', 'admin'] }, id: { not: updaterId } }, select: { id: true } })
            .then(users => Promise.all(users.map(u => createNotification({
              userId: u.id,
              title: 'Candidate Selected',
              message: `${candidate.name} has been selected for ${candidate.appliedPosition}`,
              type: 'success',
              link: '/recruitment',
            }))))
        : Promise.resolve(),
    ]).catch(e => console.error('Background notification error:', e));
  }
  return updated;
}

export async function deleteCandidate(id: string) {
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) throw new AppError('Candidate not found', 404);
  await prisma.candidate.delete({ where: { id } });
}

export async function convertToEmployee(id: string, employeeData: any, converterId?: string) {
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) throw new AppError('Candidate not found', 404);
  if (candidate.status !== 'selected') throw new AppError('Only selected candidates can be converted', 400);

  const hashed = await (await import('bcryptjs')).default.hash(employeeData.password, 12);
  const user = await prisma.user.create({
    data: {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone ?? undefined,
      skills: candidate.skills,
      password: hashed,
      role: employeeData.role ?? 'frontend_dev',
      department: employeeData.department ?? 'General',
      title: candidate.appliedPosition,
      status: 'active',
    },
  });

  await prisma.candidate.update({ where: { id }, data: { convertedUserId: user.id } });

  if (converterId) {
    // fire-and-forget
    Promise.all([
      createActivity({
        userId: converterId,
        action: 'hired candidate',
        target: `${candidate.name} as ${candidate.appliedPosition}`,
        type: 'general',
      }),
      prisma.user.findMany({ where: { role: 'admin', id: { not: converterId } }, select: { id: true } })
        .then(admins => Promise.all(admins.map(a => createNotification({
          userId: a.id,
          title: 'New Employee Onboarded',
          message: `${candidate.name} has been hired as ${candidate.appliedPosition}`,
          type: 'success',
          link: '/employees',
        })))),
    ]).catch(e => console.error('Background notification error:', e));
  }
  return user;
}

// -- Interviews --

export async function getInterviews(query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.candidateId) where.candidateId = query.candidateId;
  if (query.status) where.status = query.status as InterviewStatus;

  const [interviews, total] = await Promise.all([
    prisma.interview.findMany({
      where, skip, take: limit,
      include: { candidate: { select: { id: true, name: true, appliedPosition: true } } },
      orderBy: { scheduledAt: 'asc' },
    }),
    prisma.interview.count({ where }),
  ]);
  return paginatedResponse(interviews, total, { page, limit, skip });
}

export async function createInterview(data: any, creatorId?: string) {
  const candidate = await prisma.candidate.findUnique({ where: { id: data.candidateId } });
  if (!candidate) throw new AppError('Candidate not found', 404);
  const interview = await prisma.interview.create({
    data: { ...data, scheduledAt: new Date(data.scheduledAt) },
    include: { candidate: { select: { id: true, name: true, appliedPosition: true } } },
  });
  if (creatorId) {
    // fire-and-forget
    Promise.all([
      createActivity({
        userId: creatorId,
        action: 'scheduled interview',
        target: `${candidate.name} — ${data.type?.replace(/_/g, ' ')} interview`,
        type: 'general',
      }),
      prisma.user.findMany({ where: { role: { in: ['hr', 'admin'] }, id: { not: creatorId } }, select: { id: true } })
        .then(users => Promise.all(users.map(u => createNotification({
          userId: u.id,
          title: 'Interview Scheduled',
          message: `Interview scheduled for ${candidate.name} (${candidate.appliedPosition})`,
          type: 'info',
          link: '/recruitment',
        })))),
    ]).catch(e => console.error('Background notification error:', e));
  }
  return interview;
}

export async function updateInterview(id: string, data: any) {
  const interview = await prisma.interview.findUnique({ where: { id } });
  if (!interview) throw new AppError('Interview not found', 404);
  return prisma.interview.update({
    where: { id },
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
  });
}

export async function deleteInterview(id: string) {
  const interview = await prisma.interview.findUnique({ where: { id } });
  if (!interview) throw new AppError('Interview not found', 404);
  await prisma.interview.delete({ where: { id } });
}

// ── Public Job Application ───────────────────────────────────────────────────

export async function applyForJob(data: {
  name: string;
  email: string;
  phone?: string;
  appliedPosition: string;
  jobOpeningId?: string;
  experience?: number;
  skills?: string[];
  coverLetter?: string;
  resumeFile?: Express.Multer.File;
}) {
  const { supabase, RESUME_BUCKET } = await import('../config/supabase');
  let resumeUrl: string | undefined;

  if (data.resumeFile) {
    const ext = data.resumeFile.originalname.split('.').pop();
    const path = `${Date.now()}_${data.name.replace(/\s+/g, '_')}.${ext}`;
    const { error } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(path, data.resumeFile.buffer, {
        contentType: data.resumeFile.mimetype,
        upsert: false,
      });
    if (error) throw new AppError(`Resume upload failed: ${error.message}`, 500);
    const { data: urlData } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(path);
    resumeUrl = urlData.publicUrl;
  }

  return prisma.candidate.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      appliedPosition: data.appliedPosition,
      jobOpeningId: data.jobOpeningId ?? null,
      experience: data.experience ?? 0,
      skills: data.skills ?? [],
      notes: data.coverLetter,
      resumeUrl,
      status: 'applied',
    },
  });
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export async function getRecruitmentStats() {
  const [openPositions, totalCandidates, scheduledInterviews, hired] = await Promise.all([
    prisma.jobOpening.count({ where: { status: 'open' } }),
    prisma.candidate.count(),
    prisma.interview.count({ where: { status: 'scheduled' } }),
    prisma.candidate.count({ where: { status: 'selected' } }),
  ]);
  return { openPositions, totalCandidates, scheduledInterviews, hired };
}
