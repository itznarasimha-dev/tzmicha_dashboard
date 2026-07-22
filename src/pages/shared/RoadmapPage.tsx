import { useState } from 'react';
import { Plus, Circle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRoadmap } from '@/hooks';
import { CreateRoadmapModal } from '@/components/forms/FormModals';

const statusConfig: Record<string, any> = {
  completed:   { icon: <CheckCircle2 className="size-4 text-emerald-500" />, variant: 'success' },
  in_progress: { icon: <Clock className="size-4 text-amber-500" />,         variant: 'warning' },
  planned:     { icon: <Circle className="size-4 text-muted-foreground" />, variant: 'muted' },
  cancelled:   { icon: <Circle className="size-4 text-red-400" />,          variant: 'danger' },
};

export function RoadmapPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: items = [], isLoading } = useRoadmap();

  const currentYear = new Date().getFullYear();
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roadmap"
        description={`Product roadmap — ${currentYear}`}
        breadcrumbs={[{ label: 'Growth' }, { label: 'Roadmap' }]}
        actions={
          <>
            <Button size="md" onClick={() => setShowCreate(true)}><Plus className="size-4" strokeWidth={2.5} /> Add Item</Button>
            <CreateRoadmapModal open={showCreate} onClose={() => setShowCreate(false)} />
          </>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {quarters.map(q => {
            const qItems = items.filter((r: any) => r.quarter === q && r.year === currentYear);
            if (qItems.length === 0) return null;
            return (
              <div key={q}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-rose-500" />
                    <h3 className="text-[15px] font-bold text-foreground">{q} {currentYear}</h3>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{qItems.length} items</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {qItems.map((item: any, i: number) => {
                    const config = statusConfig[item.status] ?? statusConfig.planned;
                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <Card hover padding="lg" className="flex flex-col gap-3">
                          <div className="flex items-start gap-2">
                            {config.icon}
                            <div>
                              <p className="text-[13px] font-bold text-foreground">{item.title}</p>
                              {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                            </div>
                          </div>
                          {item.progress > 0 && <Progress value={item.progress} size="sm" color="rose" />}
                          <div className="flex items-center justify-between">
                            <Badge variant={config.variant}>{item.status?.replace('_', ' ')}</Badge>
                            <div className="flex items-center gap-2">
                              {item.team && <span className="text-2xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.team}</span>}
                              <span className="text-2xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.priority}</span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
