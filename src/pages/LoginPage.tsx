import { useState } from 'react';
import loginBg from '@/assets/login_background.jpg';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, KeyRound, X, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { api } from '@/services/api';

const glassCls =
  'w-full h-12 px-4 rounded-xl border border-white/20 bg-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]/50 focus:border-[#0EA5A4]/70 focus:bg-white/20 transition-all duration-200';

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match');
    if (form.newPassword.length < 6) return setError('Minimum 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: form.email, newPassword: form.newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl p-7"
        style={{ background: 'rgba(15,15,20,0.85)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.13)', boxShadow: '0 32px 64px -12px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5A4] to-[#0c8f8e] shadow-lg shadow-[#0EA5A4]/30">
              <KeyRound className="size-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Change Password</h2>
          </div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X className="size-3.5" />
          </button>
        </div>
        {success ? (
          <div className="text-center py-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/30 mx-auto mb-4">
              <Shield className="size-6 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">Password updated!</p>
            <p className="text-xs text-white/50 mb-6">You can now sign in with your new password.</p>
            <button onClick={onClose} className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] text-white text-sm font-semibold transition-all shadow-lg shadow-[#0EA5A4]/25">
              Back to Sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-white/60 mb-2 block tracking-widest uppercase">Email</label>
              <input type="email" required placeholder="you@tzmicha.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={glassCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/60 mb-2 block tracking-widest uppercase">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} required placeholder="••••••••" value={form.newPassword}
                  onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} className={`${glassCls} pr-11`} />
                <button type="button" onClick={() => setShowNew(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/80 transition-colors">
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/60 mb-2 block tracking-widest uppercase">Confirm Password</label>
              <input type="password" required placeholder="••••••••" value={form.confirmPassword}
                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} className={glassCls} />
            </div>
            {error && <p className="text-xs text-red-300 bg-red-500/15 border border-red-400/20 rounded-lg px-3 py-2.5">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1 shadow-lg shadow-[#0EA5A4]/25">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const features = [
  { icon: Zap,    label: 'Real-time updates', desc: 'Live project & task tracking' },
  { icon: Users,  label: 'Team management',   desc: 'HR, attendance & recruitment' },
  { icon: Shield, label: 'Role-based access',  desc: 'Secure per-role dashboards'  },
];

const QUICK_LOGINS = [
  { label: 'Admin',     email: 'suresh@tzmicha.com',         password: 'admin123',     color: 'bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/35' },
  { label: 'Frontend',  email: 'sarah.chen@tzmicha.com',      password: 'frontend123',  color: 'bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/35' },
  { label: 'Backend',   email: 'james.okafor@tzmicha.com',    password: 'backend123',   color: 'bg-violet-500/20 border-violet-400/30 text-violet-300 hover:bg-violet-500/35' },
  { label: 'QA',        email: 'priya.sharma@tzmicha.com',    password: 'qa123',        color: 'bg-amber-500/20 border-amber-400/30 text-amber-300 hover:bg-amber-500/35' },
  { label: 'Marketing', email: 'marcus.williams@tzmicha.com', password: 'marketing123', color: 'bg-pink-500/20 border-pink-400/30 text-pink-300 hover:bg-pink-500/35' },
  { label: 'HR',        email: 'elena.vasquez@tzmicha.com',   password: 'hr123',        color: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/35' },
  { label: 'Finance',   email: 'finance@tzmicha.com',         password: 'finance123',   color: 'bg-teal-500/20 border-teal-400/30 text-teal-300 hover:bg-teal-500/35' },
];

export function LoginPage() {
  const { login, isLoading, error, clearError } = useAppStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {}
  }

  async function quickLogin(e: string, p: string) {
    clearError();
    setEmail(e);
    setPassword(p);
    try {
      await login(e, p);
      navigate('/dashboard', { replace: true });
    } catch {}
  }

  const QuickLoginGrid = () => (
    <div className="grid grid-cols-4 gap-1.5">
      {QUICK_LOGINS.map(q => (
        <button key={q.label} type="button" disabled={isLoading}
          onClick={() => quickLogin(q.email, q.password)}
          className={`h-7 rounded-lg border text-[11px] font-semibold transition-all disabled:opacity-40 ${q.color}`}>
          {q.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden relative"
      style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      {/* ── MOBILE layout ── */}
      <div className="relative flex flex-col items-center justify-center w-full h-full px-5 py-6 md:hidden overflow-y-auto">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl mb-4 shrink-0"
            style={{ background: 'linear-gradient(135deg, #0EA5A4 0%, #0c8f8e 100%)', boxShadow: '0 8px 32px rgba(14,165,164,0.5)' }}>
            <svg width="28" height="28" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1L12 4V9L6.5 12L1 9V4L6.5 1Z" fill="white" fillOpacity="0.95" />
              <path d="M6.5 4L9 5.5V8L6.5 9.5L4 8V5.5L6.5 4Z" fill="white" fillOpacity="0.35" />
            </svg>
          </div>
          <p className="text-2xl font-black text-white tracking-tight leading-none">TZMicha</p>
          <p className="text-xs font-medium mt-1.5 tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>IT Solutions</p>
          <h2 className="text-xl font-black text-white mt-4 leading-snug">
            Great teams{' '}
            <span style={{ background: 'linear-gradient(135deg, #5ECFCE 0%, #0EA5A4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              build great things.
            </span>
          </h2>
        </div>

        <div className="w-full max-w-sm rounded-3xl p-7"
          style={{ background: 'rgba(10,10,15,0.75)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5A4]/15 border border-[#0EA5A4]/25 mb-4">
              <div className="size-1.5 rounded-full bg-[#0EA5A4]" />
              <span className="text-[11px] font-semibold text-[#5ECFCE] tracking-wide uppercase">Secure Sign In</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-white/40 mt-1">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-white/55 mb-2 block tracking-widest uppercase">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@tzmicha.com" required className={glassCls} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-white/55 tracking-widest uppercase">Password</label>
                <button type="button" onClick={() => setShowChangePassword(true)} className="text-[11px] text-[#5ECFCE]/80 hover:text-[#5ECFCE] transition-colors font-semibold">
                  Change password?
                </button>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className={`${glassCls} pr-11`} />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2.5 text-xs text-red-300 bg-red-500/12 border border-red-400/20 rounded-xl px-3.5 py-3">
                <span className="shrink-0 mt-0.5">⚠</span><span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={isLoading}
              className="w-full h-12 rounded-xl text-white text-sm font-bold tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1 group"
              style={{ background: 'linear-gradient(135deg, #0EA5A4 0%, #0c8f8e 100%)', boxShadow: '0 8px 24px rgba(14,165,164,0.35)' }}>
              {isLoading ? <><Loader2 className="size-4 animate-spin" /> Signing in...</> : <><span>Sign in</span><ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform duration-150" /></>}
            </button>
          </form>

          <div className="mt-5">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 text-center">Quick Login</p>
            <QuickLoginGrid />
          </div>

          <p className="text-center text-[11px] text-white/25 mt-4 leading-relaxed">
            Protected by enterprise-grade security.<br />© 2025 TZMicha IT Solutions
          </p>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/35 font-medium">All systems operational</span>
        </div>
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="relative hidden md:flex w-full h-full">
        {/* Left — Branding */}
        <div className="relative flex-1 flex flex-col justify-center px-16 gap-10 min-w-0">
          <div className="flex flex-col gap-10 relative">
            <div className="absolute -inset-8 rounded-3xl bg-black/30 backdrop-blur-sm -z-10" />
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl shrink-0"
                style={{ background: 'linear-gradient(135deg, #0EA5A4 0%, #0c8f8e 100%)', boxShadow: '0 8px 32px rgba(14,165,164,0.45), 0 0 0 1px rgba(255,255,255,0.12) inset' }}>
                <svg width="28" height="28" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1L12 4V9L6.5 12L1 9V4L6.5 1Z" fill="white" fillOpacity="0.95" />
                  <path d="M6.5 4L9 5.5V8L6.5 9.5L4 8V5.5L6.5 4Z" fill="white" fillOpacity="0.35" />
                </svg>
              </div>
              <div>
                <p className="text-[28px] font-black text-white leading-none tracking-tight">TZMicha</p>
                <p className="text-sm font-medium mt-1" style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em' }}>IT SOLUTIONS</p>
              </div>
            </div>

            <div>
              <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                Great teams<br />
                <span style={{ background: 'linear-gradient(135deg, #5ECFCE 0%, #0EA5A4 50%, #0c8f8e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  build great things.
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-3 max-w-xs">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3.5 group">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-white/8 border border-white/12 group-hover:bg-[#0EA5A4]/20 group-hover:border-[#0EA5A4]/30 transition-all duration-200 shrink-0">
                    <Icon className="size-4 text-white/60 group-hover:text-[#5ECFCE] transition-colors duration-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80 leading-none">{label}</p>
                    <p className="text-xs text-white/35 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/35 font-medium">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Right — Login Card */}
        <div className="relative flex items-center justify-center w-full max-w-[480px] px-8 py-10 mr-10 shrink-0">
          <div className="relative w-full rounded-3xl p-9"
            style={{ background: 'rgba(10,10,15,0.65)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.13)', boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset' }}>
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5A4]/15 border border-[#0EA5A4]/25 mb-5">
                <div className="size-1.5 rounded-full bg-[#0EA5A4]" />
                <span className="text-[11px] font-semibold text-[#5ECFCE] tracking-wide uppercase">Secure Sign In</span>
              </div>
              <h1 className="text-[26px] font-black text-white tracking-tight leading-tight">Welcome back</h1>
              <p className="text-sm text-white/40 mt-1.5">Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] font-semibold text-white/55 mb-2.5 block tracking-widest uppercase">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@tzmicha.com" required className={glassCls} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-[11px] font-semibold text-white/55 tracking-widest uppercase">Password</label>
                  <button type="button" onClick={() => setShowChangePassword(true)} className="text-[11px] text-[#5ECFCE]/80 hover:text-[#5ECFCE] transition-colors font-semibold tracking-wide">
                    Change password?
                  </button>
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className={`${glassCls} pr-11`} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-2.5 text-xs text-red-300 bg-red-500/12 border border-red-400/20 rounded-xl px-3.5 py-3">
                  <span className="shrink-0 mt-0.5">⚠</span><span>{error}</span>
                </div>
              )}
              <button type="submit" disabled={isLoading}
                className="w-full h-12 rounded-xl text-white text-sm font-bold tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 group"
                style={{ background: 'linear-gradient(135deg, #0EA5A4 0%, #0c8f8e 100%)', boxShadow: '0 8px 24px rgba(14,165,164,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 32px rgba(14,165,164,0.5), 0 0 0 1px rgba(255,255,255,0.12) inset')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(14,165,164,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset')}>
                {isLoading ? <><Loader2 className="size-4 animate-spin" /> Signing in...</> : <><span>Sign in</span><ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform duration-150" /></>}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 text-center">Quick Login</p>
              <QuickLoginGrid />
            </div>

            <p className="text-center text-[11px] text-white/25 mt-5 leading-relaxed">
              Protected by enterprise-grade security.<br />© 2025 TZMicha IT Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
