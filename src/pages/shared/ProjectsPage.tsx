import { useState } from 'react';
import { Plus, Search, FolderKanban, Users, Calendar, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProjects } from '@/hooks';
import { formatDate } from '@/utils';
import { CreateProjectModal } from '@/components/forms/FormModals';

const statusVariant = { active: 'success', on_hold: 'warning', completed: 'secondary', archived: 'muted' } as const;

export function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading } = useProjects({ search: search || undefined, limit: 50 });
  const projects = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description={`${data?.meta?.total ?? 0} projects`}
        breadcrumbs={[{ label: 'Work' }, { label: 'Projects' }]}
        actions={<><Button size="md" onClick={() => setShowCreate(true)}><Plus className="size-4" strokeWidth={2.5} /> New Project</Button><CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} /></>}
      />

      <div className="flex items-center gap-3">
        <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="size-3.5" />} className="max-w-sm" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project: any, i: number) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card hover padding="lg" className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg shrink-0" style={{ background: (project.color ?? '#6366f1') + '22' }}>
                      <FolderKanban className="size-4" style={{ color: project.color ?? '#6366f1' }} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-xs"><MoreHorizontal className="size-4" /></Button>
                </div>

                <Progress value={project.progress} size="md" color="rose" showLabel label="Progress" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    <span>{project.owner?.name ?? 'Unassigned'}</span>
                  </div>
                  {project.endDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      <span>Due {formatDate(project.endDate)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Badge variant={statusVariant[project.status as keyof typeof statusVariant] ?? 'muted'}>{project.status?.replace('_', ' ')}</Badge>
                  <Button variant="outline" size="xs" onClick={() => navigate('/sprint')}>View Board</Button>
                </div>
              </Card>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: projects.length * 0.06 }}>
            <Card padding="lg" onClick={() => setShowCreate(true)} className="flex flex-col items-center justify-center gap-3 border-dashed cursor-pointer hover:border-rose-400 hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors min-h-[200px]">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <Plus className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">New Project</p>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
