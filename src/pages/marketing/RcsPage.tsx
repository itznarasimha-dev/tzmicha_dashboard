import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Image, MousePointer, Send, Eye, LayoutTemplate, Video, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

const campaigns = [
  { id: 1, name: 'Product Showcase Card',  type: 'Rich Card',     status: 'active',    sent: 42000, delivered: 41200, read: 34800, clicked: 8200 },
  { id: 2, name: 'Carousel Promo',         type: 'Carousel',      status: 'completed', sent: 28400, delivered: 27900, read: 22100, clicked: 6400 },
  { id: 3, name: 'Quick Reply Survey',     type: 'Quick Reply',   status: 'active',    sent: 18200, delivered: 17900, read: 15400, clicked: 4100 },
  { id: 4, name: 'App Install Campaign',   type: 'Rich Card',     status: 'paused',    sent: 6400,  delivered: 6200,  read: 4800,  clicked: 1200 },
  { id: 5, name: 'Video Product Demo',     type: 'Video',         status: 'draft',     sent: 0,     delivered: 0,     read: 0,     clicked: 0 },
];

const richFeatures = [
  { icon: <Image className="size-5 text-violet-500" />,        title: 'Rich Cards',          desc: 'Image, title, description and action buttons in one message' },
  { icon: <LayoutTemplate className="size-5 text-blue-500" />, title: 'Carousels',           desc: 'Swipeable cards for product showcases and multi-option flows' },
  { icon: <MousePointer className="size-5 text-emerald-500" />,title: 'Suggested Actions',   desc: 'Tap-to-call, open URL, share location quick reply buttons' },
  { icon: <Video className="size-5 text-rose-500" />,          title: 'Video Messages',      desc: 'Embed video content directly in the message thread' },
  { icon: <Sparkles className="size-5 text-amber-500" />,      title: 'Verified Sender',     desc: 'Brand logo, name and verified checkmark builds trust' },
  { icon: <CheckCheck className="size-5 text-cyan-500" />,     title: 'Read Receipts',       desc: 'Know exactly when your message was read by the recipient' },
];

const STATUS_VARIANT: Record<string, any> = { active: 'success', completed: 'secondary', paused: 'warning', draft: 'muted' };
function fmt(n: number) { return n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n.toString(); }

export function RcsPage() {
  const [tab, setTab] = useState<'campaigns' | 'create' | 'analytics'>('campaigns');

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0);
  const totalRead = campaigns.reduce((s, c) => s + c.read, 0);
  const ctr = totalSent ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <PageHeader
        title="RCS"
        description="Rich Communication Services — next-gen messaging with rich media, carousels and videos"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'RCS' }]}
        actions={<Button size="md"><Plus className="size-4" /> New RCS Campaign</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent',   value: fmt(totalSent),    color: 'text-foreground' },
          { label: 'Total Read',   value: fmt(totalRead),    color: 'text-blue-600' },
          { label: 'Total Clicks', value: fmt(totalClicked), color: 'text-violet-600' },
          { label: 'Avg CTR',      value: ctr + '%',         color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {richFeatures.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card padding="md" className="text-center space-y-2">
              <div className="flex justify-center">{f.icon}</div>
              <p className="text-xs font-bold text-foreground">{f.title}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {([
          { key: 'campaigns', label: 'Campaigns' },
          { key: 'create',    label: 'Create Campaign' },
          { key: 'analytics', label: 'Analytics' },
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
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 font-semibold">{c.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 shrink-0 text-center">
                  {[
                    { label: 'Sent',    value: fmt(c.sent),    color: 'text-foreground' },
                    { label: 'Read',    value: fmt(c.read),    color: 'text-blue-600' },
                    { label: 'Clicked', value: fmt(c.clicked), color: 'text-violet-600' },
                    { label: 'CTR',     value: c.sent ? ((c.clicked / c.sent) * 100).toFixed(1) + '%' : '—', color: 'text-emerald-600' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className={cn('text-sm font-bold tabular-nums', s.color)}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="xs" variant="outline">Edit</Button>
                  <Button size="xs" variant="outline">Duplicate</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'create' && (
        <Card padding="lg">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Sparkles className="size-4 text-violet-500" /> Create RCS Campaign</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Campaign Name</label>
              <input className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="e.g. Product Showcase" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Message Type</label>
              <select className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
                <option>Rich Card</option>
                <option>Carousel</option>
                <option>Quick Reply</option>
                <option>Video</option>
                <option>Text with Buttons</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Audience</label>
              <select className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
                <option>All Contacts (52,100)</option>
                <option>Premium Users (12,400)</option>
                <option>Custom Segment</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Media</label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1"><Image className="size-3.5" /> Image</Button>
                <Button size="sm" variant="outline" className="flex-1"><Video className="size-3.5" /> Video</Button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground mb-1 block">Message Body</label>
              <textarea className="w-full h-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none" placeholder="Your rich message content..." />
            </div>
            <div className="sm:col-span-2">
              <Button size="sm"><Send className="size-3.5" /> Launch Campaign</Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'analytics' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {campaigns.filter(c => c.sent > 0).map((c, i) => {
            const readRate = c.sent ? Math.round((c.read / c.sent) * 100) : 0;
            const ctrVal = c.sent ? ((c.clicked / c.sent) * 100).toFixed(1) : '0';
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Card padding="lg" className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-foreground">{c.name}</p>
                    <Badge variant={STATUS_VARIANT[c.status]} dot className="text-[10px] shrink-0">{c.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Read Rate', value: readRate, color: 'bg-blue-500' },
                      { label: 'CTR',       value: parseFloat(ctrVal), color: 'bg-violet-500' },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[10px] text-muted-foreground">{m.label}</span>
                          <span className="text-[10px] font-bold text-foreground">{m.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={cn('h-full rounded-full', m.color)} style={{ width: `${m.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
