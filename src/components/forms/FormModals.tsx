import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useCreateTask, useCreateProject, useCreateLeaveRequest, useCreateCampaign, useCreateDeal, useCreateRoadmapItem, useCreateWorkUpdate, useUsers, useProjects, useRequestExtension } from '@/hooks';

// ── Generic Modal Shell ───────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-modal z-10">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all";
const selectCls = inputCls;

function SubmitBtn({ loading, label = 'Create' }: { loading: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading}
      className="h-9 px-5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto">
      {loading && <Loader2 className="size-4 animate-spin" />}
      {loading ? 'Saving...' : label}
    </button>
  );
}

// ── Create Task Modal ─────────────────────────────────────────────────────────
const EMPTY_TASK = { title: '', description: '', priority: 'medium', status: 'todo', projectId: '', assigneeId: '', dueDate: '', estimatedHours: '', notes: '' };

export function CreateTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate, isPending } = useCreateTask();
  const { data: projectsData } = useProjects({ limit: 50 });
  const { data: usersData } = useUsers({ limit: 50 });
  const projects = projectsData?.data ?? [];
  const users = usersData?.data ?? [];
  const [form, setForm] = useState(EMPTY_TASK);
  const today = new Date().toISOString().split('T')[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.projectId || !form.assigneeId || !form.dueDate) return;
    mutate({
      ...form,
      estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
      notes: form.notes || undefined,
    }, {
      onSuccess: () => { onClose(); setForm(EMPTY_TASK); },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title *">
          <input className={inputCls} placeholder="Task title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
        </Field>
        <Field label="Description">
          <textarea className={inputCls + ' h-16 py-2 resize-none'} placeholder="Optional description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project *">
            <select className={selectCls} value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))} required>
              <option value="">Select project</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Assignee *">
            <select className={selectCls} value={form.assigneeId} onChange={e => setForm(p => ({ ...p, assigneeId: e.target.value }))} required>
              <option value="">Select assignee</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select className={selectCls} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              {['critical', 'high', 'medium', 'low'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={selectCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked'].map(v => <option key={v} value={v}>{v.replace('_', ' ')}</option>)}
            </select>
          </Field>
          <Field label="Due Date *">
            <input type="date" className={inputCls} min={today} value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} required />
          </Field>
          <Field label="Estimated Hours">
            <input type="number" className={inputCls} placeholder="e.g. 8" min="0" step="0.5" value={form.estimatedHours} onChange={e => setForm(p => ({ ...p, estimatedHours: e.target.value }))} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea className={inputCls + ' h-16 py-2 resize-none'} placeholder="Optional notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </Field>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} />
        </div>
      </form>
    </Modal>
  );
}

// ── Request Deadline Extension Modal ─────────────────────────────────────────
export function RequestExtensionModal({ open, onClose, taskId, taskTitle }: { open: boolean; onClose: () => void; taskId: string; taskTitle: string }) {
  const { mutate, isPending } = useRequestExtension();
  const [form, setForm] = useState({ reason: '', requestedDueDate: '', comments: '' });
  const today = new Date().toISOString().split('T')[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reason || !form.requestedDueDate) return;
    mutate({ id: taskId, data: { reason: form.reason, requestedDueDate: form.requestedDueDate, comments: form.comments || undefined } }, {
      onSuccess: () => { onClose(); setForm({ reason: '', requestedDueDate: '', comments: '' }); },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Request Deadline Extension">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-muted-foreground">Task: <span className="font-semibold text-foreground">{taskTitle}</span></p>
        <Field label="Reason *">
          <textarea className={inputCls + ' h-20 py-2 resize-none'} placeholder="Why do you need more time?" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} required />
        </Field>
        <Field label="Requested New Due Date *">
          <input type="date" className={inputCls} min={today} value={form.requestedDueDate} onChange={e => setForm(p => ({ ...p, requestedDueDate: e.target.value }))} required />
        </Field>
        <Field label="Additional Comments">
          <textarea className={inputCls + ' h-16 py-2 resize-none'} placeholder="Any extra context" value={form.comments} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))} />
        </Field>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} label="Submit Request" />
        </div>
      </form>
    </Modal>
  );
}

// ── Create Project Modal ──────────────────────────────────────────────────────
export function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate, isPending } = useCreateProject();
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', color: '#6366f1' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.startDate) return;
    mutate({ ...form, endDate: form.endDate || undefined }, {
      onSuccess: () => { onClose(); setForm({ name: '', description: '', startDate: '', endDate: '', color: '#6366f1' }); },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Project Name *">
          <input className={inputCls} placeholder="e.g. Mobile App v2" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </Field>
        <Field label="Description">
          <textarea className={inputCls + ' h-20 py-2 resize-none'} placeholder="What is this project about?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date *">
            <input type="date" className={inputCls} value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
          </Field>
          <Field label="End Date">
            <input type="date" className={inputCls} value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
          </Field>
        </div>
        <Field label="Color">
          <div className="flex items-center gap-3">
            <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-9 w-16 rounded-lg border border-border cursor-pointer" />
            <span className="text-xs text-muted-foreground">{form.color}</span>
          </div>
        </Field>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} />
        </div>
      </form>
    </Modal>
  );
}

// ── Create Leave Request Modal ────────────────────────────────────────────────
export function CreateLeaveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate, isPending } = useCreateLeaveRequest();
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });

  function calcDays(start: string, end: string) {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) return;
    const days = calcDays(form.startDate, form.endDate);
    mutate({ ...form, days }, {
      onSuccess: () => { onClose(); setForm({ type: 'annual', startDate: '', endDate: '', reason: '' }); },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Request Leave">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Leave Type">
          <select className={selectCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
            {['annual', 'sick', 'casual', 'unpaid'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date *">
            <input type="date" className={inputCls} value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
          </Field>
          <Field label="End Date *">
            <input type="date" className={inputCls} value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} required />
          </Field>
        </div>
        {form.startDate && form.endDate && (
          <p className="text-xs text-muted-foreground">Duration: <span className="font-semibold text-foreground">{calcDays(form.startDate, form.endDate)} day(s)</span></p>
        )}
        <Field label="Reason *">
          <textarea className={inputCls + ' h-20 py-2 resize-none'} placeholder="Reason for leave" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} required />
        </Field>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} label="Submit Request" />
        </div>
      </form>
    </Modal>
  );
}

// ── Create Campaign Modal ─────────────────────────────────────────────────────
export function CreateCampaignModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate, isPending } = useCreateCampaign();
  const [form, setForm] = useState({ name: '', channel: 'email', budget: '', startDate: '', endDate: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.budget || !form.startDate) return;
    mutate({ ...form, budget: parseFloat(form.budget), endDate: form.endDate || undefined }, {
      onSuccess: () => { onClose(); setForm({ name: '', channel: 'email', budget: '', startDate: '', endDate: '' }); },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="New Campaign">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Campaign Name *">
          <input className={inputCls} placeholder="e.g. Q2 Product Launch" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Channel">
            <select className={selectCls} value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}>
              {['email', 'social', 'paid', 'content', 'seo'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Budget ($) *">
            <input type="number" className={inputCls} placeholder="5000" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} required />
          </Field>
          <Field label="Start Date *">
            <input type="date" className={inputCls} value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
          </Field>
          <Field label="End Date">
            <input type="date" className={inputCls} value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
          </Field>
        </div>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} />
        </div>
      </form>
    </Modal>
  );
}

// ── Create Deal Modal ─────────────────────────────────────────────────────────
export function CreateDealModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate, isPending } = useCreateDeal();
  const [form, setForm] = useState({ title: '', company: '', value: '', stage: 'lead', probability: '20', closeDate: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.company || !form.value) return;
    mutate({ ...form, value: parseFloat(form.value), probability: parseInt(form.probability), closeDate: form.closeDate || undefined }, {
      onSuccess: () => { onClose(); setForm({ title: '', company: '', value: '', stage: 'lead', probability: '20', closeDate: '' }); },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="New Deal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Deal Title *">
          <input className={inputCls} placeholder="e.g. Enterprise License" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
        </Field>
        <Field label="Company *">
          <input className={inputCls} placeholder="Company name" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Value ($) *">
            <input type="number" className={inputCls} placeholder="10000" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} required />
          </Field>
          <Field label="Stage">
            <select className={selectCls} value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
              {['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map(v => <option key={v} value={v}>{v.replace('_', ' ')}</option>)}
            </select>
          </Field>
          <Field label="Probability (%)">
            <input type="number" min="0" max="100" className={inputCls} value={form.probability} onChange={e => setForm(p => ({ ...p, probability: e.target.value }))} />
          </Field>
          <Field label="Close Date">
            <input type="date" className={inputCls} value={form.closeDate} onChange={e => setForm(p => ({ ...p, closeDate: e.target.value }))} />
          </Field>
        </div>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} />
        </div>
      </form>
    </Modal>
  );
}

// ── Log Work Update Modal ─────────────────────────────────────────────────────
export function LogWorkUpdateModal({ open, onClose, prefillTasks }: { open: boolean; onClose: () => void; prefillTasks?: { title: string; ticketRef?: string }[] }) {
  const { mutate, isPending } = useCreateWorkUpdate();
  const initTask = () => ({ title: '', hours: '', status: 'in_progress', ticketRef: '' });
  const [tasks, setTasks] = useState([initTask()]);
  const [blockers, setBlockers] = useState('');
  const [planForTomorrow, setPlanForTomorrow] = useState('');

  useEffect(() => {
    if (open && prefillTasks?.length) {
      setTasks(prefillTasks.map(t => ({ title: t.title, ticketRef: t.ticketRef ?? '', hours: '', status: 'in_progress' })));
    } else if (open) {
      setTasks([initTask()]);
    }
  }, [open]);

  function addTask() { setTasks(p => [...p, initTask()]); }
  function removeTask(i: number) { setTasks(p => p.filter((_, idx) => idx !== i)); }
  function updateTask(i: number, field: string, val: string) {
    setTasks(p => p.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validTasks = tasks.filter(t => t.title.trim());
    if (!validTasks.length) return;
    const totalHours = validTasks.reduce((s, t) => s + (parseFloat(t.hours) || 0), 0);
    mutate({
      tasks: validTasks.map(t => ({ title: t.title, ticketRef: t.ticketRef || undefined, status: t.status, hours: parseFloat(t.hours) || 0 })),
      blockers: blockers || undefined,
      planForTomorrow: planForTomorrow || undefined,
      totalHours,
    }, {
      onSuccess: () => {
        onClose();
        setTasks([initTask()]);
        setBlockers('');
        setPlanForTomorrow('');
      },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Work Update">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Tasks *</label>
            <button type="button" onClick={addTask} className="text-xs text-rose-600 hover:text-rose-500 font-semibold">+ Add task</button>
          </div>
          {tasks.map((task, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-start">
              <input className={inputCls + ' col-span-5'} placeholder="Task title" value={task.title} onChange={e => updateTask(i, 'title', e.target.value)} />
              <input className={inputCls + ' col-span-2'} placeholder="Ref" value={task.ticketRef} onChange={e => updateTask(i, 'ticketRef', e.target.value)} />
              <select className={selectCls + ' col-span-3'} value={task.status} onChange={e => updateTask(i, 'status', e.target.value)}>
                {['not_started','in_progress','completed','blocked'].map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)}
              </select>
              <input type="number" className={inputCls + ' col-span-1'} placeholder="h" value={task.hours} onChange={e => updateTask(i, 'hours', e.target.value)} min="0" step="0.5" />
              {tasks.length > 1 && (
                <button type="button" onClick={() => removeTask(i)} className="col-span-1 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors h-9">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <Field label="Blockers">
          <textarea className={inputCls + ' h-16 py-2 resize-none'} placeholder="Any blockers?" value={blockers} onChange={e => setBlockers(e.target.value)} />
        </Field>
        <Field label="Plan for Tomorrow">
          <textarea className={inputCls + ' h-16 py-2 resize-none'} placeholder="What will you work on tomorrow?" value={planForTomorrow} onChange={e => setPlanForTomorrow(e.target.value)} />
        </Field>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} label="Submit Update" />
        </div>
      </form>
    </Modal>
  );
}

// ── Add Employee Modal ────────────────────────────────────────────────────────
export function AddEmployeeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', title: '', department: '', role: 'frontend_dev', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setLoading(true);
    try {
      await api.post('/users', form);
      qc.invalidateQueries({ queryKey: ['users'] });
      onClose();
      setForm({ name: '', email: '', title: '', department: '', role: 'frontend_dev', password: '' });
    } catch {}
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *">
            <input className={inputCls} placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </Field>
          <Field label="Email *">
            <input type="email" className={inputCls} placeholder="john@tzmicha.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </Field>
          <Field label="Job Title">
            <input className={inputCls} placeholder="e.g. Frontend Engineer" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </Field>
          <Field label="Department">
            <input className={inputCls} placeholder="e.g. Engineering" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
          </Field>
          <Field label="Role">
            <select className={selectCls} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {['admin','frontend_dev','backend_dev','qa','marketing','hr','product_manager','sales'].map(v => (
                <option key={v} value={v}>{v.replace(/_/g,' ')}</option>
              ))}
            </select>
          </Field>
          <Field label="Password *">
            <input type="password" className={inputCls} placeholder="Temporary password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </Field>
        </div>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={loading} label="Add Employee" />
        </div>
      </form>
    </Modal>
  );
}

// ── Create Roadmap Item Modal ─────────────────────────────────────────────────
export function CreateRoadmapModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate, isPending } = useCreateRoadmapItem();
  const [form, setForm] = useState({ title: '', description: '', quarter: 'Q1', year: new Date().getFullYear().toString(), team: '', priority: 'medium', status: 'planned' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    mutate({ ...form, year: parseInt(form.year) }, {
      onSuccess: () => { onClose(); setForm({ title: '', description: '', quarter: 'Q1', year: new Date().getFullYear().toString(), team: '', priority: 'medium', status: 'planned' }); },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="New Roadmap Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title *">
          <input className={inputCls} placeholder="Feature or milestone" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
        </Field>
        <Field label="Description">
          <textarea className={inputCls + ' h-16 py-2 resize-none'} placeholder="Optional details" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quarter">
            <select className={selectCls} value={form.quarter} onChange={e => setForm(p => ({ ...p, quarter: e.target.value }))}>
              {['Q1', 'Q2', 'Q3', 'Q4'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Year">
            <input type="number" className={inputCls} value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} />
          </Field>
          <Field label="Team">
            <input className={inputCls} placeholder="e.g. Frontend" value={form.team} onChange={e => setForm(p => ({ ...p, team: e.target.value }))} />
          </Field>
          <Field label="Priority">
            <select className={selectCls} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              {['critical', 'high', 'medium', 'low'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end pt-2 border-t border-border">
          <SubmitBtn loading={isPending} />
        </div>
      </form>
    </Modal>
  );
}
