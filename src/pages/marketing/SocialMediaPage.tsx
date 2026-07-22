import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, SlidersHorizontal, Pencil, Trash2, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BarChartComponent } from '@/components/charts/Charts';
import { cn } from '@/utils';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';

// ── Data ──────────────────────────────────────────────────────────────────────

const platforms = [
  { name: 'Instagram', value: '3,526K', change: '+2.97%', up: true,  color: '#e1306c', bg: 'bg-pink-50 dark:bg-pink-950/20',   label: 'Followers',   icon: 'IG' },
  { name: 'Facebook',  value: '8,236K', change: '+16.98%',up: true,  color: '#1877f2', bg: 'bg-blue-50 dark:bg-blue-950/20',   label: 'Followers',   icon: 'FB' },
  { name: 'Youtube',   value: '12.3M',  change: '+9.75%', up: true,  color: '#ff0000', bg: 'bg-red-50 dark:bg-red-950/20',     label: 'Subscribers', icon: 'YT' },
  { name: 'Twitter',   value: '12,746K',change: '+12.85%',up: true,  color: '#000000', bg: 'bg-slate-50 dark:bg-slate-950/20', label: 'Followers',   icon: 'X' },
  { name: 'LinkedIn',  value: '315K',   change: '+34.78%',up: true,  color: '#0a66c2', bg: 'bg-sky-50 dark:bg-sky-950/20',     label: 'Followers',   icon: 'LI' },
];

const audienceData = [
  { name: 'Female Users', value: 1200, color: '#6366f1', pct: 62 },
  { name: 'Male Users',   value: 750,  color: '#10b981', pct: 38 },
];

const profileVisits = [
  { label: 'Jan', facebook: 80,  instagram: 110, twitter: 70 },
  { label: 'Feb', facebook: 95,  instagram: 130, twitter: 85 },
  { label: 'Mar', facebook: 70,  instagram: 120, twitter: 60 },
  { label: 'Apr', facebook: 110, instagram: 140, twitter: 90 },
  { label: 'May', facebook: 90,  instagram: 125, twitter: 75 },
  { label: 'Jun', facebook: 120, instagram: 150, twitter: 100 },
  { label: 'Jul', facebook: 100, instagram: 135, twitter: 88 },
  { label: 'Aug', facebook: 130, instagram: 155, twitter: 110 },
  { label: 'Sep', facebook: 85,  instagram: 118, twitter: 72 },
  { label: 'Oct', facebook: 115, instagram: 145, twitter: 95 },
  { label: 'Nov', facebook: 105, instagram: 138, twitter: 82 },
  { label: 'Dec', facebook: 125, instagram: 160, twitter: 105 },
];

const trafficSources = [
  { name: 'Facebook',  followers: '25,145', pct: 56, change: '+2.4%', up: true,  color: '#1877f2', icon: 'FB' },
  { name: 'Instagram', followers: '19,762', pct: 35, change: '+1.1%', up: true,  color: '#e1306c', icon: 'IG' },
  { name: 'LinkedIn',  followers: '6,745',  pct: 18, change: '+3.2%', up: true,  color: '#0a66c2', icon: 'LI' },
  { name: 'Twitter',   followers: '12,384', pct: 22, change: '-2.1%', up: false, color: '#000000', icon: 'X' },
  { name: 'Youtube',   followers: '13,454', pct: 23, change: '+1.8%', up: true,  color: '#ff0000', icon: 'YT' },
];

const postInsights = [
  { title: 'Creator Studio Tour',    type: 'Video campaign',    date: '15 Feb, 2024', channel: 'YouTube',   channelColor: '#ff0000', reach: '9.5K+',  revenue: '$127,443' },
  { title: 'Growth Mindset Reel',    type: 'Motivation post',   date: '14 Feb, 2024', channel: 'Instagram', channelColor: '#e1306c', reach: '1M+',    revenue: '$674,474' },
  { title: 'Weekend Travel Vlog',    type: 'Lifestyle content', date: '13 Feb, 2024', channel: 'Twitter',   channelColor: '#000000', reach: '10K+',   revenue: '$12,575' },
  { title: 'Quick Recipe Shorts',    type: 'Food content',      date: '12 Feb, 2024', channel: 'Snapchat',  channelColor: '#fffc00', reach: '3.5K',   revenue: '$1,238,470' },
  { title: 'Style Trends Guide',     type: 'Fashion update',    date: '11 Feb, 2024', channel: 'Facebook',  channelColor: '#1877f2', reach: '1.6M+',  revenue: '$12,734' },
];

const performanceData = [
  { channel: 'YouTube',   icon: 'YT', color: '#ff0000', date: '2024-03-18', reactions: 1250, replies: 185, reposts: 96,  reach: 48500, reachColor: '#fef3c7', engagement: '6.8%' },
  { channel: 'X Platform',icon: 'X',  color: '#000000', date: '2024-03-17', reactions: 980,  replies: 142, reposts: 210, reach: 36300, reachColor: '#ede9fe', engagement: '5.4%' },
  { channel: 'Facebook',  icon: 'FB', color: '#1877f2', date: '2024-03-16', reactions: 1740, replies: 268, reposts: 318, reach: 62900, reachColor: '#dcfce7', engagement: '7.2%' },
  { channel: 'Instagram', icon: 'IG', color: '#e1306c', date: '2024-03-15', reactions: 2420, replies: 340, reposts: 155, reach: 71360, reachColor: '#fce7f3', engagement: '8.6%' },
  { channel: 'LinkedIn',  icon: 'LI', color: '#0a66c2', date: '2024-03-14', reactions: 760,  replies: 98,  reposts: 84,  reach: 38000, reachColor: '#dbeafe', engagement: '4.9%' },
];

// ── Icon helper ───────────────────────────────────────────────────────────────

function PlatformIcon({ icon, color, size = 'md' }: { icon: string; color: string; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'size-6 text-[9px]' : 'size-9 text-[11px]';
  return (
    <div className={cn('flex items-center justify-center rounded-full font-black text-white shrink-0', sz)}
      style={{ background: color === '#fffc00' ? '#fffc00' : color, color: color === '#fffc00' ? '#000' : '#fff' }}>
      {icon}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SocialMediaPage() {
  const [search, setSearch] = useState('');

  const filteredPerf = performanceData.filter(r =>
    r.channel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Media Dashboard"
        description="Track your social media performance across all platforms"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Social Media' }]}
      />

      {/* ── Platform cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {platforms.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card padding="md" className="hover:shadow-elevated transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-3">
                <PlatformIcon icon={p.icon} color={p.color} />
                <p className="text-[12px] font-semibold text-foreground">{p.name}</p>
              </div>
              <p className="text-2xl font-black text-foreground tabular-nums">{p.value}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={cn('text-[11px] font-bold', p.up ? 'text-emerald-600' : 'text-red-500')}>{p.change}</span>
                <span className="text-[11px] text-muted-foreground">{p.label}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Audience Reached ── */}
      <Card padding="lg">
        <p className="text-sm font-bold text-foreground mb-4">Audience Reached</p>
        <div className="flex flex-col items-center gap-6">
          {/* Donut */}
          <div className="relative" style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={audienceData} cx="50%" cy="50%" innerRadius={68} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {audienceData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-muted-foreground font-medium">Audience</p>
              <p className="text-2xl font-black text-foreground">1950</p>
            </div>
          </div>

          {/* Gender rows */}
          <div className="w-full max-w-lg space-y-3">
            {audienceData.map((d) => (
              <div key={d.name} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <span className="text-base">{d.name.startsWith('Female') ? '👩' : '👨'}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {d.name.startsWith('Female') ? 'Activity dropped by ' : 'Growth improved by '}
                      <span className={cn('font-bold', d.name.startsWith('Female') ? 'text-red-500' : 'text-emerald-600')}>
                        {d.name.startsWith('Female') ? '2.75%' : '0.64%'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-foreground tabular-nums">{d.value}</p>
                  <p className="text-[10px] text-muted-foreground">Users</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Profile Visits ── */}
      <Card padding="lg">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-bold text-foreground">Profile Visits</p>
          <div className="flex items-center gap-4">
            {[{ label: 'Facebook', color: '#1877f2' }, { label: 'Instagram', color: '#e1306c' }, { label: 'Twitter', color: '#000000' }].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-sm font-bold text-foreground">
                  {s.label === 'Facebook' ? '27.12K' : s.label === 'Instagram' ? '78.52K' : '52.18K'}
                </p>
              </div>
            ))}
          </div>
        </div>
        <BarChartComponent
          data={profileVisits}
          series={[
            { key: 'facebook',  label: 'Facebook',  color: '#6366f1' },
            { key: 'instagram', label: 'Instagram',  color: '#a5b4fc' },
            { key: 'twitter',   label: 'Twitter',    color: '#c7d2fe' },
          ]}
          height={220}
          stacked
        />
      </Card>

      {/* ── Traffic Sources ── */}
      <Card padding="lg">
        <p className="text-sm font-bold text-foreground mb-4">Traffic Sources</p>
        <div className="space-y-3">
          {trafficSources.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
              <PlatformIcon icon={s.icon} color={s.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">{s.followers} Followers</p>
              </div>
              {/* progress bar */}
              <div className="hidden sm:block w-32">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
              <div className="text-right shrink-0 w-20">
                <p className="text-sm font-bold text-foreground">{s.pct}%</p>
                <p className={cn('text-[10px] font-semibold', s.up ? 'text-emerald-600' : 'text-red-500')}>{s.change}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* ── Post Insight ── */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">Post Insight</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="size-3.5" /> Export</Button>
            <Button variant="outline" size="sm"><SlidersHorizontal className="size-3.5" /> Sort By</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Post</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Channel</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Reach</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Revenue</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {postInsights.map((p, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-muted shrink-0 flex items-center justify-center text-base">🖼️</div>
                      <div>
                        <p className="font-semibold text-foreground">{p.title}</p>
                        <p className="text-[10px] text-muted-foreground">{p.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.date}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ background: p.channelColor, color: p.channelColor === '#fffc00' ? '#000' : '#fff' }}>
                      {p.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{p.reach}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{p.revenue}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                        <Pencil className="size-3 text-muted-foreground" />
                      </button>
                      <button className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-red-50 hover:border-red-200 transition-colors">
                        <Trash2 className="size-3 text-red-400" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Social Media Performance ── */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-bold text-foreground">Social Media Performance</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Platform"
                className="h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 w-40"
              />
            </div>
            <Button variant="outline" size="sm"><SlidersHorizontal className="size-3.5" /> Sort By</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Channel</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Posted Date</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Reactions</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Replies</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Reposts</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Reach</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Engagement</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPerf.map((r, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <PlatformIcon icon={r.icon} color={r.color} size="sm" />
                      <span className="font-semibold text-foreground">{r.channel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{r.reactions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-foreground">{r.replies}</td>
                  <td className="px-4 py-3 text-foreground">{r.reposts}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: r.reachColor, color: '#374151' }}>
                      {r.reach.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{r.engagement}</td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 transition-colors">
                      Analyze
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {filteredPerf.length} Channels →</p>
          <div className="flex items-center gap-1">
            {['Prev', '1', '2', 'Next'].map(p => (
              <button key={p} className={cn(
                'px-2.5 py-1 rounded text-[11px] font-semibold transition-colors',
                p === '1' ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:bg-muted'
              )}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
