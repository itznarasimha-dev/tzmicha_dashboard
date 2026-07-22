import { motion } from 'framer-motion';
import { Bot, ArrowRight, CheckCircle2, XCircle, RefreshCw, Zap, BarChart3, Settings } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

const fallbackChains = [
  {
    id: 1, name: 'OTP Delivery Chain',     status: 'active',
    steps: [
      { channel: 'WhatsApp', success: 78, color: 'bg-green-500',   textColor: 'text-green-600' },
      { channel: 'SMS',      success: 18, color: 'bg-blue-500',    textColor: 'text-blue-600' },
      { channel: 'Voice',    success: 3,  color: 'bg-amber-500',   textColor: 'text-amber-600' },
      { channel: 'Email',    success: 1,  color: 'bg-violet-500',  textColor: 'text-violet-600' },
    ],
    totalAttempts: 84200, finalDelivery: '99.2%',
  },
  {
    id: 2, name: 'Promo Blast Chain',      status: 'active',
    steps: [
      { channel: 'RCS',      success: 62, color: 'bg-violet-500',  textColor: 'text-violet-600' },
      { channel: 'WhatsApp', success: 24, color: 'bg-green-500',   textColor: 'text-green-600' },
      { channel: 'SMS',      success: 12, color: 'bg-blue-500',    textColor: 'text-blue-600' },
      { channel: 'Email',    success: 2,  color: 'bg-rose-500',    textColor: 'text-rose-600' },
    ],
    totalAttempts: 42100, finalDelivery: '97.8%',
  },
  {
    id: 3, name: 'Transactional Alerts',   status: 'active',
    steps: [
      { channel: 'Email',    success: 84, color: 'bg-rose-500',    textColor: 'text-rose-600' },
      { channel: 'SMS',      success: 14, color: 'bg-blue-500',    textColor: 'text-blue-600' },
      { channel: 'WhatsApp', success: 2,  color: 'bg-green-500',   textColor: 'text-green-600' },
    ],
    totalAttempts: 28400, finalDelivery: '99.7%',
  },
];

const aiStats = [
  { label: 'Fallback Triggers',  value: '18,420', sub: 'messages rerouted',    color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { label: 'Recovery Rate',      value: '96.4%',  sub: 'successfully delivered', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { label: 'Avg Fallback Time',  value: '1.2s',   sub: 'channel switch latency', color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { label: 'Cost Saved',         value: '$2,840', sub: 'vs single-channel',     color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-950/20' },
];

const statusVariant: Record<string, any> = { active: 'success', paused: 'warning' };

export function AiFallbackPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Fallback"
        description="Intelligent multi-channel fallback routing to maximise delivery"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'AI Fallback' }]}
        actions={<Button size="md"><Settings className="size-4" /> Configure Chains</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {aiStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card padding="md">
              <div className={cn('inline-flex items-center justify-center size-8 rounded-lg mb-2', s.bg)}>
                <Bot className="size-4 text-current" style={{ color: 'inherit' }} />
              </div>
              <p className={cn('text-xl font-black', s.color)}>{s.value}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="size-4 text-amber-500" />
          <p className="text-sm font-bold text-foreground">How AI Fallback Works</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { step: '1', label: 'Message Sent',       desc: 'Primary channel attempted',   icon: <Bot className="size-4 text-blue-500" /> },
            { step: '2', label: 'Delivery Check',     desc: 'AI monitors delivery status', icon: <CheckCircle2 className="size-4 text-emerald-500" /> },
            { step: '3', label: 'Failure Detected',   desc: 'Undelivered after timeout',   icon: <XCircle className="size-4 text-red-500" /> },
            { step: '4', label: 'Auto Reroute',       desc: 'Switch to next channel',      icon: <RefreshCw className="size-4 text-violet-500" /> },
            { step: '5', label: 'Delivered',          desc: 'Message reaches recipient',   icon: <CheckCircle2 className="size-4 text-emerald-500" /> },
          ].map((s, i, arr) => (
            <div key={s.step} className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/30">
                {s.icon}
                <div>
                  <p className="text-[11px] font-bold text-foreground">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              </div>
              {i < arr.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Fallback chains */}
      <div className="space-y-4">
        {fallbackChains.map((chain, i) => (
          <motion.div key={chain.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card padding="lg">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-bold text-foreground">{chain.name}</p>
                    <Badge variant={statusVariant[chain.status]} dot className="text-[10px]">{chain.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{chain.totalAttempts.toLocaleString()} attempts</span>
                    <span className="text-xs font-semibold text-emerald-600">Final delivery: {chain.finalDelivery}</span>
                  </div>
                </div>
                <Button size="xs" variant="outline">Edit Chain</Button>
              </div>

              {/* Channel steps with success % */}
              <div className="flex items-center gap-2 flex-wrap">
                {chain.steps.map((step, si) => (
                  <div key={si} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/20">
                      <div className={cn('size-2 rounded-full', step.color)} />
                      <div>
                        <p className="text-[11px] font-bold text-foreground">{step.channel}</p>
                        <p className={cn('text-[10px] font-semibold', step.textColor)}>{step.success}% delivered here</p>
                      </div>
                    </div>
                    {si < chain.steps.length - 1 && (
                      <div className="flex flex-col items-center">
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">fallback</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="mt-4 flex gap-1 h-2 rounded-full overflow-hidden">
                {chain.steps.map((step, si) => (
                  <div key={si} className={cn('h-full rounded-full', step.color)} style={{ width: `${step.success}%` }} />
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
