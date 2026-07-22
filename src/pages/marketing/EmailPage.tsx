import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Plus, Eye, MousePointer, Send, UserMinus, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/utils';

const campaigns = [
  { id: 1, name: 'Q2 Product Launch',      subject: 'Introducing TZMicha v2 — Faster, Smarter, Better', status: 'active',    sent: 48200, opened: 14600, clicked: 3800, unsubscribed: 42 },
  { id: 2, name: 'Weekly Digest #12',      subject: 'This week: new features, tips & community highlights', status: 'completed', sent: 42100, opened: 11200, clicked: 2100, unsubscribed: 28 },
  { id: 3, name: 'Abandoned Cart Series',  subject: 'You left something behind 👀',                        status: 'active',    sent: 18400, opened: 7200,  clicked: 2900, unsubscribed: 14 },
  { id: 4, name: 'Re-engagement Campaign', subject: 'We miss you! Here\'s 20% off to come back',           status: 'paused',    sent: 12800, opened: 2400,  clicked: 480,  unsubscribed: 96 },
  { id: 5, name: 'Onboarding Day 1',       subject: 'Welcome! Here\'s how to get started',                 status: 'active',    sent: 8400,  opened: 5900,  clicked: 3200, unsubscribed: 8 },
];

const statusVariant: Record<string, any> = { active: 'success', completed: 'secondary', paused: 'warning', draft: 'muted' };
function fmt(n: number) { return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString(); }

export function EmailPage() {
  const [showCompose, setShowCompose] = useState(false);

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0);
  const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0);
  const openRate = totalSent ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const ctr = totalSent ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email"
        description="Email campaigns, newsletters and automated sequences"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Email' }]}
        actions={<Button size="md" onClick={() => setShowCompose(p => !p)}><Plus className="size-4" /> New Email Campaign</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent',  value: fmt(totalSent),    icon: <Send className="size-4 text-blue-500" />,        color: 'text-foreground' },
          { label: 'Open Rate',   value: openRate + '%',    icon: <Eye className="size-4 text-emerald-500" />,      color: 'text-emerald-600' },
          { label: 'Click Rate',  value: ctr + '%',         icon: <MousePointer className="size-4 text-violet-500" />, color: 'text-violet-600' },
          { label: 'Unsubscribes',value: campaigns.reduce((s, c) => s + c.unsubscribed, 0).toString(), icon: <UserMinus className="size-4 text-red-500" />, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <div className="flex items-center gap-2 mb-1">{s.icon}<p className="text-xs text-muted-foreground font-medium">{s.label}</p></div>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {showCompose && (
        <Card padding="lg">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Mail className="size-4 text-blue-500" /> New Email Campaign</p>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Campaign Name</label>
                <input className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="e.g. Q3 Newsletter" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">From Name</label>
                <input className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" defaultValue="TZMicha Team" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Subject Line</label>
                <input className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="Your email subject..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Audience</label>
                <select className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
                  <option>All Subscribers (52,100)</option>
                  <option>Active Users (38,400)</option>
                  <option>Custom Segment</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Preview Text</label>
              <input className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="Short preview shown in inbox..." />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm"><Send className="size-3.5" /> Send Campaign</Button>
              <Button size="sm" variant="outline">Save as Draft</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <Card padding="none">
        <div className="px-5 pt-5 pb-3 border-b border-border flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">Email Campaigns</p>
        </div>
        <div className="divide-y divide-border">
          {campaigns.map((c, i) => {
            const openRate = ((c.opened / c.sent) * 100).toFixed(1);
            const ctr = ((c.clicked / c.sent) * 100).toFixed(1);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-[13px] font-semibold text-foreground">{c.name}</p>
                      <Badge variant={statusVariant[c.status]} dot className="text-[10px]">{c.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground italic truncate">"{c.subject}"</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-center">
                    <div><p className="text-sm font-bold text-foreground tabular-nums">{fmt(c.sent)}</p><p className="text-[10px] text-muted-foreground">Sent</p></div>
                    <div><p className="text-sm font-bold text-emerald-600 tabular-nums">{openRate}%</p><p className="text-[10px] text-muted-foreground">Open</p></div>
                    <div><p className="text-sm font-bold text-violet-600 tabular-nums">{ctr}%</p><p className="text-[10px] text-muted-foreground">CTR</p></div>
                  </div>
                </div>
                <Progress value={parseFloat(openRate)} size="sm" color="rose" />
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
