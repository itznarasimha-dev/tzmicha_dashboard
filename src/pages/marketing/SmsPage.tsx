import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Plus, CheckCheck, Clock, XCircle, History, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

const smsHistory = [
  { id: 1, name: 'Flash Sale Alert',       status: 'completed', sent: 120400, delivered: 118200, failed: 2200, pending: 0,    date: '2025-07-15', message: 'SALE! 50% off all products today only. Shop now: tzmicha.com/sale' },
  { id: 2, name: 'OTP Verification',       status: 'active',    sent: 84200,  delivered: 83900,  failed: 300,  pending: 0,    date: '2025-07-14', message: 'Your OTP is {{otp}}. Valid for 10 minutes. Do not share.' },
  { id: 3, name: 'Order Confirmation',     status: 'active',    sent: 62100,  delivered: 61800,  failed: 300,  pending: 0,    date: '2025-07-13', message: 'Hi {{name}}, your order #{{order_id}} has been confirmed.' },
  { id: 4, name: 'Abandoned Cart Nudge',   status: 'paused',    sent: 18400,  delivered: 18100,  failed: 300,  pending: 0,    date: '2025-07-12', message: 'You left something behind! Complete your purchase: tzmicha.com/cart' },
  { id: 5, name: 'Weekly Newsletter SMS',  status: 'scheduled', sent: 0,      delivered: 0,      failed: 0,    pending: 52100,date: '2025-08-01', message: 'This week at TZMicha: new features, tips & more. Read: tzmicha.com/news' },
];

const templates = [
  { id: 1, name: 'OTP Template',         body: 'Your OTP is {{otp}}. Valid for 10 minutes. Do not share.' },
  { id: 2, name: 'Order Confirmation',   body: 'Hi {{name}}, your order #{{order_id}} is confirmed. Delivery by {{date}}.' },
  { id: 3, name: 'Promotional Offer',    body: 'Exclusive offer! Get {{discount}}% off. Valid till {{expiry}}. Shop: tzmicha.com' },
  { id: 4, name: 'Appointment Reminder', body: 'Reminder: Your appointment on {{date}} at {{time}}. Reply YES to confirm.' },
];

const STATUS_VARIANT: Record<string, any> = { active: 'success', completed: 'secondary', paused: 'warning', scheduled: 'blue', draft: 'muted' };

function fmt(n: number) { return n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n.toString(); }

export function SmsPage() {
  const [tab, setTab] = useState<'send' | 'bulk' | 'schedule' | 'templates' | 'history'>('history');
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('TZMicha');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const totalSent = smsHistory.reduce((s, c) => s + c.sent, 0);
  const totalDelivered = smsHistory.reduce((s, c) => s + c.delivered, 0);
  const totalFailed = smsHistory.reduce((s, c) => s + c.failed, 0);
  const deliveryRate = totalSent ? Math.round((totalDelivered / totalSent) * 100) : 0;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setTimeout(() => setSent(false), 3000); }, 1200);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMS"
        description="Send bulk SMS, schedule campaigns and manage templates"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'SMS' }]}
        actions={<Button size="md" onClick={() => setTab('bulk')}><Plus className="size-4" /> New SMS Campaign</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent',    value: fmt(totalSent),      icon: <Send className="size-4 text-blue-500" />,         color: 'text-foreground' },
          { label: 'Delivered',     value: fmt(totalDelivered), icon: <CheckCheck className="size-4 text-emerald-500" />, color: 'text-emerald-600' },
          { label: 'Failed',        value: fmt(totalFailed),    icon: <XCircle className="size-4 text-red-500" />,        color: 'text-red-600' },
          { label: 'Delivery Rate', value: deliveryRate + '%',  icon: <MessageSquare className="size-4 text-violet-500" />,color: 'text-violet-600' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <div className="flex items-center gap-2 mb-1">{s.icon}<p className="text-xs text-muted-foreground font-medium">{s.label}</p></div>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {([
          { key: 'history',   label: 'History' },
          { key: 'send',      label: 'Send SMS' },
          { key: 'bulk',      label: 'Bulk SMS' },
          { key: 'schedule',  label: 'Schedule' },
          { key: 'templates', label: 'Templates' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px',
              tab === t.key ? 'border-rose-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>{t.label}</button>
        ))}
      </div>

      {/* History */}
      {tab === 'history' && (
        <Card padding="none">
          <div className="px-5 pt-4 pb-3 border-b border-border flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            <p className="text-sm font-bold text-foreground">SMS Campaign History</p>
          </div>
          <div className="divide-y divide-border">
            {smsHistory.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-foreground">{c.name}</p>
                    <Badge variant={STATUS_VARIANT[c.status]} dot className="text-[10px]">{c.status}</Badge>
                    {c.status === 'scheduled' && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{c.date}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate italic">"{c.message}"</p>
                </div>
                <div className="flex items-center gap-5 shrink-0 text-center">
                  {[
                    { label: 'Sent',      value: fmt(c.sent),      color: 'text-foreground' },
                    { label: 'Delivered', value: fmt(c.delivered), color: 'text-emerald-600' },
                    { label: 'Failed',    value: fmt(c.failed),    color: c.failed > 0 ? 'text-red-500' : 'text-muted-foreground' },
                    { label: 'Pending',   value: fmt(c.pending),   color: 'text-amber-600' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className={cn('text-sm font-bold tabular-nums', s.color)}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Send SMS */}
      {tab === 'send' && (
        <Card padding="lg">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Send className="size-4 text-blue-500" /> Send SMS</p>
          <form onSubmit={handleSend} className="space-y-3 max-w-lg">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">To (Phone Number)</label>
              <input className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Sender ID</label>
              <input value={sender} onChange={e => setSender(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Message ({message.length}/160)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={160}
                className="w-full h-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                placeholder="Type your message..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" type="submit" disabled={sending || !message.trim()}>
                {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Send
              </Button>
              {sent && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCheck className="size-3.5" /> Sent!</span>}
            </div>
          </form>
        </Card>
      )}

      {/* Bulk SMS */}
      {tab === 'bulk' && (
        <Card padding="lg">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><MessageSquare className="size-4 text-blue-500" /> Bulk SMS Campaign</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Campaign Name</label>
                <input className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="e.g. Flash Sale Alert" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Sender ID</label>
                <input value={sender} onChange={e => setSender(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Audience</label>
                <select value={audience} onChange={e => setAudience(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
                  <option value="all">All Contacts (52,100)</option>
                  <option value="active">Active Users (38,400)</option>
                  <option value="inactive">Inactive (13,700)</option>
                  <option value="segment">Custom Segment</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Message ({message.length}/160)</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={160}
                  className="w-full h-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                  placeholder="Use {{name}}, {{otp}} for variables" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1"><Send className="size-3.5" /> Send Campaign</Button>
                <Button size="sm" variant="outline">Save Draft</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Schedule */}
      {tab === 'schedule' && (
        <Card padding="lg">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Clock className="size-4 text-amber-500" /> Schedule SMS</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Campaign Name</label>
              <input className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="e.g. Weekly Newsletter" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Schedule Date & Time</label>
              <input type="datetime-local" className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground mb-1 block">Message</label>
              <textarea className="w-full h-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none" placeholder="Your scheduled message..." />
            </div>
            <div className="sm:col-span-2">
              <Button size="sm"><Clock className="size-3.5" /> Schedule</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Templates */}
      {tab === 'templates' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card padding="lg" className="space-y-3">
                <p className="text-[13px] font-bold text-foreground">{t.name}</p>
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                  <p className="text-xs text-foreground leading-relaxed">{t.body}</p>
                </div>
                <Button size="xs" className="w-full"><Send className="size-3" /> Use Template</Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
