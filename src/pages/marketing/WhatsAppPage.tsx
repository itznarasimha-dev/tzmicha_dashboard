import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Plus, CheckCheck, Eye, ThumbsUp, XCircle, Image, FileText, Radio } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

const campaigns = [
  { id: 1, name: 'Diwali Promo Blast',   template: 'Promotional Offer',  sent: 84200, delivered: 82100, read: 71400, replied: 12800, failed: 2100, status: 'completed' },
  { id: 2, name: 'Order Confirmations',  template: 'Order Confirmation', sent: 62400, delivered: 62100, read: 62100, replied: 4200,  failed: 300,  status: 'active' },
  { id: 3, name: 'Shipping Alerts',      template: 'Shipping Update',    sent: 48100, delivered: 47800, read: 44200, replied: 1800,  failed: 300,  status: 'active' },
  { id: 4, name: 'Re-engagement Flow',   template: 'Promotional Offer',  sent: 21000, delivered: 20400, read: 14200, replied: 3100,  failed: 600,  status: 'paused' },
];

const templates = [
  { id: 1, name: 'Order Confirmation',   category: 'TRANSACTIONAL', status: 'approved', preview: 'Hi {{1}}, your order #{{2}} is confirmed. Expected delivery: {{3}}.' },
  { id: 2, name: 'Shipping Update',      category: 'TRANSACTIONAL', status: 'approved', preview: 'Your order #{{1}} has been shipped! Track here: {{2}}' },
  { id: 3, name: 'Promotional Offer',    category: 'MARKETING',     status: 'approved', preview: 'Exclusive offer for you! Get {{1}}% off. Valid till {{2}}. Shop: {{3}}' },
  { id: 4, name: 'Appointment Reminder', category: 'UTILITY',       status: 'pending',  preview: 'Reminder: Your appointment on {{1}} at {{2}}. Reply CONFIRM or CANCEL.' },
  { id: 5, name: 'Welcome Message',      category: 'MARKETING',     status: 'approved', preview: 'Welcome to TZMicha, {{1}}! Start exploring: {{2}}' },
];

const scheduled = [
  { id: 1, name: 'Weekend Flash Sale',   template: 'Promotional Offer',  audience: 'All Contacts (52K)', scheduledAt: '2025-07-20 10:00 AM' },
  { id: 2, name: 'Appointment Reminder', template: 'Appointment Reminder', audience: 'Booked Users (8.4K)', scheduledAt: '2025-07-21 09:00 AM' },
];

const STATUS_VARIANT: Record<string, any> = { active: 'success', completed: 'secondary', paused: 'warning', approved: 'success', pending: 'warning' };
const CATEGORY_COLOR: Record<string, string> = {
  TRANSACTIONAL: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
  MARKETING: 'text-violet-600 bg-violet-50 dark:bg-violet-950/20',
  UTILITY: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20',
};

function fmt(n: number) { return n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n.toString(); }

export function WhatsAppPage() {
  const [tab, setTab] = useState<'campaigns' | 'broadcast' | 'templates' | 'scheduled'>('campaigns');

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalRead = campaigns.reduce((s, c) => s + c.read, 0);
  const totalReplied = campaigns.reduce((s, c) => s + c.replied, 0);
  const totalFailed = campaigns.reduce((s, c) => s + c.failed, 0);
  const readRate = totalSent ? Math.round((totalRead / totalSent) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp"
        description="WhatsApp Business API — broadcasts, templates and scheduled messages"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'WhatsApp' }]}
        actions={<Button size="md"><Plus className="size-4" /> New Campaign</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent',  value: fmt(totalSent),    icon: <Send className="size-4 text-green-500" />,         color: 'text-foreground' },
          { label: 'Read Rate',   value: readRate + '%',    icon: <Eye className="size-4 text-blue-500" />,           color: 'text-blue-600' },
          { label: 'Replies',     value: fmt(totalReplied), icon: <MessageCircle className="size-4 text-violet-500" />, color: 'text-violet-600' },
          { label: 'Failed',      value: fmt(totalFailed),  icon: <XCircle className="size-4 text-red-500" />,        color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <div className="flex items-center gap-2 mb-1">{s.icon}<p className="text-xs text-muted-foreground font-medium">{s.label}</p></div>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {([
          { key: 'campaigns',  label: 'Campaigns' },
          { key: 'broadcast',  label: 'Broadcast' },
          { key: 'templates',  label: 'Templates' },
          { key: 'scheduled',  label: 'Scheduled' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px',
              tab === t.key ? 'border-rose-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>{t.label}</button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <Card padding="none">
          <div className="divide-y divide-border">
            {campaigns.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-foreground">{c.name}</p>
                    <Badge variant={STATUS_VARIANT[c.status]} dot className="text-[10px]">{c.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Template: {c.template}</p>
                </div>
                <div className="flex items-center gap-5 shrink-0 text-center">
                  {[
                    { label: 'Sent',      value: fmt(c.sent),      icon: <Send className="size-3 text-muted-foreground" /> },
                    { label: 'Delivered', value: fmt(c.delivered), icon: <CheckCheck className="size-3 text-emerald-500" /> },
                    { label: 'Read',      value: fmt(c.read),      icon: <Eye className="size-3 text-blue-500" /> },
                    { label: 'Replied',   value: fmt(c.replied),   icon: <ThumbsUp className="size-3 text-violet-500" /> },
                    { label: 'Failed',    value: fmt(c.failed),    icon: <XCircle className="size-3 text-red-500" /> },
                  ].map(s => (
                    <div key={s.label} className="flex flex-col items-center">
                      {s.icon}
                      <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'broadcast' && (
        <Card padding="lg">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Radio className="size-4 text-green-500" /> New Broadcast</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Broadcast Name</label>
              <input className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="e.g. Weekend Flash Sale" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Template</label>
              <select className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
                {templates.filter(t => t.status === 'approved').map(t => <option key={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Audience</label>
              <select className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
                <option>All Contacts (52,100)</option>
                <option>Active Users (38,400)</option>
                <option>Custom Segment</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Media (optional)</label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1"><Image className="size-3.5" /> Image</Button>
                <Button size="sm" variant="outline" className="flex-1"><FileText className="size-3.5" /> Document</Button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button size="sm"><Send className="size-3.5" /> Send Broadcast</Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'templates' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card padding="lg" className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-bold text-foreground">{t.name}</p>
                  <Badge variant={STATUS_VARIANT[t.status]} dot className="text-[10px] shrink-0">{t.status}</Badge>
                </div>
                <span className={cn('inline-block text-[10px] font-bold px-2 py-0.5 rounded-md', CATEGORY_COLOR[t.category])}>{t.category}</span>
                <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageCircle className="size-3 text-green-600" />
                    <span className="text-[10px] font-semibold text-green-700 dark:text-green-400">Preview</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{t.preview}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="outline" className="flex-1"><Image className="size-3" /> Add Media</Button>
                  <Button size="xs" className="flex-1"><Send className="size-3" /> Use Template</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'scheduled' && (
        <Card padding="none">
          <div className="px-5 pt-4 pb-3 border-b border-border">
            <p className="text-sm font-bold text-foreground">Scheduled Messages</p>
          </div>
          <div className="divide-y divide-border">
            {scheduled.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Template: {s.template} · {s.audience}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="blue" dot className="text-[10px]">{s.scheduledAt}</Badge>
                  <Button size="xs" variant="outline">Edit</Button>
                  <Button size="xs" variant="outline">Cancel</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
