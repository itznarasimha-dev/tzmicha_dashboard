/**
 * EventSyncToast — global popup that fires whenever a new calendar event
 * or public holiday is created / updated by HR / Admin.
 *
 * Usage: mount once inside AppLayout. It listens to a custom DOM event
 * ("calendar:sync") dispatched by CalendarPage after every mutation.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Flag, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

export interface CalendarSyncPayload {
  id: string;
  title: string;
  date: string;          // ISO string
  type: 'event' | 'holiday';
  action: 'created' | 'updated' | 'deleted';
}

/** Dispatch this from CalendarPage after every successful mutation */
export function dispatchCalendarSync(payload: CalendarSyncPayload) {
  window.dispatchEvent(new CustomEvent('calendar:sync', { detail: payload }));
}

interface ToastItem extends CalendarSyncPayload {
  toastId: string;
}

export function EventSyncToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handler(e: Event) {
      const payload = (e as CustomEvent<CalendarSyncPayload>).detail;
      if (payload.action === 'deleted') return; // no toast for deletes
      const toastId = `${payload.id}-${Date.now()}`;
      setToasts(prev => [...prev, { ...payload, toastId }]);
      // Auto-dismiss after 6 s
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.toastId !== toastId));
      }, 6000);
    }
    window.addEventListener('calendar:sync', handler);
    return () => window.removeEventListener('calendar:sync', handler);
  }, []);

  return (
    <div className="fixed top-[64px] right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.toastId}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto w-80 rounded-2xl border border-border bg-card shadow-modal overflow-hidden"
          >
            {/* Accent bar */}
            <div className={`h-1 w-full ${toast.type === 'holiday' ? 'bg-rose-500' : 'bg-blue-500'}`} />
            <div className="flex items-start gap-3 p-4">
              <div className={`flex size-9 items-center justify-center rounded-xl shrink-0 ${toast.type === 'holiday' ? 'bg-rose-500/10' : 'bg-blue-500/10'}`}>
                {toast.type === 'holiday'
                  ? <Flag className="size-4 text-rose-500" />
                  : <Calendar className="size-4 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground leading-snug">
                  {toast.action === 'updated' ? 'Event Updated' : toast.type === 'holiday' ? '🎉 New Holiday' : '📅 New Event'}
                </p>
                <p className="text-xs font-semibold text-foreground/80 mt-0.5 truncate">{toast.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(parseISO(toast.date), 'EEE, MMM d yyyy')}
                </p>
                <Link
                  to="/calendar"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-500 transition-colors mt-1 inline-block"
                >
                  View in Calendar →
                </Link>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.toastId !== toast.toastId))}
                className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
