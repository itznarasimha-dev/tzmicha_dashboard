import { useState, useMemo, useEffect } from 'react';
import {
  format, addMonths, subMonths, startOfMonth,
  getDay, getDaysInMonth, addWeeks, subWeeks, addDays, subDays,
  startOfWeek, parseISO, isToday, isSameMonth,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Plus, X, Search, Calendar,
  Clock, MapPin, Trash2, Edit2, Flag, Globe,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatDate } from '@/utils';
import { useAppStore } from '@/store/appStore';
import {
  useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent,
  useDeleteCalendarEvent, usePublicHolidays, useTodayHoliday,
  useCreateHoliday, useUpdateHoliday, useDeleteHoliday,
  useProjects,
} from '@/hooks';
import { dispatchCalendarSync } from '@/components/ui/EventSyncToast';
import type { UserRole } from '@/types';

// ── Permission ────────────────────────────────────────────────────────────────
const CAN_MANAGE: UserRole[] = ['admin', 'hr'];

// ── View types ────────────────────────────────────────────────────────────────
type CalView = 'month' | 'week' | 'day';
type FilterType = 'all' | 'holiday' | 'company' | 'deadline';

// ── Event types config ────────────────────────────────────────────────────────
const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; dot: string; badge: string }> = {
  company:  { label: 'Company Event', color: 'bg-blue-500',    dot: 'bg-blue-500',    badge: 'blue' },
  meeting:  { label: 'Meeting',       color: 'bg-violet-500',  dot: 'bg-violet-500',  badge: 'violet' },
  deadline: { label: 'Deadline',      color: 'bg-red-500',     dot: 'bg-red-500',     badge: 'danger' },
  holiday:  { label: 'Public Holiday',color: 'bg-rose-500',    dot: 'bg-rose-500',    badge: 'default' },
  other:    { label: 'Other',         color: 'bg-amber-500',   dot: 'bg-amber-500',   badge: 'warning' },
};

const inputCls = 'h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all';
const labelCls = 'text-xs font-semibold text-foreground mb-1.5 block';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface CalEvent {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  createdById?: string;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
  holidayType: string;
  isDefault?: boolean;
}

// ── STEP 1 COMPLETE — rest of components follow ───────────────────────────────

// ── EventFormModal ────────────────────────────────────────────────────────────
function EventFormModal({ open, onClose, event, onSave, onUpdate }: {
  open: boolean;
  onClose: () => void;
  event?: CalEvent | null;
  onSave: (data: Record<string, any>) => Promise<void>;
  onUpdate?: (id: string, data: Record<string, any>) => Promise<void>;
}) {
  const isEdit = !!event;
  const [form, setForm] = useState({
    title: event?.title ?? '',
    description: event?.description ?? '',
    eventType: event?.eventType ?? 'company',
    eventDate: event?.eventDate ? event.eventDate.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
    startTime: event?.startTime ?? '09:00',
    endTime: event?.endTime ?? '10:00',
    location: event?.location ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      title: event?.title ?? '',
      description: event?.description ?? '',
      eventType: event?.eventType ?? 'company',
      eventDate: event?.eventDate ? event.eventDate.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
      startTime: event?.startTime ?? '09:00',
      endTime: event?.endTime ?? '10:00',
      location: event?.location ?? '',
    });
  }, [event, open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (isEdit && event && onUpdate) await onUpdate(event.id, form);
      else await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-modal z-10">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Calendar className="size-4 text-blue-500" />
            </div>
            <h2 className="text-[15px] font-bold text-foreground">{isEdit ? 'Edit Event' : 'New Event'}</h2>
          </div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input className={inputCls} placeholder="Event title" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} value={form.eventDate}
                onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))}>
                {Object.entries(EVENT_TYPE_CONFIG).filter(([k]) => k !== 'holiday' && k !== 'deadline').map(([v, c]) => (
                  <option key={v} value={v}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Time</label>
              <input type="time" className={inputCls} value={form.startTime}
                onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>End Time</label>
              <input type="time" className={inputCls} value={form.endTime}
                onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input className={inputCls} placeholder="Optional location" value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls + ' h-16 py-2 resize-none'} placeholder="Optional notes"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="h-9 px-5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {saving ? 'Saving…' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── HolidayFormModal ────────────────────────────────────────────────────────────
function HolidayFormModal({ open, onClose, holiday, onSave, onUpdate }: {
  open: boolean; onClose: () => void;
  holiday?: Holiday | null;
  onSave: (data: Record<string, any>) => Promise<void>;
  onUpdate?: (id: string, data: Record<string, any>) => Promise<void>;
}) {
  const isEdit = !!holiday;
  const [form, setForm] = useState({
    name: holiday?.name ?? '',
    date: holiday?.date ? holiday.date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
    description: holiday?.description ?? '',
    holidayType: holiday?.holidayType ?? 'national',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: holiday?.name ?? '',
      date: holiday?.date ? holiday.date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
      description: holiday?.description ?? '',
      holidayType: holiday?.holidayType ?? 'national',
    });
  }, [holiday, open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (isEdit && holiday && onUpdate) await onUpdate(holiday.id, form);
      else await onSave(form);
      onClose();
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-modal z-10">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10">
              <Flag className="size-4 text-rose-500" />
            </div>
            <h2 className="text-[15px] font-bold text-foreground">{isEdit ? 'Edit Holiday' : 'Add Holiday'}</h2>
          </div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Holiday Name *</label>
            <input className={inputCls} placeholder="e.g. Independence Day" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={form.holidayType} onChange={e => setForm(p => ({ ...p, holidayType: e.target.value }))}>
                <option value="national">National</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <input className={inputCls} placeholder="Optional" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="h-9 px-5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── EventDetailPopup ────────────────────────────────────────────────────────────
function EventDetailPopup({ event, holiday, canManage, onClose, onEdit, onDelete }: {
  event?: CalEvent | null; holiday?: Holiday | null;
  canManage: boolean; onClose: () => void;
  onEdit: () => void; onDelete: () => void;
}) {
  const item = event || holiday;
  if (!item) return null;
  const isHoliday = !!holiday;
  const cfg = isHoliday ? EVENT_TYPE_CONFIG.holiday : EVENT_TYPE_CONFIG[event?.eventType ?? 'company'];
  const dateStr = isHoliday
    ? formatDate(holiday!.date)
    : formatDate(event!.eventDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-modal z-10 overflow-hidden">
        <div className={cn('h-1.5 w-full', cfg.color)} />
        <div className="px-6 pt-5 pb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <Badge variant={cfg.badge as any} size="sm" className="mb-2">{cfg.label}</Badge>
              <h3 className="text-[16px] font-bold text-foreground leading-snug">{(item as Holiday).name ?? (item as CalEvent).title}</h3>
            </div>
            <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0"><X className="size-4" /></button>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Calendar className="size-4 shrink-0" /><span>{dateStr}</span>
            </div>
            {!isHoliday && event?.startTime && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>
              </div>
            )}
            {!isHoliday && event?.location && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" /><span>{event.location}</span>
              </div>
            )}
            {(isHoliday ? holiday!.description : event?.description) && (
              <p className="text-sm text-muted-foreground pt-1 border-t border-border">
                {isHoliday ? holiday!.description : event?.description}
              </p>
            )}
          </div>
          {canManage && (
            <div className="flex gap-2 mt-5 pt-4 border-t border-border">
              {!holiday?.isDefault && (
                <button onClick={onEdit} className="flex-1 h-8 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
                  <Edit2 className="size-3.5" /> Edit
                </button>
              )}
              {!holiday?.isDefault && (
                <button onClick={onDelete} className="flex-1 h-8 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-900/40 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5">
                  <Trash2 className="size-3.5" /> Delete
                </button>
              )}
              {!isHoliday && (
                <>
                  <button onClick={onEdit} className="flex-1 h-8 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
                    <Edit2 className="size-3.5" /> Edit
                  </button>
                  <button onClick={onDelete} className="flex-1 h-8 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-900/40 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5">
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── HolidayBanner ────────────────────────────────────────────────────────────
function HolidayBanner({ holiday }: { holiday: Holiday }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-400/30 mb-4">
      <span className="text-xl">🎉</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
          Today is a Public Holiday — Happy {holiday.name}!
        </p>
        <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-0.5">
          {formatDate(holiday.date)} · The dashboard remains fully accessible.
        </p>
      </div>
      <Badge variant="default" size="sm">Holiday</Badge>
    </div>
  );
}

// ── UpcomingSidebar ────────────────────────────────────────────────────────────
function UpcomingSidebar({ events, holidays, onEventClick, onHolidayClick, canManage, onAddHoliday, onEditHoliday, onDeleteHoliday }: {
  events: CalEvent[];
  holidays: Holiday[];
  onEventClick: (e: CalEvent) => void;
  onHolidayClick: (h: Holiday) => void;
  canManage: boolean;
  onAddHoliday: () => void;
  onEditHoliday: (h: Holiday) => void;
  onDeleteHoliday: (id: string) => void;
}) {
  const [tab, setTab] = useState<'upcoming' | 'holidays'>('upcoming');
  const now = new Date();

  const todayEvents = events.filter(e => isToday(parseISO(e.eventDate)));
  const todayHolidays = holidays.filter(h => isToday(parseISO(h.date)));

  const upcoming = [
    ...events
      .filter(e => parseISO(e.eventDate) > now)
      .sort((a, b) => parseISO(a.eventDate).getTime() - parseISO(b.eventDate).getTime())
      .slice(0, 8)
      .map(e => ({ type: 'event' as const, item: e, date: parseISO(e.eventDate) })),
    ...holidays
      .filter(h => parseISO(h.date) > now)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 5)
      .map(h => ({ type: 'holiday' as const, item: h, date: parseISO(h.date) })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 10);

  // Sort holidays nearest → farthest
  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [holidays]
  );

  function renderItem(type: 'event' | 'holiday', item: CalEvent | Holiday, idx: number) {
    const isHol = type === 'holiday';
    const cfg = isHol ? EVENT_TYPE_CONFIG.holiday : EVENT_TYPE_CONFIG[(item as CalEvent).eventType ?? 'company'];
    const title = isHol ? (item as Holiday).name : (item as CalEvent).title;
    const date = isHol ? (item as Holiday).date : (item as CalEvent).eventDate;
    return (
      <button key={idx} onClick={() => isHol ? onHolidayClick(item as Holiday) : onEventClick(item as CalEvent)}
        className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left group">
        <div className={cn('w-1 self-stretch rounded-full shrink-0 mt-0.5', cfg.color)} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate group-hover:text-rose-600 transition-colors">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{format(parseISO(date), 'MMM d, yyyy')}</p>
        </div>
        {isHol && <Flag className="size-3 text-rose-400 shrink-0 mt-1" />}
      </button>
    );
  }

  return (
    <Card padding="lg" className="flex flex-col gap-0">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border mb-4">
        <button onClick={() => setTab('upcoming')}
          className={cn('flex-1 h-7 rounded-md text-xs font-semibold transition-all',
            tab === 'upcoming' ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground')}>
          Upcoming
        </button>
        <button onClick={() => setTab('holidays')}
          className={cn('flex-1 h-7 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1',
            tab === 'holidays' ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground')}>
          🎉 Holidays
          <span className={cn('text-[10px] px-1 rounded', tab === 'holidays' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-muted text-muted-foreground')}>
            {holidays.length}
          </span>
        </button>
      </div>

      {tab === 'upcoming' && (
        <div className="flex flex-col gap-5">
          {/* Today */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Today</p>
            {todayHolidays.length === 0 && todayEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No events today</p>
            ) : (
              <div className="space-y-1">
                {todayHolidays.map((h, i) => renderItem('holiday', h, i))}
                {todayEvents.map((e, i) => renderItem('event', e, i + 100))}
              </div>
            )}
          </div>
          <div className="h-px bg-border" />
          {/* Upcoming */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Upcoming</p>
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No upcoming events</p>
            ) : (
              <div className="space-y-1">
                {upcoming.map((u, i) => renderItem(u.type, u.item, i))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'holidays' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Public Holidays</p>
            {canManage && (
              <button onClick={onAddHoliday}
                className="flex items-center gap-1 h-6 px-2 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold hover:bg-rose-500/20 transition-colors">
                <Plus className="size-3" /> Add
              </button>
            )}
          </div>
          <div className="space-y-0.5 max-h-[520px] overflow-y-auto pr-1">
            {sortedHolidays.map(h => (
              <div key={h.id}
                onClick={() => onHolidayClick(h)}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group">
                <span className="text-base shrink-0">🎉</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[12px] font-semibold text-foreground truncate group-hover:text-rose-600 transition-colors">{h.name}</p>
                    {h.isDefault && <span className="text-[9px] font-bold px-1 rounded bg-muted text-muted-foreground shrink-0">DEFAULT</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{format(parseISO(h.date), 'dd MMM yyyy')}</p>
                </div>
                {canManage && !h.isDefault && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={e => { e.stopPropagation(); onEditHoliday(h); }}
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Edit2 className="size-3" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); onDeleteHoliday(h.id); }}
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {sortedHolidays.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">No holidays found</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ── MonthView ──────────────────────────────────────────────────────────────────
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MonthView({ currentMonth, events, holidays, onDayClick, onEventClick, onHolidayClick }: {
  currentMonth: Date;
  events: CalEvent[];
  holidays: Holiday[];
  onDayClick: (date: Date) => void;
  onEventClick: (e: CalEvent) => void;
  onHolidayClick: (h: Holiday) => void;
}) {
  const firstDay = getDay(startOfMonth(currentMonth));
  const daysInMonth = getDaysInMonth(currentMonth);

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function getDateEvents(date: Date) {
    const ds = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.eventDate?.startsWith(ds));
  }
  function getDateHolidays(date: Date) {
    const ds = format(date, 'yyyy-MM-dd');
    return holidays.filter(h => h.date?.startsWith(ds));
  }

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d, i) => (
          <div key={d} className={cn(
            'text-center text-[11px] font-bold uppercase tracking-wider py-2',
            i === 0 || i === 6 ? 'text-rose-400' : 'text-muted-foreground/60'
          )}>{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="bg-muted/20 min-h-[80px]" />;
          const dayEvents = getDateEvents(date);
          const dayHolidays = getDateHolidays(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const today = isToday(date);
          const inMonth = isSameMonth(date, currentMonth);
          return (
            <div key={i}
              onClick={() => onDayClick(date)}
              className={cn(
                'min-h-[80px] p-1.5 cursor-pointer transition-colors group',
                isWeekend ? 'bg-muted/40' : 'bg-card',
                !inMonth && 'opacity-30',
                'hover:bg-primary-subtle/30'
              )}
            >
              <div className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-bold mb-1 mx-auto',
                today ? 'bg-rose-600 text-white' : 'text-foreground group-hover:bg-muted'
              )}>
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayHolidays.slice(0, 1).map(h => (
                  <button key={h.id} onClick={e => { e.stopPropagation(); onHolidayClick(h); }}
                    className="w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 truncate hover:bg-rose-500/25 transition-colors">
                    🎉 {h.name}
                  </button>
                ))}
                {dayEvents.slice(0, 2).map(ev => {
                  const cfg = EVENT_TYPE_CONFIG[ev.eventType ?? 'company'];
                  return (
                    <button key={ev.id} onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                      className={cn('w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded text-white truncate transition-opacity hover:opacity-80', cfg.color)}>
                      {ev.title}
                    </button>
                  );
                })}
                {(dayEvents.length + dayHolidays.length) > 3 && (
                  <p className="text-[10px] text-muted-foreground px-1">+{dayEvents.length + dayHolidays.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WeekView ──────────────────────────────────────────────────────────────────
function WeekView({ currentDate, events, holidays, onEventClick, onHolidayClick }: {
  currentDate: Date;
  events: CalEvent[];
  holidays: Holiday[];
  onEventClick: (e: CalEvent) => void;
  onHolidayClick: (h: Holiday) => void;
}) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden min-w-[560px]">
        {weekDays.map((day, i) => {
          const ds = format(day, 'yyyy-MM-dd');
          const dayEvents = events.filter(e => e.eventDate?.startsWith(ds));
          const dayHolidays = holidays.filter(h => h.date?.startsWith(ds));
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const today = isToday(day);
          return (
            <div key={i} className={cn('min-h-[200px] p-2', isWeekend ? 'bg-muted/40' : 'bg-card')}>
              <div className={cn(
                'text-center mb-2 pb-2 border-b border-border',
              )}>
                <p className={cn('text-[10px] font-bold uppercase tracking-wider', isWeekend ? 'text-rose-400' : 'text-muted-foreground/60')}>
                  {format(day, 'EEE')}
                </p>
                <div className={cn(
                  'flex size-7 items-center justify-center rounded-full text-sm font-bold mx-auto mt-0.5',
                  today ? 'bg-rose-600 text-white' : 'text-foreground'
                )}>{day.getDate()}</div>
              </div>
              <div className="space-y-1">
                {dayHolidays.map(h => (
                  <button key={h.id} onClick={() => onHolidayClick(h)}
                    className="w-full text-left text-[11px] font-semibold px-2 py-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 truncate hover:bg-rose-500/25 transition-colors">
                    🎉 {h.name}
                  </button>
                ))}
                {dayEvents.map(ev => {
                  const cfg = EVENT_TYPE_CONFIG[ev.eventType ?? 'company'];
                  return (
                    <button key={ev.id} onClick={() => onEventClick(ev)}
                      className={cn('w-full text-left text-[11px] font-semibold px-2 py-1 rounded-md text-white truncate hover:opacity-80 transition-opacity', cfg.color)}>
                      {ev.startTime && <span className="opacity-75 mr-1">{ev.startTime}</span>}
                      {ev.title}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── DayView ──────────────────────────────────────────────────────────────────
function DayView({ currentDate, events, holidays, onEventClick, onHolidayClick }: {
  currentDate: Date;
  events: CalEvent[];
  holidays: Holiday[];
  onEventClick: (e: CalEvent) => void;
  onHolidayClick: (h: Holiday) => void;
}) {
  const ds = format(currentDate, 'yyyy-MM-dd');
  const dayEvents = events.filter(e => e.eventDate?.startsWith(ds)).sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  const dayHolidays = holidays.filter(h => h.date?.startsWith(ds));
  const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

  return (
    <div className={cn('rounded-xl border border-border p-6', isWeekend && 'bg-muted/20')}>
      <div className="flex items-center gap-3 mb-6">
        <div className={cn('flex size-12 items-center justify-center rounded-xl text-xl font-black', isToday(currentDate) ? 'bg-rose-600 text-white' : 'bg-muted text-foreground')}>
          {currentDate.getDate()}
        </div>
        <div>
          <p className="text-[15px] font-bold text-foreground">{format(currentDate, 'EEEE')}</p>
          <p className="text-sm text-muted-foreground">{format(currentDate, 'MMMM yyyy')}</p>
        </div>
        {isWeekend && <Badge variant="muted" size="sm" className="ml-auto">Weekend</Badge>}
        {isToday(currentDate) && <Badge variant="default" size="sm" className="ml-auto">Today</Badge>}
      </div>
      {dayHolidays.length > 0 && (
        <div className="mb-4 space-y-2">
          {dayHolidays.map(h => (
            <button key={h.id} onClick={() => onHolidayClick(h)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-400/30 hover:bg-rose-500/15 transition-colors text-left">
              <span className="text-lg">🎉</span>
              <div>
                <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{h.name}</p>
                {h.description && <p className="text-xs text-rose-600/70">{h.description}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
      {dayEvents.length === 0 && dayHolidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Calendar className="size-10 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No events scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayEvents.map(ev => {
            const cfg = EVENT_TYPE_CONFIG[ev.eventType ?? 'company'];
            return (
              <button key={ev.id} onClick={() => onEventClick(ev)}
                className="w-full flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-elevated transition-all text-left group">
                <div className={cn('w-1 self-stretch rounded-full shrink-0', cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[14px] font-bold text-foreground group-hover:text-rose-600 transition-colors">{ev.title}</p>
                    <Badge variant={cfg.badge as any} size="sm">{cfg.label}</Badge>
                  </div>
                  {ev.startTime && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                    </p>
                  )}
                  {ev.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" />{ev.location}
                    </p>
                  )}
                  {ev.description && <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── HolidaysManagerPanel ────────────────────────────────────────────────────────────
function HolidaysManagerPanel({ holidays, canManage, onAdd, onEdit, onDelete }: {
  holidays: Holiday[];
  canManage: boolean;
  onAdd: () => void;
  onEdit: (h: Holiday) => void;
  onDelete: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const map: Record<string, Holiday[]> = {};
    holidays.forEach(h => {
      const yr = new Date(h.date).getFullYear().toString();
      if (!map[yr]) map[yr] = [];
      map[yr].push(h);
    });
    return map;
  }, [holidays]);

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-rose-500" />
          <h3 className="text-[14px] font-bold text-foreground">Public Holidays</h3>
          <Badge variant="muted" size="sm">{holidays.length}</Badge>
        </div>
        {canManage && (
          <Button size="sm" onClick={onAdd}><Plus className="size-3.5" /> Add Holiday</Button>
        )}
      </div>
      <div className="space-y-6">
        {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([year, list]) => (
          <div key={year}>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">{year}</p>
            <div className="space-y-1">
              {list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(h => (
                <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 shrink-0">
                    <span className="text-sm">🎉</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-semibold text-foreground truncate">{h.name}</p>
                      {h.isDefault && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{format(parseISO(h.date), 'dd MMM yyyy')} · {h.holidayType}</p>
                  </div>
                  {canManage && !h.isDefault && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(h)} className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Edit2 className="size-3" />
                      </button>
                      <button onClick={() => onDelete(h.id)} className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── CalendarPage ──────────────────────────────────────────────────────────────────
export function CalendarPage() {
  const user = useAppStore(s => s.user);
  const canManage = user ? CAN_MANAGE.includes(user.role) : false;
  const qc = useQueryClient();

  // View state
  const [view, setView] = useState<CalView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [showHolidayManager, setShowHolidayManager] = useState(false);

  // Modal state
  const [eventModal, setEventModal] = useState<{ open: boolean; event?: CalEvent | null }>({ open: false });
  const [holidayModal, setHolidayModal] = useState<{ open: boolean; holiday?: Holiday | null }>({ open: false });
  const [detailPopup, setDetailPopup] = useState<{ event?: CalEvent; holiday?: Holiday } | null>(null);

  // Data — current month for calendar view, all future for sidebar
  const { data: rawEvents = [] } = useCalendarEvents({ month: currentDate.getMonth() + 1, year: currentDate.getFullYear() });
  const { data: allFutureEvents = [] } = useCalendarEvents();
  const { data: rawHolidays = [] } = usePublicHolidays();
  const { data: todayHoliday } = useTodayHoliday();
  const { data: projectsData } = useProjects();

  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday();
  const deleteHoliday = useDeleteHoliday();

  /** After any create/update, invalidate notifications so the bell badge refreshes */
  function invalidateNotifications() {
    qc.invalidateQueries({ queryKey: ['notifications'] });
    qc.invalidateQueries({ queryKey: ['unread-count'] });
  }

  async function handleSaveEvent(data: Record<string, any>) {
    const result = await createEvent.mutateAsync(data);
    dispatchCalendarSync({ id: result.id, title: result.title, date: result.eventDate, type: 'event', action: 'created' });
    invalidateNotifications();
  }

  async function handleUpdateEvent(id: string, data: Record<string, any>) {
    const result = await updateEvent.mutateAsync({ id, data });
    dispatchCalendarSync({ id: result.id, title: result.title, date: result.eventDate, type: 'event', action: 'updated' });
    invalidateNotifications();
  }

  async function handleSaveHoliday(data: Record<string, any>) {
    const result = await createHoliday.mutateAsync(data);
    dispatchCalendarSync({ id: result.id, title: result.name, date: result.date, type: 'holiday', action: 'created' });
    invalidateNotifications();
  }

  async function handleUpdateHoliday(id: string, data: Record<string, any>) {
    const result = await updateHoliday.mutateAsync({ id, data });
    dispatchCalendarSync({ id: result.id, title: result.name, date: result.date, type: 'holiday', action: 'updated' });
    invalidateNotifications();
  }

  // Merge project deadlines into events
  const deadlineEvents: CalEvent[] = useMemo(() => {
    const projects = projectsData?.data ?? [];
    return projects
      .filter((p: any) => p.endDate)
      .map((p: any) => ({
        id: `deadline-${p.id}`,
        title: `🚨 ${p.name} Deadline`,
        eventType: 'deadline',
        eventDate: p.endDate,
        description: `Project deadline for ${p.name}`,
      }));
  }, [projectsData]);

  const allEvents: CalEvent[] = useMemo(() => [...rawEvents, ...deadlineEvents], [rawEvents, deadlineEvents]);
  const allEventsForSidebar: CalEvent[] = useMemo(() => [...allFutureEvents, ...deadlineEvents], [allFutureEvents, deadlineEvents]);

  // Filter + search
  const filteredEvents = useMemo(() => {
    let evs = allEvents;
    if (filter === 'company') evs = evs.filter(e => e.eventType !== 'deadline');
    if (filter === 'deadline') evs = evs.filter(e => e.eventType === 'deadline');
    if (filter === 'holiday') evs = [];
    if (search) evs = evs.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
    return evs;
  }, [allEvents, filter, search]);

  const filteredHolidays = useMemo(() => {
    let hols = rawHolidays;
    if (filter === 'company' || filter === 'deadline') hols = [];
    if (search) hols = hols.filter((h: Holiday) => h.name.toLowerCase().includes(search.toLowerCase()));
    return hols;
  }, [rawHolidays, filter, search]);

  // Navigation
  function navigate(dir: 1 | -1) {
    if (view === 'month') setCurrentDate(d => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
    if (view === 'week')  setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    if (view === 'day')   setCurrentDate(d => dir === 1 ? addDays(d, 1) : subDays(d, 1));
  }

  function getTitle() {
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'week') {
      const ws = startOfWeek(currentDate);
      const we = addDays(ws, 6);
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'EEEE, MMMM d, yyyy');
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Calendar"
        description={getTitle()}
        breadcrumbs={[{ label: 'Workspace' }, { label: 'Calendar' }]}
        actions={
          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <Button variant="outline" size="sm" onClick={() => setHolidayModal({ open: true, holiday: null })}>
                  <Flag className="size-3.5" /> Add Holiday
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowHolidayManager(s => !s)}>
                  <Globe className="size-3.5" /> {showHolidayManager ? 'Hide Holidays' : 'Manage Holidays'}
                </Button>
                <Button size="sm" onClick={() => setEventModal({ open: true, event: null })}>
                  <Plus className="size-4" strokeWidth={2.5} /> New Event
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Holiday banner */}
      {todayHoliday && <HolidayBanner holiday={todayHoliday} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            className="h-9 w-full rounded-lg border border-border bg-card pl-8 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border">
          {(['all', 'holiday', 'company', 'deadline'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                'h-7 px-3 rounded-md text-xs font-semibold capitalize transition-all',
                filter === f ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}>
              {f === 'holiday' ? '🎉 Holidays' : f === 'company' ? '🏢 Events' : f === 'deadline' ? '🚨 Deadlines' : 'All'}
            </button>
          ))}
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border ml-auto">
          {(['month', 'week', 'day'] as CalView[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn(
                'h-7 px-3 rounded-md text-xs font-semibold capitalize transition-all',
                view === v ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}>{v}</button>
          ))}
        </div>

        {/* Nav */}
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="flex size-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors">Today</button>
          <button onClick={() => navigate(1)} className="flex size-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(EVENT_TYPE_CONFIG).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className={cn('size-2 rounded-full', v.dot)} />
            <span className="text-xs text-muted-foreground">{v.label}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Calendar */}
        <Card padding="lg" className="xl:col-span-3">
          {/* Month/Year heading inside card */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-foreground tracking-tight">{getTitle()}</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => navigate(-1)} className="flex size-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                <ChevronLeft className="size-3.5" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="h-7 px-2.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors">Today</button>
              <button onClick={() => navigate(1)} className="flex size-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
          {view === 'month' && (
            <MonthView
              currentMonth={currentDate}
              events={filteredEvents}
              holidays={filteredHolidays}
              onDayClick={d => { setCurrentDate(d); setView('day'); }}
              onEventClick={e => setDetailPopup({ event: e })}
              onHolidayClick={h => setDetailPopup({ holiday: h })}
            />
          )}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              holidays={filteredHolidays}
              onEventClick={e => setDetailPopup({ event: e })}
              onHolidayClick={h => setDetailPopup({ holiday: h })}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              holidays={filteredHolidays}
              onEventClick={e => setDetailPopup({ event: e })}
              onHolidayClick={h => setDetailPopup({ holiday: h })}
            />
          )}
        </Card>

        {/* Sidebar */}
        <UpcomingSidebar
          events={allEventsForSidebar}
          holidays={rawHolidays}
          onEventClick={e => setDetailPopup({ event: e })}
          onHolidayClick={h => setDetailPopup({ holiday: h })}
          canManage={canManage}
          onAddHoliday={() => setHolidayModal({ open: true, holiday: null })}
          onEditHoliday={h => setHolidayModal({ open: true, holiday: h })}
          onDeleteHoliday={id => deleteHoliday.mutate(id)}
        />
      </div>

      {/* Holidays manager */}
      {showHolidayManager && (
        <HolidaysManagerPanel
          holidays={rawHolidays}
          canManage={canManage}
          onAdd={() => setHolidayModal({ open: true, holiday: null })}
          onEdit={h => setHolidayModal({ open: true, holiday: h })}
          onDelete={id => deleteHoliday.mutate(id)}
        />
      )}

      {/* Modals */}
      <EventFormModal
        open={eventModal.open}
        onClose={() => setEventModal({ open: false })}
        event={eventModal.event}
        onSave={handleSaveEvent}
        onUpdate={handleUpdateEvent}
      />
      <HolidayFormModal
        open={holidayModal.open}
        onClose={() => setHolidayModal({ open: false })}
        holiday={holidayModal.holiday}
        onSave={handleSaveHoliday}
        onUpdate={handleUpdateHoliday}
      />
      {detailPopup && (
        <EventDetailPopup
          event={detailPopup.event}
          holiday={detailPopup.holiday}
          canManage={canManage}
          onClose={() => setDetailPopup(null)}
          onEdit={() => {
            const ev = detailPopup.event;
            const hol = detailPopup.holiday;
            setDetailPopup(null);
            if (ev) setEventModal({ open: true, event: ev });
            if (hol) setHolidayModal({ open: true, holiday: hol });
          }}
          onDelete={() => {
            const ev = detailPopup.event;
            const hol = detailPopup.holiday;
            setDetailPopup(null);
            if (ev && !ev.id.startsWith('deadline-')) deleteEvent.mutate(ev.id);
            if (hol) deleteHoliday.mutate(hol.id);
          }}
        />
      )}
    </div>
  );
}
