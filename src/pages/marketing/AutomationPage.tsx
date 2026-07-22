import { motion } from 'framer-motion';
import { Zap, Plus, Play, Pause, Users, ArrowRight, Mail, MessageSquare, Phone, Clock, GitBranch, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

const flows = [
  {
    id: 1, name: 'New User Onboarding',  status: 'active',  enrolled: 8420, completed: 6100, convRate: '72%',
    steps: [
      { type: 'trigger', label: 'User Signs Up',       icon: <Users className="size-3" />,        color: 'bg-blue-500' },
      { type: 'action',  label: 'Send Welcome Email',  icon: <Mail className="size-3" />,         color: 'bg-violet-500' },
      { type: 'wait',    label: 'Wait 1 Day',          icon: <Clock className="size-3" />,        color: 'bg-amber-500' },
      { type: 'action',  label: 'Send WhatsApp Tip',   icon: <MessageSquare className="size-3" />, color: 'bg-green-500' },
      { type: 'wait',    label: 'Wait 3 Days',         icon: <Clock className="size-3" />,        color: 'bg-amber-500' },
      { type: 'action',  label: 'Send SMS Nudge',      icon: <MessageSquare className="size-3" />, color: 'bg-emerald-500' },
    ],
  },
  {
    id: 2, name: 'Abandoned Cart Recovery', status: 'active', enrolled: 3200, completed: 1840, convRate: '57%',
    steps: [
      { type: 'trigger', label: 'Cart Abandoned',      icon: <Users className="size-3" />,        color: 'bg-blue-500' },
      { type: 'wait',    label: 'Wait 1 Hour',         icon: <Clock className="size-3" />,        color: 'bg-amber-500' },
      { type: 'action',  label: 'Send Email Reminder', icon: <Mail className="size-3" />,         color: 'bg-violet-500' },
      { type: 'condition', label: 'Opened Email?',     icon: <GitBranch className="size-3" />,    color: 'bg-rose-500' },
      { type: 'action',  label: 'Send WhatsApp',       icon: <MessageSquare className="size-3" />, color: 'bg-green-500' },
    ],
  },
  {
    id: 3, name: 'Re-engagement Flow',   status: 'paused', enrolled: 12800, completed: 4200, convRate: '33%',
    steps: [
      { type: 'trigger', label: 'Inactive 30 Days',    icon: <Users className="size-3" />,        color: 'bg-blue-500' },
      { type: 'action',  label: 'Send Win-back Email', icon: <Mail className="size-3" />,         color: 'bg-violet-500' },
      { type: 'wait',    label: 'Wait 3 Days',         icon: <Clock className="size-3" />,        color: 'bg-amber-500' },
      { type: 'action',  label: 'Send SMS Offer',      icon: <MessageSquare className="size-3" />, color: 'bg-emerald-500' },
    ],
  },
  {
    id: 4, name: 'Post-Purchase Upsell', status: 'active', enrolled: 5600, completed: 3900, convRate: '70%',
    steps: [
      { type: 'trigger', label: 'Order Completed',     icon: <CheckCircle2 className="size-3" />, color: 'bg-emerald-500' },
      { type: 'wait',    label: 'Wait 2 Days',         icon: <Clock className="size-3" />,        color: 'bg-amber-500' },
      { type: 'action',  label: 'Send RCS Upsell',     icon: <MessageSquare className="size-3" />, color: 'bg-violet-500' },
      { type: 'wait',    label: 'Wait 5 Days',         icon: <Clock className="size-3" />,        color: 'bg-amber-500' },
      { type: 'action',  label: 'Send Review Request', icon: <Mail className="size-3" />,         color: 'bg-blue-500' },
    ],
  },
];

const statusVariant: Record<string, any> = { active: 'success', paused: 'warning', draft: 'muted' };
const nodeTypeLabel: Record<string, string> = { trigger: 'Trigger', action: 'Action', wait: 'Wait', condition: 'Condition' };

export function AutomationPage() {
  const totalEnrolled = flows.reduce((s, f) => s + f.enrolled, 0);
  const activeFlows = flows.filter(f => f.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="Multi-channel automated workflows and drip sequences"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Automation' }]}
        actions={<Button size="md"><Plus className="size-4" /> New Workflow</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Flows',    value: activeFlows.toString(),          color: 'text-emerald-600' },
          { label: 'Total Enrolled',  value: totalEnrolled.toLocaleString(),  color: 'text-blue-600' },
          { label: 'Completed',       value: flows.reduce((s, f) => s + f.completed, 0).toLocaleString(), color: 'text-violet-600' },
          { label: 'Avg Conv. Rate',  value: Math.round(flows.reduce((s, f) => s + parseInt(f.convRate), 0) / flows.length) + '%', color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {flows.map((flow, i) => (
          <motion.div key={flow.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card padding="lg">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-bold text-foreground">{flow.name}</p>
                    <Badge variant={statusVariant[flow.status]} dot className="text-[10px]">{flow.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">{flow.enrolled.toLocaleString()} enrolled</span>
                    <span className="text-xs text-muted-foreground">{flow.completed.toLocaleString()} completed</span>
                    <span className="text-xs font-semibold text-emerald-600">{flow.convRate} conv. rate</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {flow.status === 'active'
                    ? <Button size="xs" variant="outline"><Pause className="size-3" /> Pause</Button>
                    : <Button size="xs" variant="outline"><Play className="size-3" /> Resume</Button>
                  }
                  <Button size="xs" variant="outline">Edit</Button>
                </div>
              </div>

              {/* Flow steps */}
              <div className="flex items-center gap-1 flex-wrap">
                {flow.steps.map((step, si) => (
                  <div key={si} className="flex items-center gap-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-muted/30">
                      <div className={cn('flex size-4 items-center justify-center rounded-full text-white', step.color)}>{step.icon}</div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none">{nodeTypeLabel[step.type]}</p>
                        <p className="text-[11px] font-semibold text-foreground leading-tight">{step.label}</p>
                      </div>
                    </div>
                    {si < flow.steps.length - 1 && <ArrowRight className="size-3 text-muted-foreground shrink-0" />}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
