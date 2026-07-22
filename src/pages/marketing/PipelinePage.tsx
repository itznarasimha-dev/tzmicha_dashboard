import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, Users, Percent, Plus, Edit2, Trash2,
  ArrowRight, ChevronRight, Target, BarChart3,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatCurrency } from '@/utils';

type PipelineStage = 'lead' | 'contacted' | 'qualified' | 'demo_scheduled' | 'proposal' | 'negotiation' | 'won' | 'lost';

interface Deal {
  id: number;
  name: string;
  company: string;
  value: number;
  stage: PipelineStage;
  owner: string;
  probability: number;
  closeDate: string;
  source: string;
}

const STAGES: { key: PipelineStage; label: string; color: string; bg: string; textColor: string }[] = [
  { key: 'lead',           label: 'Lead',           color: 'bg-slate-400',   bg: 'bg-slate-50 dark:bg-slate-900/20',   textColor: 'text-slate-600 dark:text-slate-400' },
  { key: 'contacted',      label: 'Contacted',      color: 'bg-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/20',     textColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'qualified',      label: 'Qualified',      color: 'bg-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-950/20', textColor: 'text-indigo-600 dark:text-indigo-400' },
  { key: 'demo_scheduled', label: 'Demo Scheduled', color: 'bg-violet-500',  bg: 'bg-violet-50 dark:bg-violet-950/20', textColor: 'text-violet-600 dark:text-violet-400' },
  { key: 'proposal',       label: 'Proposal',       color: 'bg-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/20',   textColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'negotiation',    label: 'Negotiation',    color: 'bg-orange-500',  bg: 'bg-orange-50 dark:bg-orange-950/20', textColor: 'text-orange-600 dark:text-orange-400' },
  { key: 'won',            label: 'Won',            color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'lost',           label: 'Lost',           color: 'bg-red-500',     bg: 'bg-red-50 dark:bg-red-950/20',       textColor: 'text-red-600 dark:text-red-400' },
];

const STAGE_PROBABILITY: Record<PipelineStage, number> = {
  lead: 10, contacted: 20, qualified: 40, demo_scheduled: 55,
  proposal: 70, negotiation: 85, won: 100, lost: 0,
};

const initialDeals: Deal[] = [
  { id: 1,  name: 'Enterprise CRM Suite',      company: 'TechCorp India',     value: 84000,  stage: 'negotiation',    owner: 'Priya Sharma',  probability: 85, closeDate: '2025-07-30', source: 'Organic Search' },
  { id: 2,  name: 'Marketing Automation Pack', company: 'FinServ Ltd',        value: 42000,  stage: 'proposal',       owner: 'Rahul Mehta',   probability: 70, closeDate: '2025-08-05', source: 'WhatsApp' },
  { id: 3,  name: 'SMS Gateway Integration',   company: 'RetailMax',          value: 18000,  stage: 'demo_scheduled', owner: 'Anita Singh',   probability: 55, closeDate: '2025-08-10', source: 'Email' },
  { id: 4,  name: 'AI Voice Agent License',    company: 'HealthPlus',         value: 36000,  stage: 'qualified',      owner: 'Vikram Nair',   probability: 40, closeDate: '2025-08-15', source: 'Referral' },
  { id: 5,  name: 'WhatsApp Business API',     company: 'EduTech Solutions',  value: 24000,  stage: 'won',            owner: 'Kavya Iyer',    probability: 100, closeDate: '2025-07-20', source: 'LinkedIn' },
  { id: 6,  name: 'RCS Campaign Bundle',       company: 'ManufactPro',        value: 15000,  stage: 'contacted',      owner: 'Priya Sharma',  probability: 20, closeDate: '2025-08-20', source: 'Cold Call' },
  { id: 7,  name: 'Email Marketing Suite',     company: 'PropTech Realty',    value: 28000,  stage: 'lead',           owner: 'Rahul Mehta',   probability: 10, closeDate: '2025-09-01', source: 'Paid Ads' },
  { id: 8,  name: 'Full Platform License',     company: 'CloudSoft Systems',  value: 120000, stage: 'proposal',       owner: 'Anita Singh',   probability: 70, closeDate: '2025-08-12', source: 'Organic Search' },
  { id: 9,  name: 'Startup Growth Pack',       company: 'GreenEnergy Co',     value: 9600,   stage: 'qualified',      owner: 'Vikram Nair',   probability: 40, closeDate: '2025-08-25', source: 'WhatsApp' },
  { id: 10, name: 'Omnichannel Bundle',        company: 'FashionHub',         value: 54000,  stage: 'negotiation',    owner: 'Kavya Iyer',    probability: 85, closeDate: '2025-07-28', source: 'Email' },
  { id: 11, name: 'Basic SMS Plan',            company: 'LocalBiz Co',        value: 4800,   stage: 'lost',           owner: 'Priya Sharma',  probability: 0,  closeDate: '2025-07-15', source: 'Cold Call' },
  { id: 12, name: 'Analytics Dashboard',       company: 'DataDriven Inc',     value: 19200,  stage: 'demo_scheduled', owner: 'Rahul Mehta',   probability: 55, closeDate: '2025-08-08', source: 'Referral' },
];

export function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', value: '', stage: 'lead' as PipelineStage, owner: 'Priya Sharma', closeDate: '', source: 'Organic Search' });

  const totalValue = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0);
  const weightedValue = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + d.value * (d.probability / 100), 0);
  const winRate = deals.length ? Math.round((deals.filter(d => d.stage === 'won').length / deals.filter(d => d.stage === 'won' || d.stage === 'lost').length) * 100) : 0;

  function addDeal(e: React.FormEvent) {
    e.preventDefault();
    setDeals(prev => [...prev, {
      id: Date.now(), name: form.name, company: form.company,
      value: parseFloat(form.value) || 0, stage: form.stage,
      owner: form.owner, probability: STAGE_PROBABILITY[form.stage],
      closeDate: form.closeDate || '2025-09-01', source: form.source,
    }]);
    setForm({ name: '', company: '', value: '', stage: 'lead', owner: 'Priya Sharma', closeDate: '', source: 'Organic Search' });
    setShowAdd(false);
  }

  function moveStage(id: number, stage: PipelineStage) {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage, probability: STAGE_PROBABILITY[stage] } : d));
  }

  function deleteDeal(id: number) {
    setDeals(prev => prev.filter(d => d.id !== id));
  }

  const stageConfig = (key: PipelineStage) => STAGES.find(s => s.key === key)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        description="Marketing pipeline — track deals from lead to close"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Pipeline' }]}
        actions={
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(['kanban', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn('px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                    view === v ? 'bg-foreground text-background' : 'bg-background text-muted-foreground hover:bg-muted'
                  )}>{v}</button>
              ))}
            </div>
            <Button size="md" onClick={() => setShowAdd(p => !p)}><Plus className="size-4" /> Add Deal</Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Value',   value: formatCurrency(totalValue),    icon: <DollarSign className="size-4 text-blue-500" />,    color: 'text-foreground' },
          { label: 'Won Revenue',      value: formatCurrency(wonValue),      icon: <TrendingUp className="size-4 text-emerald-500" />, color: 'text-emerald-600' },
          { label: 'Weighted Value',   value: formatCurrency(weightedValue), icon: <Target className="size-4 text-violet-500" />,      color: 'text-violet-600' },
          { label: 'Win Rate',         value: winRate + '%',                 icon: <Percent className="size-4 text-amber-500" />,      color: 'text-amber-600' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card padding="md">
              <div className="flex items-center gap-2 mb-1">{s.icon}<p className="text-xs text-muted-foreground font-medium">{s.label}</p></div>
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stage summary bar */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-4 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">Stage Overview</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {STAGES.map(s => {
            const stageDeals = deals.filter(d => d.stage === s.key);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            return (
              <div key={s.key} className={cn('rounded-xl p-3 text-center border border-border/50', s.bg)}>
                <div className={cn('size-2 rounded-full mx-auto mb-2', s.color)} />
                <p className={cn('text-xs font-bold', s.textColor)}>{stageDeals.length}</p>
                <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">{s.label}</p>
                {stageValue > 0 && <p className="text-[9px] text-muted-foreground mt-0.5">{formatCurrency(stageValue)}</p>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add deal form */}
      {showAdd && (
        <Card padding="lg">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Plus className="size-4 text-violet-500" /> New Deal
          </p>
          <form onSubmit={addDeal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Deal Name *', key: 'name', placeholder: 'e.g. Enterprise CRM Suite', required: true },
              { label: 'Company',     key: 'company', placeholder: 'e.g. TechCorp India' },
              { label: 'Value ($)',   key: 'value', placeholder: 'e.g. 50000', type: 'number' },
              { label: 'Close Date',  key: 'closeDate', type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-foreground mb-1 block">{f.label}</label>
                <input required={f.required} type={f.type || 'text'} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
              </div>
            ))}
            {[
              { label: 'Stage', key: 'stage', options: STAGES.map(s => ({ value: s.key, label: s.label })) },
              { label: 'Owner', key: 'owner', options: ['Priya Sharma', 'Rahul Mehta', 'Anita Singh', 'Vikram Nair', 'Kavya Iyer'].map(o => ({ value: o, label: o })) },
              { label: 'Source', key: 'source', options: ['Organic Search', 'WhatsApp', 'Email', 'Paid Ads', 'Referral', 'LinkedIn', 'Cold Call'].map(o => ({ value: o, label: o })) },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-foreground mb-1 block">{f.label}</label>
                <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
            <div className="sm:col-span-2 lg:col-span-3 flex gap-2 pt-1">
              <Button size="sm" type="submit">Add Deal</Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {STAGES.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage.key);
              const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
              return (
                <div key={stage.key} className="w-64 shrink-0">
                  <div className={cn('flex items-center justify-between px-3 py-2 rounded-t-xl border border-b-0 border-border/50', stage.bg)}>
                    <div className="flex items-center gap-2">
                      <div className={cn('size-2 rounded-full', stage.color)} />
                      <span className={cn('text-xs font-bold', stage.textColor)}>{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground font-semibold">{stageDeals.length}</span>
                      {stageValue > 0 && <span className="text-[10px] text-muted-foreground">· {formatCurrency(stageValue)}</span>}
                    </div>
                  </div>
                  <div className="border border-border/50 rounded-b-xl bg-muted/10 min-h-[200px] p-2 space-y-2">
                    {stageDeals.map((deal, i) => (
                      <motion.div key={deal.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <div className="bg-card border border-border rounded-xl p-3 shadow-card hover:shadow-elevated transition-shadow cursor-pointer group">
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <p className="text-[12px] font-semibold text-foreground leading-snug group-hover:text-rose-600 transition-colors">{deal.name}</p>
                            <button onClick={() => deleteDeal(deal.id)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Trash2 className="size-3 text-red-400" />
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-2">{deal.company}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">{formatCurrency(deal.value)}</span>
                            <span className={cn('text-[10px] font-semibold', deal.probability >= 70 ? 'text-emerald-600' : deal.probability >= 40 ? 'text-amber-600' : 'text-muted-foreground')}>
                              {deal.probability}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Avatar name={deal.owner} size="xs" />
                              <span className="text-[10px] text-muted-foreground">{deal.owner.split(' ')[0]}</span>
                            </div>
                            {/* Move to next stage */}
                            {stage.key !== 'won' && stage.key !== 'lost' && (
                              <button
                                onClick={() => {
                                  const idx = STAGES.findIndex(s => s.key === stage.key);
                                  if (idx < STAGES.length - 1) moveStage(deal.id, STAGES[idx + 1].key);
                                }}
                                className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                title="Move to next stage"
                              >
                                <ChevronRight className="size-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="flex items-center justify-center h-16 text-[10px] text-muted-foreground/50">No deals</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Deal', 'Company', 'Value', 'Stage', 'Probability', 'Owner', 'Close Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deals.map((deal, i) => {
                  const sc = stageConfig(deal.stage);
                  return (
                    <motion.tr key={deal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{deal.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{deal.company}</td>
                      <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{formatCurrency(deal.value)}</td>
                      <td className="px-4 py-3">
                        <select value={deal.stage} onChange={e => moveStage(deal.id, e.target.value as PipelineStage)}
                          className={cn('h-6 rounded-md px-2 text-[10px] font-semibold border-0 focus:outline-none cursor-pointer', sc.bg, sc.textColor)}>
                          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={cn('h-full rounded-full', deal.probability >= 70 ? 'bg-emerald-500' : deal.probability >= 40 ? 'bg-amber-500' : 'bg-blue-500')}
                              style={{ width: `${deal.probability}%` }} />
                          </div>
                          <span className="font-semibold text-foreground tabular-nums">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Avatar name={deal.owner} size="xs" />
                          <span className="text-muted-foreground">{deal.owner}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{deal.closeDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="flex size-6 items-center justify-center rounded hover:bg-muted transition-colors">
                            <Edit2 className="size-3 text-muted-foreground" />
                          </button>
                          <button onClick={() => deleteDeal(deal.id)} className="flex size-6 items-center justify-center rounded hover:bg-red-50 transition-colors">
                            <Trash2 className="size-3 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Conversion funnel */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="size-4 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">Stage Conversion</p>
        </div>
        <div className="flex items-end gap-2 flex-wrap">
          {STAGES.filter(s => s.key !== 'lost').map((stage, i, arr) => {
            const count = deals.filter(d => d.stage === stage.key).length;
            const prevCount = i > 0 ? deals.filter(d => d.stage === arr[i - 1].key).length : count;
            const convPct = prevCount > 0 && i > 0 ? Math.round((count / prevCount) * 100) : 100;
            return (
              <div key={stage.key} className="flex items-center gap-2">
                <div className="text-center">
                  <div className={cn('flex items-center justify-center rounded-xl font-black text-white text-sm', stage.color)}
                    style={{ width: 48, height: Math.max(24, count * 8 + 24) }}>
                    {count}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">{stage.label}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex flex-col items-center mb-5">
                    <ChevronRight className="size-3 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">{convPct}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
