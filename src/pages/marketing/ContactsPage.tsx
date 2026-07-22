import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Upload, Download, Edit2, Trash2,
  UserCheck, GitMerge, Filter, ChevronDown, X, Loader2,
  Building2, Mail, Phone, MapPin, Tag, User,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost';

interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  industry: string;
  city: string;
  assignedTo: string;
  status: LeadStatus;
  score: number;
  createdAt: string;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; variant: any; color: string }> = {
  new:           { label: 'New',           variant: 'blue',      color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  contacted:     { label: 'Contacted',     variant: 'warning',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  qualified:     { label: 'Qualified',     variant: 'success',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  proposal_sent: { label: 'Proposal Sent', variant: 'secondary', color: 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400' },
  won:           { label: 'Won',           variant: 'success',   color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
  lost:          { label: 'Lost',          variant: 'danger',    color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
};

const SOURCES = ['Organic Search', 'WhatsApp', 'Email', 'SMS', 'Paid Ads', 'Referral', 'LinkedIn', 'Cold Call'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Education', 'Manufacturing', 'Real Estate'];
const ASSIGNEES = ['Priya Sharma', 'Rahul Mehta', 'Anita Singh', 'Vikram Nair', 'Kavya Iyer'];

const initialLeads: Lead[] = [
  { id: 1,  name: 'Rahul Sharma',    company: 'TechCorp India',     email: 'rahul@techcorp.in',    phone: '+91 98765 43210', source: 'Organic Search', industry: 'Technology',    city: 'Mumbai',    assignedTo: 'Priya Sharma',  status: 'qualified',     score: 82, createdAt: '2025-07-10' },
  { id: 2,  name: 'Priya Mehta',     company: 'FinServ Ltd',        email: 'priya@finserv.com',    phone: '+91 91234 56789', source: 'WhatsApp',       industry: 'Finance',       city: 'Delhi',     assignedTo: 'Rahul Mehta',   status: 'contacted',     score: 65, createdAt: '2025-07-11' },
  { id: 3,  name: 'Amit Kumar',      company: 'HealthPlus',         email: 'amit@healthplus.in',   phone: '+91 99887 76655', source: 'Email',          industry: 'Healthcare',    city: 'Bangalore', assignedTo: 'Anita Singh',   status: 'new',           score: 40, createdAt: '2025-07-12' },
  { id: 4,  name: 'Sneha Iyer',      company: 'RetailMax',          email: 'sneha@retailmax.com',  phone: '+91 88776 65544', source: 'Paid Ads',       industry: 'Retail',        city: 'Chennai',   assignedTo: 'Vikram Nair',   status: 'proposal_sent', score: 91, createdAt: '2025-07-08' },
  { id: 5,  name: 'Vikram Singh',    company: 'EduTech Solutions',  email: 'vikram@edutech.in',    phone: '+91 77665 54433', source: 'Referral',       industry: 'Education',     city: 'Hyderabad', assignedTo: 'Kavya Iyer',    status: 'won',           score: 95, createdAt: '2025-07-05' },
  { id: 6,  name: 'Kavya Nair',      company: 'ManufactPro',        email: 'kavya@manufactpro.in', phone: '+91 66554 43322', source: 'LinkedIn',       industry: 'Manufacturing', city: 'Pune',      assignedTo: 'Priya Sharma',  status: 'lost',          score: 28, createdAt: '2025-07-09' },
  { id: 7,  name: 'Arjun Patel',     company: 'PropTech Realty',    email: 'arjun@proptech.in',    phone: '+91 55443 32211', source: 'Cold Call',      industry: 'Real Estate',   city: 'Ahmedabad', assignedTo: 'Rahul Mehta',   status: 'contacted',     score: 58, createdAt: '2025-07-13' },
  { id: 8,  name: 'Divya Reddy',     company: 'CloudSoft Systems',  email: 'divya@cloudsoft.in',   phone: '+91 44332 21100', source: 'SMS',            industry: 'Technology',    city: 'Bangalore', assignedTo: 'Anita Singh',   status: 'new',           score: 35, createdAt: '2025-07-14' },
  { id: 9,  name: 'Suresh Babu',     company: 'GreenEnergy Co',     email: 'suresh@greenenergy.in',phone: '+91 33221 10099', source: 'Organic Search', industry: 'Manufacturing', city: 'Coimbatore',assignedTo: 'Vikram Nair',   status: 'qualified',     score: 74, createdAt: '2025-07-07' },
  { id: 10, name: 'Meena Krishnan',  company: 'FashionHub',         email: 'meena@fashionhub.in',  phone: '+91 22110 09988', source: 'WhatsApp',       industry: 'Retail',        city: 'Kochi',     assignedTo: 'Kavya Iyer',    status: 'proposal_sent', score: 88, createdAt: '2025-07-06' },
];

const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];

export function ContactsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', source: 'Organic Search', industry: 'Technology', city: '', assignedTo: ASSIGNEES[0], status: 'new' as LeadStatus });

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    const matchSource = filterSource === 'all' || l.source === filterSource;
    return matchSearch && matchStatus && matchSource;
  });

  const statusCounts = LEAD_STATUSES.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.status === s).length }), {} as Record<string, number>);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      if (editId) {
        setLeads(prev => prev.map(l => l.id === editId ? { ...l, ...form } : l));
        setEditId(null);
      } else {
        setLeads(prev => [...prev, { ...form, id: Date.now(), score: Math.floor(Math.random() * 60) + 30, createdAt: new Date().toISOString().split('T')[0] }]);
      }
      setForm({ name: '', company: '', email: '', phone: '', source: 'Organic Search', industry: 'Technology', city: '', assignedTo: ASSIGNEES[0], status: 'new' });
      setShowAdd(false);
      setSaving(false);
    }, 500);
  }

  function startEdit(l: Lead) {
    setForm({ name: l.name, company: l.company, email: l.email, phone: l.phone, source: l.source, industry: l.industry, city: l.city, assignedTo: l.assignedTo, status: l.status });
    setEditId(l.id);
    setShowAdd(true);
  }

  function deleteLead(id: number) {
    setLeads(prev => prev.filter(l => l.id !== id));
  }

  function updateStatus(id: number, status: LeadStatus) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts / Leads"
        description="Manage your leads pipeline — the heart of marketing"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Contacts / Leads' }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline"><Upload className="size-3.5" /> Import CSV</Button>
            <Button size="sm" variant="outline"><Download className="size-3.5" /> Export</Button>
            <Button size="md" onClick={() => { setShowAdd(p => !p); setEditId(null); setForm({ name: '', company: '', email: '', phone: '', source: 'Organic Search', industry: 'Technology', city: '', assignedTo: ASSIGNEES[0], status: 'new' }); }}>
              <Plus className="size-4" /> Add Lead
            </Button>
          </div>
        }
      />

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterStatus('all')}
          className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
            filterStatus === 'all' ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:bg-muted'
          )}>All <span className="ml-1 font-bold">{leads.length}</span></button>
        {LEAD_STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
              filterStatus === s ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border hover:bg-muted'
            )}>{STATUS_CONFIG[s].label} <span className="ml-1 font-bold">{statusCounts[s]}</span></button>
        ))}
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <User className="size-4 text-blue-500" /> {editId ? 'Edit Lead' : 'Add New Lead'}
                </p>
                <button onClick={() => setShowAdd(false)}><X className="size-4 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Full Name *', key: 'name', placeholder: 'e.g. Rahul Sharma', required: true },
                  { label: 'Company',     key: 'company', placeholder: 'e.g. TechCorp India' },
                  { label: 'Email',       key: 'email', placeholder: 'rahul@company.com' },
                  { label: 'Phone',       key: 'phone', placeholder: '+91 98765 43210' },
                  { label: 'City',        key: 'city', placeholder: 'e.g. Mumbai' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-foreground mb-1 block">{f.label}</label>
                    <input required={f.required} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </div>
                ))}
                {[
                  { label: 'Source', key: 'source', options: SOURCES },
                  { label: 'Industry', key: 'industry', options: INDUSTRIES },
                  { label: 'Assigned To', key: 'assignedTo', options: ASSIGNEES },
                  { label: 'Status', key: 'status', options: LEAD_STATUSES.map(s => ({ value: s, label: STATUS_CONFIG[s].label })) },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-foreground mb-1 block">{f.label}</label>
                    <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
                      {f.options.map((o: any) => (
                        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
                          {typeof o === 'string' ? o : o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="sm:col-span-2 lg:col-span-3 flex gap-2 pt-1">
                  <Button size="sm" type="submit" disabled={saving}>
                    {saving && <Loader2 className="size-3.5 animate-spin" />} {editId ? 'Save Changes' : 'Add Lead'}
                  </Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, company, email..."
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
        </div>
        <button onClick={() => setShowFilters(p => !p)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Filter className="size-3.5" /> Filters {showFilters ? <ChevronDown className="size-3" /> : <ChevronDown className="size-3" />}
        </button>
        {showFilters && (
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none">
            <option value="all">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} leads</span>
      </div>

      {/* Leads table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Lead', 'Company', 'Contact', 'Source', 'Industry', 'City', 'Assigned To', 'Score', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((l, i) => (
                <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={l.name} size="xs" />
                      <span className="font-semibold text-foreground whitespace-nowrap">{l.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                      <Building2 className="size-3 shrink-0" />{l.company}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-muted-foreground"><Mail className="size-3" />{l.email}</div>
                      <div className="flex items-center gap-1 text-muted-foreground"><Phone className="size-3" />{l.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap"><Tag className="size-3" />{l.source}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.industry}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap"><MapPin className="size-3" />{l.city}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Avatar name={l.assignedTo} size="xs" />
                      <span className="text-muted-foreground">{l.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn('h-full rounded-full', l.score >= 80 ? 'bg-emerald-500' : l.score >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                          style={{ width: `${l.score}%` }} />
                      </div>
                      <span className={cn('font-bold tabular-nums', l.score >= 80 ? 'text-emerald-600' : l.score >= 50 ? 'text-amber-600' : 'text-red-500')}>{l.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select value={l.status} onChange={e => updateStatus(l.id, e.target.value as LeadStatus)}
                      className={cn('h-6 rounded-md px-2 text-[10px] font-semibold border-0 focus:outline-none cursor-pointer', STATUS_CONFIG[l.status].color)}>
                      {LEAD_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(l)} className="flex size-6 items-center justify-center rounded hover:bg-muted transition-colors">
                        <Edit2 className="size-3 text-muted-foreground" />
                      </button>
                      <button className="flex size-6 items-center justify-center rounded hover:bg-muted transition-colors" title="Assign Sales">
                        <UserCheck className="size-3 text-blue-500" />
                      </button>
                      <button className="flex size-6 items-center justify-center rounded hover:bg-muted transition-colors" title="Merge Duplicate">
                        <GitMerge className="size-3 text-violet-500" />
                      </button>
                      <button onClick={() => deleteLead(l.id)} className="flex size-6 items-center justify-center rounded hover:bg-red-50 transition-colors">
                        <Trash2 className="size-3 text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-foreground">No leads found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
