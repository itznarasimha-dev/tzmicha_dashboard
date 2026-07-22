import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Users, UserCheck, Plus, X, Loader2, ChevronDown,
  Trash2, UserPlus, Clock, TrendingUp, XCircle, Star, FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useRecruitmentStats, useJobOpenings, useCreateJob, useUpdateJob, useDeleteJob,
  useCandidates, useCreateCandidate, useUpdateCandidateStatus, useDeleteCandidate, useConvertToEmployee,
} from '@/hooks';
import { cn } from '@/utils';
import type { CandidateStatus, CandidateGender, JobStatus } from '@/types';

const GENDERS: { value: CandidateGender | ''; label: string }[] = [
  { value: '',       label: 'All Genders' },
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const CANDIDATE_STATUSES: CandidateStatus[] = [
  'applied', 'screening', 'selected', 'rejected',
];

const STATUS_BADGE: Record<CandidateStatus, { variant: any; label: string }> = {
  applied:             { variant: 'blue',    label: 'Applied' },
  screening:           { variant: 'warning', label: 'Shortlisted' },
  technical_interview: { variant: 'violet',  label: 'Technical' },
  hr_interview:        { variant: 'secondary', label: 'HR Interview' },
  selected:            { variant: 'success', label: 'Selected' },
  rejected:            { variant: 'danger',  label: 'Rejected' },
};

const JOB_STATUS_BADGE: Record<JobStatus, { variant: any; label: string }> = {
  open:    { variant: 'success', label: 'Open' },
  closed:  { variant: 'muted',   label: 'Closed' },
  on_hold: { variant: 'warning', label: 'On Hold' },
};

const inputCls = 'h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all';
const selectCls = inputCls;

// ── Modal Shell ───────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-modal z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}

function SubmitBtn({ loading, label = 'Save' }: { loading: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading}
      className="h-9 px-5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto">
      {loading && <Loader2 className="size-4 animate-spin" />}
      {loading ? 'Saving...' : label}
    </button>
  );
}

// ── Candidate Detail Modal ─────────────────────────────────────────────────────

function CandidateDetailModal({ open, onClose, candidate }: { open: boolean; onClose: () => void; candidate: any }) {
  if (!candidate) return null;
  const rows: { label: string; value: any }[] = [
    { label: 'Email',           value: candidate.email },
    { label: 'Phone',           value: candidate.phone || '—' },
    { label: 'Gender',          value: candidate.gender ? candidate.gender.charAt(0).toUpperCase() + candidate.gender.slice(1) : '—' },
    { label: 'Applied For',     value: candidate.appliedPosition },
    { label: 'Experience',      value: candidate.experience ? `${candidate.experience} year${candidate.experience !== 1 ? 's' : ''}` : '—' },
    { label: 'Current Company', value: candidate.currentCompany || '—' },
    { label: 'Notice Period',   value: candidate.noticePeriod ? `${candidate.noticePeriod} days` : '—' },
    { label: 'Expected Salary', value: candidate.expectedSalary ? `$${candidate.expectedSalary.toLocaleString()}` : '—' },
  ];
  return (
    <Modal open={open} onClose={onClose} title="Candidate Details">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
          <Avatar name={candidate.name} size="md" />
          <div>
            <p className="text-sm font-bold text-foreground">{candidate.name}</p>
            <p className="text-xs text-muted-foreground">{candidate.appliedPosition}</p>
            <Badge variant={STATUS_BADGE[candidate.status as CandidateStatus]?.variant} className="mt-1">
              {STATUS_BADGE[candidate.status as CandidateStatus]?.label}
            </Badge>
          </div>
        </div>
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {rows.map(r => (
            <div key={r.label}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{r.label}</p>
              <p className="text-[13px] text-foreground mt-0.5">{r.value}</p>
            </div>
          ))}
        </div>
        {/* Skills */}
        {candidate.skills?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((s: string) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
        {/* Cover Letter / Notes */}
        {candidate.notes && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Cover Letter / Notes</p>
            <p className="text-xs text-foreground leading-relaxed bg-muted/40 rounded-lg p-3 border border-border">{candidate.notes}</p>
          </div>
        )}
        {/* Resume */}
        {candidate.resumeUrl && (
          <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <FileText className="size-4 text-rose-500" />
            <span className="text-sm font-semibold text-foreground">View Resume</span>
            <span className="ml-auto text-xs text-muted-foreground">Open ↗</span>
          </a>
        )}
      </div>
    </Modal>
  );
}

// ── Job Opening Modal ─────────────────────────────────────────────────────────

function JobModal({ open, onClose, existing }: { open: boolean; onClose: () => void; existing?: any }) {
  const { mutate: create, isPending: creating } = useCreateJob();
  const { mutate: update, isPending: updating } = useUpdateJob();
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    department: existing?.department ?? '',
    description: existing?.description ?? '',
    requirements: existing?.requirements ?? '',
    location: existing?.location ?? '',
    type: existing?.type ?? 'full_time',
    status: existing?.status ?? 'open',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.department) return;
    if (existing) {
      update({ id: existing.id, data: form }, { onSuccess: onClose });
    } else {
      create(form, { onSuccess: onClose });
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Job Opening' : 'New Job Opening'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Job Title *">
          <input className={inputCls} placeholder="e.g. Senior Frontend Engineer" value={form.title} onChange={f('title')} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Department *">
            <input className={inputCls} placeholder="e.g. Engineering" value={form.department} onChange={f('department')} required />
          </Field>
          <Field label="Location">
            <input className={inputCls} placeholder="e.g. Remote" value={form.location} onChange={f('location')} />
          </Field>
          <Field label="Type">
            <select className={selectCls} value={form.type} onChange={f('type')}>
              {['full_time', 'part_time', 'contract', 'internship'].map(v => (
                <option key={v} value={v}>{v.replace('_', ' ')}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className={selectCls} value={form.status} onChange={f('status')}>
              {['open', 'on_hold', 'closed'].map(v => (
                <option key={v} value={v}>{v.replace('_', ' ')}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea className={inputCls + ' h-20 py-2 resize-none'} placeholder="Role overview..." value={form.description} onChange={f('description')} />
        </Field>
        <Field label="Requirements">
          <textarea className={inputCls + ' h-20 py-2 resize-none'} placeholder="Skills and qualifications..." value={form.requirements} onChange={f('requirements')} />
        </Field>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={creating || updating} label={existing ? 'Update' : 'Create'} />
        </div>
      </form>
    </Modal>
  );
}

// ── Candidate Modal ───────────────────────────────────────────────────────────

function CandidateModal({ open, onClose, jobs }: { open: boolean; onClose: () => void; jobs: any[] }) {
  const { mutate: create, isPending } = useCreateCandidate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', experience: '0',
    skills: '', resumeUrl: '', appliedPosition: '', jobOpeningId: '',
    notes: '', gender: '', expectedSalary: '', currentCompany: '', noticePeriod: '',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.appliedPosition) return;
    create({
      ...form,
      experience: parseInt(form.experience) || 0,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      jobOpeningId: form.jobOpeningId || undefined,
      phone: form.phone || undefined,
      resumeUrl: form.resumeUrl || undefined,
      notes: form.notes || undefined,
      gender: (form.gender as any) || undefined,
      expectedSalary: form.expectedSalary ? parseInt(form.expectedSalary) : undefined,
      currentCompany: form.currentCompany || undefined,
      noticePeriod: form.noticePeriod ? parseInt(form.noticePeriod) : undefined,
    }, { onSuccess: onClose });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Candidate">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *">
            <input className={inputCls} placeholder="Jane Doe" value={form.name} onChange={f('name')} required />
          </Field>
          <Field label="Email *">
            <input type="email" className={inputCls} placeholder="jane@example.com" value={form.email} onChange={f('email')} required />
          </Field>
          <Field label="Phone">
            <input className={inputCls} placeholder="+1 555 000 0000" value={form.phone} onChange={f('phone')} />
          </Field>
          <Field label="Gender">
            <select className={selectCls} value={form.gender} onChange={f('gender')}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Experience (years)">
            <input type="number" min="0" className={inputCls} value={form.experience} onChange={f('experience')} />
          </Field>
          <Field label="Expected Salary ($)">
            <input type="number" min="0" className={inputCls} placeholder="e.g. 80000" value={form.expectedSalary} onChange={f('expectedSalary')} />
          </Field>
          <Field label="Current Company">
            <input className={inputCls} placeholder="e.g. Acme Corp" value={form.currentCompany} onChange={f('currentCompany')} />
          </Field>
          <Field label="Notice Period (days)">
            <input type="number" min="0" className={inputCls} placeholder="e.g. 30" value={form.noticePeriod} onChange={f('noticePeriod')} />
          </Field>
        </div>
        <Field label="Applied Position *">
          <input className={inputCls} placeholder="e.g. Senior Frontend Engineer" value={form.appliedPosition} onChange={f('appliedPosition')} required />
        </Field>
        <Field label="Job Opening">
          <select className={selectCls} value={form.jobOpeningId} onChange={f('jobOpeningId')}>
            <option value="">None</option>
            {jobs.map((j: any) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </Field>
        <Field label="Skills (comma-separated)">
          <input className={inputCls} placeholder="React, TypeScript, Node.js" value={form.skills} onChange={f('skills')} />
        </Field>
        <Field label="Resume URL">
          <input className={inputCls} placeholder="https://drive.google.com/..." value={form.resumeUrl} onChange={f('resumeUrl')} />
        </Field>
        <Field label="Notes">
          <textarea className={inputCls + ' h-16 py-2 resize-none'} placeholder="Any additional notes..." value={form.notes} onChange={f('notes')} />
        </Field>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} label="Add Candidate" />
        </div>
      </form>
    </Modal>
  );
}

// ── Offer Letter Modal ────────────────────────────────────────────────────────

function OfferModal({ open, onClose, candidate, onSend }: { open: boolean; onClose: () => void; candidate: any; onSend: (data: any) => void }) {
  const [form, setForm] = useState({
    salary: candidate?.expectedSalary ? String(candidate.expectedSalary) : '',
    startDate: '',
    position: candidate?.appliedPosition ?? '',
    department: '',
    expiryDays: '7',
    notes: '',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.salary || !form.startDate || !form.department) return;
    onSend({ salary: form.salary, department: form.department, startDate: form.startDate, expiryDays: parseInt(form.expiryDays), notes: form.notes });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Send Offer Letter">
      <div className="mb-4 p-3 rounded-lg bg-muted/40 border border-border">
        <p className="text-sm font-semibold text-foreground">{candidate?.name}</p>
        <p className="text-xs text-muted-foreground">{candidate?.appliedPosition}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Position *">
            <input className={inputCls} value={form.position} onChange={f('position')} required />
          </Field>
          <Field label="Department *">
            <input className={inputCls} placeholder="e.g. Engineering" value={form.department} onChange={f('department')} required />
          </Field>
          <Field label="Offered Salary ($) *">
            <input type="number" className={inputCls} placeholder="e.g. 85000" value={form.salary} onChange={f('salary')} required />
          </Field>
          <Field label="Start Date *">
            <input type="date" className={inputCls} value={form.startDate} onChange={f('startDate')} required />
          </Field>
          <Field label="Offer Expires In (days)">
            <select className={selectCls} value={form.expiryDays} onChange={f('expiryDays')}>
              {['3','5','7','10','14'].map(d => <option key={d} value={d}>{d} days</option>)}
            </select>
          </Field>
        </div>
        <Field label="Additional Notes">
          <textarea className={inputCls + ' h-16 py-2 resize-none'} placeholder="Benefits, perks, conditions..." value={form.notes} onChange={f('notes')} />
        </Field>
        <div className="flex justify-end pt-2 border-t border-border gap-2">
          <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <SubmitBtn loading={false} label="Save Offer" />
        </div>
      </form>
    </Modal>
  );
}

// ── Convert to Employee Modal ─────────────────────────────────────────────────

function ConvertModal({ open, onClose, candidate }: { open: boolean; onClose: () => void; candidate: any }) {
  const { mutate: convert, isPending } = useConvertToEmployee();
  const [form, setForm] = useState({ role: 'frontend_dev', department: '', password: '' });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.password || !form.department) return;
    convert({ id: candidate.id, data: form }, { onSuccess: onClose });
  }

  return (
    <Modal open={open} onClose={onClose} title="Convert to Employee">
      <div className="mb-4 p-3 rounded-lg bg-muted/40 border border-border">
        <p className="text-sm font-semibold text-foreground">{candidate?.name}</p>
        <p className="text-xs text-muted-foreground">{candidate?.appliedPosition}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Department *">
          <input className={inputCls} placeholder="e.g. Engineering" value={form.department} onChange={f('department')} required />
        </Field>
        <Field label="Role">
          <select className={selectCls} value={form.role} onChange={f('role')}>
            {['admin','frontend_dev','backend_dev','qa','marketing','hr','product_manager','sales'].map(v => (
              <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </Field>
        <Field label="Temporary Password *">
          <input type="password" className={inputCls} placeholder="Min 6 characters" value={form.password} onChange={f('password')} required minLength={6} />
        </Field>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} label="Convert & Create Account" />
        </div>
      </form>
    </Modal>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────────

export function RecruitmentPage() {
  const [tab, setTab] = useState<'jobs' | 'candidates' | 'pipeline' | 'offers'>('jobs');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [convertCandidate, setConvertCandidate] = useState<any>(null);
  const [offerCandidate, setOfferCandidate] = useState<any>(null);
  const [detailCandidate, setDetailCandidate] = useState<any>(null);
  // Local offer tracking (in real app this would be API-backed)
  const [offers, setOffers] = useState<{ id: string; name: string; position: string; salary: string; status: 'pending' | 'accepted' | 'declined'; sentAt: string; candidateId: string; department: string; startDate: string; expiryDays: number; notes: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState<CandidateGender | ''>('');

  const { data: stats, isLoading: statsLoading } = useRecruitmentStats();
  const { data: jobsData, isLoading: jobsLoading } = useJobOpenings({ limit: 50 });
  const { data: candidatesData, isFetching: candidatesLoading } = useCandidates({
    limit: 500,
    ...(statusFilter ? { status: statusFilter } : {}),
  });
  const { data: allCandidatesData } = useCandidates({ limit: 500 });
  const { mutate: deleteJob } = useDeleteJob();
  const { mutate: deleteCandidate } = useDeleteCandidate();
  const { mutate: updateStatus } = useUpdateCandidateStatus();

  function handleStatusChange(candidate: any, newStatus: string) {
    updateStatus({ id: candidate.id, status: newStatus });
    if (newStatus === 'selected') setOfferCandidate(candidate);
  }

  const jobs = jobsData?.data ?? [];
  const rawCandidates: any[] = candidatesData?.data ?? [];
  const candidates = genderFilter ? rawCandidates.filter((c: any) => c.gender === genderFilter) : rawCandidates;
  const allCandidates = allCandidatesData?.data ?? [];

  const kpis = [
    { label: 'Open Positions',   value: stats?.openPositions ?? 0,   icon: <Briefcase className="size-5" />, color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Total Candidates', value: stats?.totalCandidates ?? 0, icon: <Users className="size-5" />,     color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Candidates Hired', value: stats?.hired ?? 0,           icon: <UserCheck className="size-5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Rejection Rate',   value: stats?.rejectionRate ? `${stats.rejectionRate}%` : '—', icon: <XCircle className="size-5" />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
    { label: 'Avg Time to Hire', value: stats?.avgTimeToHire ? `${stats.avgTimeToHire}d` : '—', icon: <Clock className="size-5" />,   color: 'text-sky-600 dark:text-sky-400',   bg: 'bg-sky-50 dark:bg-sky-950/30' },
    { label: 'Offer Acceptance', value: stats?.offerAcceptanceRate ? `${stats.offerAcceptanceRate}%` : '—', icon: <TrendingUp className="size-5" />, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30' },
    { label: 'Avg Experience',   value: stats?.avgExperience ? `${stats.avgExperience}y` : '—', icon: <Star className="size-5" />,    color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  ];

  const tabs = [
    { id: 'jobs',       label: 'Job Openings', count: jobs.length },
    { id: 'candidates', label: 'Candidates',   count: candidates.length },
    { id: 'pipeline',   label: 'Pipeline',     count: allCandidates.length },
    { id: 'offers',     label: 'Offers',       count: offers.length },

  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment"
        description="Manage job openings, candidates, and interviews"
        breadcrumbs={[{ label: 'People' }, { label: 'Recruitment' }]}
        eyebrow="HR Department"
        actions={
          <>
            {tab === 'jobs' && <Button size="md" onClick={() => { setEditingJob(null); setShowJobModal(true); }}><Plus className="size-4" strokeWidth={2.5} /> New Job</Button>}
            {tab === 'candidates' && <Button size="md" onClick={() => setShowCandidateModal(true)}><Plus className="size-4" strokeWidth={2.5} /> Add Candidate</Button>}
            {tab === 'offers' && <Button size="md" onClick={() => setTab('candidates')}><FileText className="size-4" strokeWidth={2.5} /> New Offer</Button>}

          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} padding="md" className="flex flex-col gap-2">
            <div className={cn('flex size-9 items-center justify-center rounded-xl shrink-0', k.bg, k.color)}>
              {k.icon}
            </div>
            {statsLoading
              ? <Skeleton className="h-6 w-12" />
              : <p className={cn('text-xl font-bold tabular-nums', k.color)}>{k.value}</p>
            }
            <p className="text-[11px] text-muted-foreground font-medium leading-snug">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>
            {t.label}
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-bold',
              tab === t.id ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-muted text-muted-foreground'
            )}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Jobs Tab */}
      {tab === 'jobs' && (
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <div><CardTitle>Job Openings</CardTitle><CardDescription>{jobs.filter((j: any) => j.status === 'open').length} open positions</CardDescription></div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border mt-4">
              {jobsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-4 px-5"><Skeleton className="h-10 flex-1" /></div>
                ))
              ) : jobs.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No job openings yet</div>
              ) : (
                jobs.map((job: any, i: number) => (
                  <div key={job.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 px-5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted shrink-0">
                      <Briefcase className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">{job.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{job.department}</span>
                        {job.location && <span className="text-xs text-muted-foreground">· {job.location}</span>}
                        <span className="text-xs text-muted-foreground">· {job.type?.replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground">· {job._count?.candidates ?? 0} applicants</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={JOB_STATUS_BADGE[job.status as JobStatus]?.variant} dot>
                        {JOB_STATUS_BADGE[job.status as JobStatus]?.label}
                      </Badge>
                      <Button size="xs" variant="ghost" onClick={() => { setEditingJob(job); setShowJobModal(true); }}>Edit</Button>
                      <Button size="xs" variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => deleteJob(job.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidates Tab */}
      {tab === 'candidates' && (
        <Card padding="none">
          <div className="px-5 pt-5 pb-3 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">Candidates</p>
                <p className="text-xs text-muted-foreground mt-0.5">{candidates.length} total{genderFilter ? ` · ${genderFilter}` : ''}{statusFilter ? ` · ${STATUS_BADGE[statusFilter as CandidateStatus]?.label}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <select className={cn(selectCls, 'w-36 pr-7 appearance-none text-xs h-8')}
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    {CANDIDATE_STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_BADGE[s].label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative">
                  <select className={cn(selectCls, 'w-32 pr-7 appearance-none text-xs h-8')}
                    value={genderFilter} onChange={e => setGenderFilter(e.target.value as CandidateGender | '')}>
                    {GENDERS.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                </div>
                {(statusFilter || genderFilter) && (
                  <button
                    onClick={() => { setStatusFilter(''); setGenderFilter(''); }}
                    className="h-8 px-3 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1"
                  >
                    <X className="size-3" /> Clear
                  </button>
                )}
              </div>
            </div>
            {/* Active filter pills */}
            {(statusFilter || genderFilter) && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-[11px] font-semibold">
                    Status: {STATUS_BADGE[statusFilter as CandidateStatus]?.label}
                    <button onClick={() => setStatusFilter('')}><X className="size-2.5" /></button>
                  </span>
                )}
                {genderFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-[11px] font-semibold capitalize">
                    Gender: {genderFilter}
                    <button onClick={() => setGenderFilter('')}><X className="size-2.5" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
          <CardContent>
            <div className="divide-y divide-border mt-4">
              {candidatesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-4 px-5"><Skeleton className="size-8 rounded-full" /><Skeleton className="h-10 flex-1" /></div>
                ))
              ) : candidates.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No candidates found</div>
              ) : (
                candidates.map((c: any, i: number) => (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 px-5">
                    <Avatar name={c.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{c.appliedPosition}</span>
                        <span className="text-xs text-muted-foreground">· {c.experience}y exp</span>
                        {c.email && <span className="text-xs text-muted-foreground">· {c.email}</span>}
                      </div>
                      {c.skills?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {c.skills.slice(0, 4).map((s: string) => (
                            <span key={s} className="text-2xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <Button size="xs" variant="ghost" onClick={() => setDetailCandidate(c)}>
                        View
                      </Button>
                      <select
                        onChange={e => handleStatusChange(c, e.target.value)}
                        className={cn(selectCls, 'w-36 text-xs h-7 px-2')}
                      >
                        {CANDIDATE_STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_BADGE[s].label}</option>
                        ))}
                      </select>
                      {c.resumeUrl && (
                        <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="xs" variant="outline">
                            <FileText className="size-3.5" /> Resume
                          </Button>
                        </a>
                      )}
                      {c.status === 'selected' && !c.convertedUserId && (
                        <>
                          <Button size="xs" variant="outline" onClick={() => setOfferCandidate(c)}>
                            <FileText className="size-3.5" /> Offer
                          </Button>
                          <Button size="xs" variant="secondary" onClick={() => setConvertCandidate(c)}>
                            <UserPlus className="size-3.5" /> Hire
                          </Button>
                        </>
                      )}
                      {c.convertedUserId && (
                        <Badge variant="success" dot>Hired</Badge>
                      )}
                      <Button size="xs" variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => deleteCandidate(c.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offers Tab */}
      {tab === 'offers' && (
        <Card padding="none">
          <div className="px-5 pt-5 pb-3 border-b border-border">
            <p className="text-sm font-bold text-foreground">Offer Letters</p>
            <p className="text-xs text-muted-foreground mt-0.5">{offers.length} offers sent</p>
          </div>
          {offers.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <FileText className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No offers sent yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">Go to the Candidates tab, select a candidate with status "Selected" and click Offer.</p>
              <Button size="sm" variant="outline" onClick={() => setTab('candidates')}>Go to Candidates</Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {offers.map((o, i) => (
                <motion.div key={o.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted shrink-0">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">{o.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">{o.position}</span>
                      <span className="text-xs text-muted-foreground">· ${parseInt(o.salary).toLocaleString()}/yr</span>
                      <span className="text-xs text-muted-foreground">· Sent {o.sentAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={o.status === 'accepted' ? 'success' : o.status === 'declined' ? 'danger' : 'warning'} dot>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </Badge>
                    {o.status === 'pending' && (
                      <>
                        <Button size="xs" variant="outline"
                          onClick={() => setOffers(p => p.map(x => x.id === o.id ? { ...x, status: 'accepted' } : x))}>
                          Accept
                        </Button>
                        <Button size="xs" variant="ghost" className="text-red-500"
                          onClick={() => setOffers(p => p.map(x => x.id === o.id ? { ...x, status: 'declined' } : x))}>
                          Decline
                        </Button>
                      </>
                    )}
                    {o.status === 'accepted' && (
                      <Button size="xs" variant="secondary"
                        onClick={() => {
                          const c = allCandidates.find((c: any) => c.name === o.name);
                          if (c) { setConvertCandidate(c); }
                        }}>
                        <UserPlus className="size-3.5" /> Hire
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Pipeline Tab */}
      {tab === 'pipeline' && (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {CANDIDATE_STATUSES.map(status => {
              const cols = allCandidates.filter((c: any) => c.status === status);
              const cfg = STATUS_BADGE[status];
              const colColors: Record<string, string> = {
                applied:   'border-t-blue-500',
                screening: 'border-t-amber-500',
                selected:  'border-t-emerald-500',
                rejected:  'border-t-red-500',
              };
              const dotColors: Record<string, string> = {
                applied:   'bg-blue-500',
                screening: 'bg-amber-500',
                selected:  'bg-emerald-500',
                rejected:  'bg-red-500',
              };
              return (
                <div key={status} className={cn('w-60 shrink-0 rounded-xl border-t-2 border border-border bg-muted/30', colColors[status])}>
                  {/* Column header */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn('size-2 rounded-full shrink-0', dotColors[status])} />
                      <p className="text-xs font-bold text-foreground">{cfg.label}</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{cols.length}</span>
                  </div>
                  {/* Cards */}
                  <div className="px-2 pb-2 space-y-2 min-h-[120px]">
                    {cols.length === 0 && (
                      <div className="flex items-center justify-center h-16 text-[11px] text-muted-foreground">Empty</div>
                    )}
                    {cols.map((c: any) => (
                      <div key={c.id} className="rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-default">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar name={c.name} size="xs" />
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-foreground truncate">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{c.appliedPosition}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{c.experience}y exp</span>
                          {c.gender && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">{c.gender}</span>
                          )}
                        </div>
                        {c.skills?.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {c.skills.slice(0, 2).map((s: string) => (
                              <span key={s} className="text-[9px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">{s}</span>
                            ))}
                          </div>
                        )}
                        {status === 'selected' && !c.convertedUserId && (
                          <button
                            onClick={() => setConvertCandidate(c)}
                            className="mt-2 w-full text-[10px] font-bold py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 transition-colors"
                          >
                            → Hire
                          </button>
                        )}
                        {c.convertedUserId && (
                          <div className="mt-2 text-[10px] font-bold text-center py-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                            ✓ Hired
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <CandidateDetailModal
        open={!!detailCandidate}
        onClose={() => setDetailCandidate(null)}
        candidate={detailCandidate}
      />
      <JobModal
        open={showJobModal}
        onClose={() => { setShowJobModal(false); setEditingJob(null); }}
        existing={editingJob}
      />
      <CandidateModal
        open={showCandidateModal}
        onClose={() => setShowCandidateModal(false)}
        jobs={jobs}
      />
      {offerCandidate && (
        <OfferModal
          open={!!offerCandidate}
          onClose={() => setOfferCandidate(null)}
          onSend={(data) => {
            setOffers(p => [...p, {
              id: offerCandidate.id,
              name: offerCandidate.name,
              position: offerCandidate.appliedPosition,
              salary: data.salary,
              status: 'pending',
              sentAt: new Date().toLocaleDateString(),
              candidateId: offerCandidate.id,
              department: data.department,
              startDate: data.startDate,
              expiryDays: data.expiryDays,
              notes: data.notes || '',
            }]);
          }}
          candidate={offerCandidate}
        />
      )}
      {convertCandidate && (
        <ConvertModal
          open={!!convertCandidate}
          onClose={() => setConvertCandidate(null)}
          candidate={convertCandidate}
        />
      )}
    </div>
  );
}
