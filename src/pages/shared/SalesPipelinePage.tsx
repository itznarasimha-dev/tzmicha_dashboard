import { useState } from 'react';
import { Plus, DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDeals, useUpdateDeal } from '@/hooks';
import { CreateDealModal } from '@/components/forms/FormModals';

const stageColor: Record<string, string> = {
  lead:        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  qualified:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  proposal:    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  negotiation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  closed_won:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed_lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function SalesPipelinePage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useDeals({ limit: 50 });
  const { mutate: updateDeal } = useUpdateDeal();
  const deals = data?.data ?? [];

  const active     = deals.filter((d: any) => !['closed_won','closed_lost'].includes(d.stage));
  const closedWon  = deals.filter((d: any) => d.stage === 'closed_won');
  const closedLost = deals.filter((d: any) => d.stage === 'closed_lost');
  const totalPipeline = active.reduce((s: number, d: any) => s + d.value, 0);
  const wonValue      = closedWon.reduce((s: number, d: any) => s + d.value, 0);
  const winRate = (closedWon.length + closedLost.length) > 0
    ? Math.round((closedWon.length / (closedWon.length + closedLost.length)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Pipeline"
        description={`${deals.length} deals · $${(totalPipeline / 1000).toFixed(0)}K pipeline`}
        breadcrumbs={[{ label: 'Growth' }, { label: 'Sales Pipeline' }]}
        actions={
          <>
            <Button size="md" onClick={() => setShowCreate(true)}><Plus className="size-4" strokeWidth={2.5} /> Add Deal</Button>
            <CreateDealModal open={showCreate} onClose={() => setShowCreate(false)} />
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Value', value: `$${(totalPipeline / 1000).toFixed(0)}K`, icon: <DollarSign className="size-4" />, color: 'text-foreground' },
          { label: 'Closed Won',     value: `$${(wonValue / 1000).toFixed(0)}K`,      icon: <TrendingUp className="size-4" />, color: 'text-emerald-600' },
          { label: 'Win Rate',       value: `${winRate}%`,                            icon: <Target className="size-4" />,    color: 'text-rose-600' },
          { label: 'Active Deals',   value: active.length,                            icon: <Users className="size-4" />,     color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <div className="text-muted-foreground">{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle>All Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 mt-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : (
            <div className="divide-y divide-border mt-4">
              {deals.map((deal: any, i: number) => (
                <motion.div key={deal.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 py-3.5 px-1 hover:bg-muted/20 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">{deal.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{deal.company}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-bold text-foreground">${deal.value.toLocaleString()}</span>
                    <select
                      value={deal.stage}
                      onChange={e => updateDeal({ id: deal.id, data: { stage: e.target.value } })}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md border-0 cursor-pointer focus:outline-none ${stageColor[deal.stage] ?? ''}`}
                    >
                      {['lead','qualified','proposal','negotiation','closed_won','closed_lost'].map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
