/**
 * TodayEventBanner — shows a prominent banner for today's holiday or company event.
 * Renders nothing if there is nothing today.
 */
import { isToday, parseISO } from 'date-fns';
import { Badge } from './Badge';
import { useCalendarEvents, useTodayHoliday } from '@/hooks';

export function TodayEventBanner() {
  const { data: todayHoliday } = useTodayHoliday();
  const { data: calEvents = [] } = useCalendarEvents();

  // Today's company events (non-holiday)
  const todayEvents = (calEvents as any[]).filter(
    (e) => isToday(parseISO(e.eventDate))
  );

  if (!todayHoliday && todayEvents.length === 0) return null;

  // Holiday takes priority
  if (todayHoliday) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-400/30">
        <span className="text-xl">🎉</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
            Today: {todayHoliday.name}
          </p>
          <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-0.5">
            Public Holiday · The dashboard remains fully accessible.
          </p>
        </div>
        <Badge variant="default" size="sm">Holiday</Badge>
      </div>
    );
  }

  // Company event(s) today
  return (
    <div className="flex flex-col gap-2">
      {todayEvents.map((ev: any) => (
        <div key={ev.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-400/30">
          <span className="text-xl">📅</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Today: {ev.title}
            </p>
            {ev.description && (
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">{ev.description}</p>
            )}
          </div>
          <Badge variant="blue" size="sm">Today</Badge>
        </div>
      ))}
    </div>
  );
}
