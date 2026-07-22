import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone, Plus, Play, Pause, Square, Copy, Archive,
  Mail, MessageSquare, Phone, Bot, Sparkles, Eye, MousePointer,
  Target, DollarSign, Calendar, ChevronDown, ChevronUp, Loader2, TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn, formatNumber, formatCurrency } from '@/utils';

type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft' | 'stopped';
type CampaignChannel = 'email' | 'whatsapp' | 'sms' | 'rcs' | 'ai_voice';

interface Campaign {
  id: number;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: string;
  budget: number;
  spent: number;
  schedule: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
}

const CHANNEL_ICON: Record<CampaignChannel, React.ReactNode> = {
  email:    <Mail className="size-3.5 text-amber-500" />,
  whatsapp: <MessageSquare className="size-3.5 text-green-500" />,
  sms:      <MessageSquare className="size-3.5 text-blue-500" />,
  rcs:      <Sparkles className="size-3.5 text-violet-500" />,
  ai_voice: <Phone className="size-3.5 text-rose-500" />,
};

const CHANNEL_LABEL: Record<CampaignChannel, string> = {
  email: 'Email', whatsapp: 'WhatsApp', sms: 'SMS', rcs: 'RCS', ai_voice: 'AI Voice',
};

const STATUS_VARIANT: Record<CampaignStatus, any> = {
  active: 'success', paused: 'warning', completed: 'secondary', draft: 'muted', stopped: 'danger',
};

const initialCampaigns: Campaign[] = [
  { id: 1, name: 'Q3 Flash Sale Blast',      channel: 'whatsapp', status: 'active',    audience: 'All Contacts (52K)',   budget: 5000,  spent: 2840,  schedule: 'Jul 15 – Jul 22', sent: 48200, delivered: 47100, opened: 42800, clicked: 12400, converted: 1840 },
  { id: 2, name: 'New User Onboarding',       channel: 'email',    status: 'active',    audience: 'New Signups (8.4K)',   budget: 800,   spent: 420,   schedule: 'Ongoing',          sent: 8400,  delivered: 8200,  opened: 5900,  clicked: 3200,  converted: 980 },
  { id: 3, name: 'Abandoned Cart Recovery',   channel: 'sms',      status: 'active',    audience: 'Cart Abandoned (18K)', budget: 1200,  spent: 680,   schedule: 'Ongoing',          sent: 18400, delivered: 18100, opened: 18100, clicked: 6200,  converted: 720 },
  { id: 4, name: 'Product Launch — RCS',      channel: 'rcs',      status: 'paused',    audience: 'Premium Users (42K)',  budget: 4200,  spent: 1980,  schedule: 'Jul 10 – Jul 30',  sent: 42000, delivered: 41200, opened: 34800, clicked: 8200,  converted: 1240 },
  { id: 5, name: 'Re-engagement Voice',       channel: 'ai_voice', status: 'paused',    audience: 'Inactive 30d (12K)',   budget: 2400,  spent: 840,   schedule: 'Jul 8 – Jul 20',   sent: 2840,  delivered: 1920,  opened: 1920,  clicked: 0,     converted: 284 },
  { id: 6, name: 'Weekly Newsletter',         channel: 'email',    status: 'completed', audience: 'Subscribers (42K)',    budget: 600,   spent: 600,   schedule: 'Jul 1 – Jul 7',    sent: 42100, delivered: 41200, opened: 11200, clicked: 2100,  converted: 380 },
  { id: 7, name: 'OTP Verification Flow',     channel: 'sms',      status: 'active',    audience: 'All Users (84K)',      budget: 1800,  spent: 920,   schedule: 'Ongoing',          sent: 84200, delivered: 83900, opened: 83900, clicked: 0,     converted: 0 },
  { id: 8, name: 'Diwali Promo Draft',        channel: 'whatsapp', status: 'draft',     audience: 'All Contacts (52K)',   budget: 6000,  spent: 0,     schedule: 'Not scheduled',    sent: 0,     delivered: 0,     opened: 0,     clicked: 0,     converted: 0 },
];

const CHANNELS: CampaignChannel[] = ['email', 'whatsapp', 'sms', 'rcs', 'ai_voice'];
const STATUSES: CampaignStatus[] = ['active', 'paused', 'completed', 'draft', 'stopped'];

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', channel: 'email' as CampaignChannel, audience: '', budget: '', schedule: '' });

  const filtered = campaigns.filter(c =>
    (filterStatus === 'all' || c.status === filterStatus) &&
    (filterChannel === 'all' || c.channel === filterChannel)
  );

  function toggleStatus(id: number, action: 'pause' | 'resume' | 'stop') {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next: CampaignStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'stopped';
      return { ...c, status: next };
    }));
  }

  function duplicate(c: Campaign) {
    setCampaigns(prev => [...prev, { ...c, id: Date.now(), name: c.name + ' (Copy)', status: 'draft', sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, spent: 0 }]);
  }

  function archive(id: number) {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setTimeout(() => {
      setCampaigns(prev => [...prev, {
        id: Date.now(), name: form.name, channel: form.channel,
        status: 'draft', audience: form.audience || 'All Contacts',
        budget: parseFloat(form.budget) || 0, spent: 0,
        schedule: form.schedule || 'Not scheduled',
        sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0,
      }]);
      setForm({ name: '', channel: 'email', audience: '', budget: '', schedule: '' });
      setShowCreate(false);
      setCreating(false);
    }, 600);
  }

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalConverted = campaigns.reduce((s, c) => s + c.converted, 0);
  const activeCnt = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create, manage and track all marketing campaigns"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Campaigns' }]}
        actions={<Button size="md" onClick={() => setShowCreate(p => !p)}><Plus className="size-4" /> New Campaign</Button>}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Campaigns', value: activeCnt,                          color: 'text-emerald-600' },
          { label: 'Total Sent',       value: formatNumber(totalSent),            color: 'text-blue-600' },
          { label: 'Total Converted',  value: formatNumber(totalConverted),       color: 'text-violet-600' },
          { label: 'Total Budget',     value: formatCurrency(campaigns.reduce((s, c) => s + c.budget, 0)), color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <Card padding="lg">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Megaphone className="size-4 text-violet-500" /> New Campaign
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Campaign Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="e.g. Q3 Flash Sale" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Channel *</label>
                <select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value as CampaignChannel }))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
                  {CHANNELS.map(c => <option key={c} value={c}>{CHANNEL_LABEL[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Audience</label>
                <input value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="e.g. All Contacts (52K)" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Budget ($)</label>
                <input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="e.g. 5000" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground mb-1 block">Schedule</label>
                <input value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="e.g. Jul 20 – Jul 27 or Ongoing" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" type="submit" disabled={creating}>
                {creating && <Loader2 className="size-3.5 animate-spin" />} Create Campaign
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize',
                filterStatus === s ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:bg-muted'
              )}>{s === 'all' ? 'All Status' : s}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', ...CHANNELS].map(c => (
            <button key={c} onClick={() => setFilterChannel(c)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                filterChannel === c ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:bg-muted'
              )}>{c === 'all' ? 'All Channels' : CHANNEL_LABEL[c as CampaignChannel]}</button>
          ))}
        </div>
      </div>

      {/* Campaign list */}
      <div className="space-y-3">
        {filtered.map((c, i) => {
          const deliveryRate = c.sent ? Math.round((c.delivered / c.sent) * 100) : 0;
          const openRate = c.delivered ? Math.round((c.opened / c.delivered) * 100) : 0;
          const ctr = c.delivered ? ((c.clicked / c.delivered) * 100).toFixed(1) : '0';
          const convRate = c.sent ? ((c.converted / c.sent) * 100).toFixed(1) : '0';
          const budgetPct = c.budget ? Math.round((c.spent / c.budget) * 100) : 0;
          const isExpanded = expanded === c.id;

          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card padding="none">
                {/* Header row */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted shrink-0">
                    {CHANNEL_ICON[c.channel]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-foreground">{c.name}</p>
                      <Badge variant={STATUS_VARIANT[c.status]} dot className="text-[10px]">{c.status}</Badge>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">{CHANNEL_LABEL[c.channel]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Target className="size-3" />{c.audience}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="size-3" />{c.schedule}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><DollarSign className="size-3" />{formatCurrency(c.budget)}</span>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="hidden md:flex items-center gap-5 shrink-0 text-center">
                    {[
                      { label: 'Sent',      value: formatNumber(c.sent),      color: 'text-foreground' },
                      { label: 'Delivered', value: deliveryRate + '%',         color: 'text-emerald-600' },
                      { label: 'Opened',    value: openRate + '%',             color: 'text-blue-600' },
                      { label: 'CTR',       value: ctr + '%',                  color: 'text-violet-600' },
                      { label: 'Conv.',     value: convRate + '%',             color: 'text-amber-600' },
                    ].map(s => (
                      <div key={s.label}>
                        <p className={cn('text-sm font-bold tabular-nums', s.color)}>{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {c.status === 'active' && (
                      <button onClick={() => toggleStatus(c.id, 'pause')} title="Pause"
                        className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                        <Pause className="size-3.5 text-muted-foreground" />
                      </button>
                    )}
                    {c.status === 'paused' && (
                      <button onClick={() => toggleStatus(c.id, 'resume')} title="Resume"
                        className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                        <Play className="size-3.5 text-muted-foreground" />
                      </button>
                    )}
                    {(c.status === 'active' || c.status === 'paused') && (
                      <button onClick={() => toggleStatus(c.id, 'stop')} title="Stop"
                        className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-red-50 hover:border-red-200 transition-colors">
                        <Square className="size-3.5 text-red-500" />
                      </button>
                    )}
                    <button onClick={() => duplicate(c)} title="Duplicate"
                      className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                      <Copy className="size-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => archive(c.id)} title="Archive"
                      className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                      <Archive className="size-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => setExpanded(isExpanded ? null : c.id)}
                      className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                      {isExpanded ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-4 space-y-4">
                    {/* Budget progress */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">Budget Used</span>
                        <span className="text-xs font-bold text-foreground">{formatCurrency(c.spent)} / {formatCurrency(c.budget)} ({budgetPct}%)</span>
                      </div>
                      <Progress value={budgetPct} size="sm" color={budgetPct > 90 ? 'red' : 'rose'} />
                    </div>

                    {/* Full stats grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {[
                        { label: 'Sent',        value: c.sent.toLocaleString(),      color: 'text-foreground',   icon: <Bot className="size-3 text-muted-foreground" /> },
                        { label: 'Delivered',   value: c.delivered.toLocaleString(), color: 'text-emerald-600',  icon: <Eye className="size-3 text-emerald-500" /> },
                        { label: 'Opened',      value: c.opened.toLocaleString(),    color: 'text-blue-600',     icon: <Eye className="size-3 text-blue-500" /> },
                        { label: 'Clicked',     value: c.clicked.toLocaleString(),   color: 'text-violet-600',   icon: <MousePointer className="size-3 text-violet-500" /> },
                        { label: 'Converted',   value: c.converted.toLocaleString(), color: 'text-amber-600',    icon: <Target className="size-3 text-amber-500" /> },
                        { label: 'Conv. Rate',  value: convRate + '%',               color: 'text-rose-600',     icon: <TrendingUp className="size-3 text-rose-500" /> },
                      ].map(s => (
                        <div key={s.label} className="text-center bg-muted/30 rounded-lg py-2.5 border border-border/40">
                          <div className="flex justify-center mb-1">{s.icon}</div>
                          <p className={cn('text-base font-black tabular-nums', s.color)}>{s.value}</p>
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
