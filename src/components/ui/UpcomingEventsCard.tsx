import { Link } from 'react-router-dom';
import { Calendar, Flag, ArrowRight } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { cn } from '@/utils';
import { useCalendarEvents, usePublicHolidays } from '@/hooks';

interface EventItem {
  id: string;
  title: string;
  date: string;
  type: 'event' | 'holiday';
  eventType?: string;
}

const TYPE_COLOR: Record<string, string> = {
  company:  'bg-blue-500',
  meeting:  'bg-violet-500',
  deadline: 'bg-red-500',
  holiday:  'bg-rose-500',
  other:    'bg-amber-500',
};

function dateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d))    return { text: 'Today',    variant: 'default' as const };
  if (isTomorrow(d)) return { text: 'Tomorrow', variant: 'warning' as const };
  return null;
}

export function UpcomingEventsCard() {
  const { data: calEvents = [] } = useCalendarEvents();
  const { data: holidays = [] } = usePublicHolidays();

  // Merge events + holidays, filter out past (strictly before today), sort nearest first
  const items: EventItem[] = [
    ...calEvents
      .filter((e: any) => !isPast(startOfDay(parseISO(e.eventDate))) || isToday(parseISO(e.eventDate)))
      .map((e: any): EventItem => ({ id: e.id, title: e.title, date: e.eventDate, type: 'event', eventType: e.eventType })),
    ...holidays
      .filter((h: any) => !isPast(startOfDay(parseISO(h.date))) || isToday(parseISO(h.date)))
      .map((h: any): EventItem => ({ id: h.id, title: h.name, date: h.date, type: 'holiday' })),
  ].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()).slice(0, 6);

  const todayItems = items.filter(i => isToday(parseISO(i.date)));
  const upcomingItems = items.filter(i => !isToday(parseISO(i.date)));

  return (
    <Card padding="lg">
      <CardHeader>
        <div>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Holidays &amp; company events</CardDescription>
        </div>
        <Link to="/calendar">
          <Button variant="ghost" size="icon-xs"><ArrowRight className="size-3.5" /></Button>
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Calendar className="size-8 text-muted-foreground/25" />
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Today's prominent card */}
            <AnimatePresence initial={false}>
              {todayItems.map(item => (
                <motion.div
                  key={`today-${item.id}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <TodayEventCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>

            {todayItems.length > 0 && upcomingItems.length > 0 && (
              <div className="h-px bg-border my-2" />
            )}

            <AnimatePresence initial={false}>
              {upcomingItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <EventRow item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Prominent card shown when an event/holiday is TODAY */
function TodayEventCard({ item }: { item: EventItem }) {
  const isHoliday = item.type === 'holiday';
  const emoji = isHoliday ? '🎉' : '📅';
  return (
    <Link to="/calendar">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-rose-300/50 bg-rose-500/8 hover:bg-rose-500/12 dark:border-rose-800/40 transition-colors cursor-pointer group">
        <span className="text-xl shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-rose-700 dark:text-rose-300 truncate group-hover:text-rose-600 transition-colors">
            Today: {item.title}
          </p>
          <p className="text-xs text-rose-600/70 dark:text-rose-400/70">
            {format(parseISO(item.date), 'EEEE, MMMM d yyyy')}
          </p>
        </div>
        <Badge variant="default" size="sm">Today</Badge>
      </div>
    </Link>
  );
}

function EventRow({ item }: { item: EventItem }) {
  const label = dateLabel(item.date);
  const isHoliday = item.type === 'holiday';
  const color = isHoliday ? TYPE_COLOR.holiday : (TYPE_COLOR[item.eventType ?? 'company'] ?? TYPE_COLOR.company);

  return (
    <Link to="/calendar">
      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group">
        <div className={cn('flex size-8 items-center justify-center rounded-lg shrink-0', isHoliday ? 'bg-rose-500/10' : 'bg-blue-500/10')}>
          {isHoliday
            ? <Flag className="size-4 text-rose-500" />
            : <Calendar className="size-4 text-blue-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold truncate text-foreground group-hover:text-rose-600 transition-colors">
            {isHoliday ? '🎉 ' : ''}{item.title}
          </p>
          <p className="text-xs text-muted-foreground">{format(parseISO(item.date), 'EEE, MMM d yyyy')}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={cn('w-1.5 h-1.5 rounded-full', color)} />
          {label && <Badge variant={label.variant} size="sm">{label.text}</Badge>}
        </div>
      </div>
    </Link>
  );
}
