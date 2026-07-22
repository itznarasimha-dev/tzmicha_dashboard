import { motion } from 'framer-motion';
import { Phone, Bot, Play, Pause, Mic, PhoneCall, PhoneOff, Clock, TrendingUp, Settings, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

const agents = [
  {
    id: 1, name: 'Sales Outreach Agent',   status: 'active',  voice: 'Aria (Female)',  language: 'English',
    script: 'Hi {{name}}, this is Aria from TZMicha. I\'m calling about our new enterprise plan that could save your team up to 40%...',
    calls: 2840, answered: 1920, converted: 284, avgDuration: '2m 14s',
  },
  {
    id: 2, name: 'Appointment Reminder',   status: 'active',  voice: 'James (Male)',   language: 'English',
    script: 'Hello {{name}}, this is a reminder from TZMicha about your appointment scheduled for {{date}} at {{time}}...',
    calls: 1240, answered: 1180, converted: 1180, avgDuration: '0m 48s',
  },
  {
    id: 3, name: 'Payment Follow-up',      status: 'paused',  voice: 'Priya (Female)', language: 'Hindi/English',
    script: 'Namaste {{name}}, aapka payment {{amount}} pending hai. Kya aap abhi payment kar sakte hain?...',
    calls: 840,  answered: 620,  converted: 310,  avgDuration: '1m 32s',
  },
];

const callLogs = [
  { id: 1, contact: 'Rahul Sharma',    number: '+91 98765 43210', agent: 'Sales Outreach Agent',  duration: '3m 12s', outcome: 'interested',   time: '10:24 AM' },
  { id: 2, contact: 'Priya Mehta',     number: '+91 91234 56789', agent: 'Appointment Reminder',  duration: '0m 52s', outcome: 'confirmed',    time: '10:18 AM' },
  { id: 3, contact: 'Amit Kumar',      number: '+91 99887 76655', agent: 'Sales Outreach Agent',  duration: '0m 08s', outcome: 'no_answer',    time: '10:12 AM' },
  { id: 4, contact: 'Sneha Iyer',      number: '+91 88776 65544', agent: 'Payment Follow-up',     duration: '1m 44s', outcome: 'paid',         time: '10:05 AM' },
  { id: 5, contact: 'Vikram Singh',    number: '+91 77665 54433', agent: 'Sales Outreach Agent',  duration: '2m 01s', outcome: 'callback',     time: '09:58 AM' },
  { id: 6, contact: 'Kavya Nair',      number: '+91 66554 43322', agent: 'Appointment Reminder',  duration: '0m 44s', outcome: 'confirmed',    time: '09:51 AM' },
];

const outcomeVariant: Record<string, any> = {
  interested: 'success', confirmed: 'success', paid: 'success',
  callback: 'warning', no_answer: 'muted', declined: 'danger',
};
const statusVariant: Record<string, any> = { active: 'success', paused: 'warning' };

export function AiVoiceAgentPage() {
  const totalCalls = agents.reduce((s, a) => s + a.calls, 0);
  const totalAnswered = agents.reduce((s, a) => s + a.answered, 0);
  const totalConverted = agents.reduce((s, a) => s + a.converted, 0);
  const answerRate = totalCalls ? Math.round((totalAnswered / totalCalls) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Voice Agent"
        description="Automated AI-powered voice calls for outreach, reminders and follow-ups"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'AI Voice Agent' }]}
        actions={<Button size="md"><Plus className="size-4" /> New Voice Agent</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Calls',    value: totalCalls.toLocaleString(),    icon: <PhoneCall className="size-4 text-blue-500" />,    color: 'text-foreground' },
          { label: 'Answer Rate',    value: answerRate + '%',               icon: <Phone className="size-4 text-emerald-500" />,     color: 'text-emerald-600' },
          { label: 'Conversions',    value: totalConverted.toLocaleString(), icon: <TrendingUp className="size-4 text-violet-500" />, color: 'text-violet-600' },
          { label: 'Active Agents',  value: agents.filter(a => a.status === 'active').length.toString(), icon: <Bot className="size-4 text-amber-500" />, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <div className="flex items-center gap-2 mb-1">{s.icon}<p className="text-xs text-muted-foreground font-medium">{s.label}</p></div>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Agents */}
      <div className="space-y-4">
        {agents.map((agent, i) => (
          <motion.div key={agent.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card padding="lg">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Bot className="size-4 text-violet-500" />
                    <p className="text-[14px] font-bold text-foreground">{agent.name}</p>
                    <Badge variant={statusVariant[agent.status]} dot className="text-[10px]">{agent.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Mic className="size-3" />{agent.voice}</span>
                    <span className="text-xs text-muted-foreground">{agent.language}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" />Avg {agent.avgDuration}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {agent.status === 'active'
                    ? <Button size="xs" variant="outline"><Pause className="size-3" /> Pause</Button>
                    : <Button size="xs" variant="outline"><Play className="size-3" /> Resume</Button>
                  }
                  <Button size="xs" variant="outline"><Settings className="size-3" /></Button>
                </div>
              </div>

              {/* Script preview */}
              <div className="rounded-xl bg-muted/30 border border-border/50 px-3 py-2.5 mb-4">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Script Preview</p>
                <p className="text-xs text-foreground leading-relaxed italic">"{agent.script}"</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Calls Made',  value: agent.calls.toLocaleString(),    color: 'text-foreground' },
                  { label: 'Answered',    value: agent.answered.toLocaleString(), color: 'text-emerald-600' },
                  { label: 'Converted',   value: agent.converted.toLocaleString(), color: 'text-violet-600' },
                ].map(s => (
                  <div key={s.label} className="text-center bg-muted/30 rounded-lg py-2 border border-border/40">
                    <p className={cn('text-lg font-black tabular-nums', s.color)}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call logs */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <p className="text-sm font-bold text-foreground">Recent Call Logs</p>
        </div>
        <div className="divide-y divide-border">
          {callLogs.map((log, i) => (
            <motion.div key={log.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-5 py-3">
              <div className={cn('flex size-8 items-center justify-center rounded-full shrink-0',
                log.outcome === 'no_answer' ? 'bg-muted' : 'bg-emerald-50 dark:bg-emerald-950/20'
              )}>
                {log.outcome === 'no_answer'
                  ? <PhoneOff className="size-4 text-muted-foreground" />
                  : <PhoneCall className="size-4 text-emerald-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{log.contact}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">{log.number}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{log.agent}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{log.duration}</span>
                <span className="text-[10px] text-muted-foreground">{log.time}</span>
                <Badge variant={outcomeVariant[log.outcome]} className="text-[10px]">{log.outcome.replace('_', ' ')}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
