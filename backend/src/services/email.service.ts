import nodemailer from 'nodemailer';

let _transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  const host = process.env.HR_SMTP_HOST;
  const user = process.env.HR_SMTP_USER;
  const pass = process.env.HR_SMTP_PASSWORD;

  // If real SMTP creds are configured, try them
  if (host && user && pass) {
    _transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.HR_SMTP_PORT) || 465,
      secure: process.env.HR_SMTP_SECURE !== 'false',
      auth: { user, pass },
    });
    try {
      await _transporter.verify();
      console.log('✅ SMTP connected:', host);
      return _transporter;
    } catch (err: any) {
      console.warn('⚠️  SMTP verify failed, falling back to Ethereal preview mode:', err.message);
      _transporter = null;
    }
  }

  // Fallback: Ethereal test account (emails visible at ethereal.email)
  const testAccount = await nodemailer.createTestAccount();
  _transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('📧 Using Ethereal preview SMTP. View sent emails at https://ethereal.email');
  console.log(`   Ethereal user: ${testAccount.user}`);
  return _transporter;
}

const FROM = `"${process.env.HR_FROM_NAME || 'TZMicha HR'}" <${process.env.HR_FROM_EMAIL || process.env.HR_SMTP_USER || 'hr@tzmicha.com'}>`;

async function sendMail(options: nodemailer.SendMailOptions) {
  const transport = await getTransporter();
  const info = await transport.sendMail(options);
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log('📬 Email preview:', preview);
  return info;
}

export async function sendInterviewEmail(data: {
  to: string;
  candidateName: string;
  position: string;
  scheduledAt: Date;
  type: string;
  interviewers: string[];
  notes?: string;
}) {
  const dateStr = data.scheduledAt.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  await sendMail({
    from: FROM,
    to: data.to,
    subject: `Interview Scheduled — ${data.position} at TZMicha`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#e11d48;padding:28px 32px">
          <h1 style="color:#fff;margin:0;font-size:22px">Interview Invitation</h1>
          <p style="color:#fecdd3;margin:6px 0 0;font-size:14px">TZMicha Recruitment Team</p>
        </div>
        <div style="padding:32px">
          <p style="font-size:15px;color:#111827">Dear <strong>${data.candidateName}</strong>,</p>
          <p style="font-size:14px;color:#374151;line-height:1.6">
            We are pleased to invite you for a <strong>${data.type.replace(/_/g, ' ')}</strong> interview
            for the position of <strong>${data.position}</strong>.
          </p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px">Date &amp; Time</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827">${dateStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Interview Type</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-transform:capitalize">${data.type.replace(/_/g, ' ')}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Position</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827">${data.position}</td></tr>
              ${data.interviewers.length ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Interviewers</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827">${data.interviewers.join(', ')}</td></tr>` : ''}
            </table>
          </div>
          ${data.notes ? `<p style="font-size:13px;color:#374151;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:12px"><strong>Note:</strong> ${data.notes}</p>` : ''}
          <p style="font-size:14px;color:#374151;line-height:1.6">Please confirm your availability by replying to this email.</p>
          <p style="font-size:14px;color:#374151;margin-top:24px">Best regards,<br><strong>TZMicha HR Team</strong></p>
        </div>
        <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
          <p style="font-size:12px;color:#9ca3af;margin:0">This is an automated message from TZMicha Recruitment System.</p>
        </div>
      </div>
    `,
  });
}

export async function sendOfferLetterEmail(data: {
  to: string;
  candidateName: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  expiryDays: number;
  notes?: string;
}) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + data.expiryDays);
  const expiryStr = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  await sendMail({
    from: FROM,
    to: data.to,
    subject: `Offer Letter — ${data.position} at TZMicha`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#059669;padding:28px 32px">
          <h1 style="color:#fff;margin:0;font-size:22px">Offer of Employment</h1>
          <p style="color:#a7f3d0;margin:6px 0 0;font-size:14px">TZMicha — Official Offer Letter</p>
        </div>
        <div style="padding:32px">
          <p style="font-size:15px;color:#111827">Dear <strong>${data.candidateName}</strong>,</p>
          <p style="font-size:14px;color:#374151;line-height:1.6">
            We are delighted to offer you the position of <strong>${data.position}</strong> in the
            <strong>${data.department}</strong> department at TZMicha.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px">Position</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827">${data.position}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Department</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827">${data.department}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Annual Salary</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#059669">$${data.salary.toLocaleString()}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Start Date</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827">${data.startDate}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Offer Expires</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#dc2626">${expiryStr}</td></tr>
            </table>
          </div>
          ${data.notes ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:12px;margin-bottom:16px"><p style="font-size:13px;color:#374151;margin:0"><strong>Additional Details:</strong><br>${data.notes}</p></div>` : ''}
          <p style="font-size:14px;color:#374151;line-height:1.6">
            To accept this offer, please reply to this email before <strong>${expiryStr}</strong>.
          </p>
          <p style="font-size:14px;color:#374151;margin-top:24px">Warm regards,<br><strong>TZMicha HR Team</strong></p>
        </div>
        <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
          <p style="font-size:12px;color:#9ca3af;margin:0">This is an official offer letter from TZMicha.</p>
        </div>
      </div>
    `,
  });
}
