import { useState } from 'react';
import { Search, Plus, Filter, Mail, Phone, MapPin, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUsers } from '@/hooks';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants';
import { cn, formatDate } from '@/utils';
import type { UserRole } from '@/types';
import { AddEmployeeModal } from '@/components/forms/FormModals';

export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useUsers({ search: search || undefined, limit: 50 });
  const employees = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={`${data?.meta?.total ?? 0} team members`}
        breadcrumbs={[{ label: 'People' }, { label: 'Employees' }]}
        actions={<><Button size="md" onClick={() => setShowAdd(true)}><Plus className="size-4" strokeWidth={2.5} /> Add Employee</Button><AddEmployeeModal open={showAdd} onClose={() => setShowAdd(false)} /></>}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="size-3.5" />} className="flex-1 min-w-[160px] max-w-sm" />
        <Button variant="outline" size="sm"><Filter className="size-3.5" /> Filter</Button>
        <div className="ml-auto flex items-center gap-px rounded-md border border-border bg-muted/30 p-0.5">
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn('flex size-7 items-center justify-center rounded transition-all duration-150', view === v ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {v === 'grid' ? <LayoutGrid className="size-3.5" /> : <List className="size-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {employees.map((emp: any, i: number) => (
                <motion.div key={emp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card hover padding="lg" className="flex flex-col items-center text-center gap-3">
                    <Avatar name={emp.name} src={emp.avatar} size="lg" showStatus status={emp.status} />
                    <div className="w-full">
                      <p className="text-[13px] font-semibold text-foreground">{emp.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{emp.title}</p>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </div>
                    <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', ROLE_COLORS[emp.role as UserRole])}>
                      {ROLE_LABELS[emp.role as UserRole]}
                    </span>
                    <div className="flex items-center gap-2 w-full pt-3 border-t border-border">
                      <Button variant="ghost" size="icon-xs" className="flex-1"><Mail className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon-xs" className="flex-1"><Phone className="size-3.5" /></Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              <Card padding="none">
                <div className="divide-y divide-border">
                  {employees.map((emp: any, i: number) => (
                    <motion.div key={emp.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group">
                      <Avatar name={emp.name} src={emp.avatar} size="md" showStatus status={emp.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.title}</p>
                      </div>
                      <div className="hidden md:block text-xs text-muted-foreground w-28 shrink-0">{emp.department}</div>
                      <span className={cn('hidden sm:inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', ROLE_COLORS[emp.role as UserRole])}>
                        {ROLE_LABELS[emp.role as UserRole]}
                      </span>
                      <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground w-28 shrink-0">
                        <MapPin className="size-3" /> {emp.location ?? 'Remote'}
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">Since {formatDate(emp.startDate, 'MMM yyyy')}</div>
                      <Badge variant={emp.status === 'active' ? 'success' : emp.status === 'on_leave' ? 'warning' : 'muted'} dot>{emp.status}</Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
