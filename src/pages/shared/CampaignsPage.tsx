import { useState } from 'react';
import { Plus, Eye, MousePointer, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCampaigns } from '@/hooks';
import { CreateCampaignModal } from '@/components/forms/FormModals';

const channelColor: Record<string, any> = { email: 'blue', social: 'violet', paid: 'warning', seo: 'success', content: 'secondary' };
const statusVariant: Record<string, any> = { active: 'success', completed: 'secondary', paused: 'warning', draft: 'muted' };

export function CampaignsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useCampaigns({ limit: 20 });
  const campaigns = data?.data ?? [];

  const totalBudget = campaigns.reduce((s: number, c: any) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s: number, c: any) => s + c.spent, 0);
  const totalConversions = campaigns.reduce((s: number, c: any) => s + c.conversions, 0);
  const avgROI = campaigns.length ? (campaigns.reduce((s: number, c: any) => s + c.roi, 0) / campaigns.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description={`${campaigns.filter((c: any) => c.status === 'active').length} active campaigns`}
        breadcrumbs={[{ label: 'Growth' }, { label: 'Campaigns' }]}
        actions={
          <>
            <Button size="md" onClick={() => setShowCreate(true)}><Plus className="size-4" strokeWidth={2.5} /> New Campaign</Button>
            <CreateCampaignModal open={showCreate} onClose={() => setShowCreate(false)} />
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget',  value: `$${(totalBudget / 1000).toFixed(0)}K`,  color: 'text-foreground' },
          { label: 'Total Spent',   value: `$${(totalSpent / 1000).toFixed(0)}K`,   color: 'text-rose-600' },
          { label: 'Conversions',   value: totalConversions.toLocaleString(),        color: 'text-emerald-600' },
          { label: 'Avg ROI',       value: `${avgROI}x`,                            color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c: any, i: number) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card padding="lg" className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[14px] font-bold text-foreground">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={channelColor[c.channel] ?? 'muted'}>{c.channel}</Badge>
                      <Badge variant={statusVariant[c.status] ?? 'muted'} dot>{c.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-lg font-black text-emerald-600">{c.roi}x</p>
                  </div>
                </div>
                <Progress value={Math.round((c.spent / c.budget) * 100)} size="md" color="rose" label="Budget Used" showLabel />
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                  {[
                    { icon: <Eye className="size-3.5" />,          label: 'Impressions', value: (c.impressions / 1000).toFixed(0) + 'K' },
                    { icon: <MousePointer className="size-3.5" />, label: 'Clicks',      value: c.clicks.toLocaleString() },
                    { icon: <Target className="size-3.5" />,       label: 'Conversions', value: c.conversions },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">{stat.icon}</div>
                      <p className="text-[13px] font-bold text-foreground">{stat.value}</p>
                      <p className="text-2xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
