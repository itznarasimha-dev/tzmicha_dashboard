import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Plus, Video, Clock, Users, Link, FileText, Image, Archive, Search, BookOpen, HelpCircle, ChevronRight, MessageCircle, Mail, Code, TestTube, Megaphone, TrendingUp, ShieldCheck, Layers, Bell, Settings, Calendar, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { mockUsers } from "@/data/users";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

const mockMeetings = [
  { id: "m1", title: "Sprint Planning — Sprint 13", date: "Feb 27, 2024", time: "9:00 AM", duration: "1h", status: "upcoming", attendees: ["u1", "u2", "u3", "u7"], link: "https://meet.google.com" },
  { id: "m2", title: "Design System Review", date: "Feb 27, 2024", time: "2:00 PM", duration: "30m", status: "upcoming", attendees: ["u2", "u7"], link: "https://zoom.us" },
  { id: "m3", title: "Weekly All-Hands", date: "Feb 26, 2024", time: "10:00 AM", duration: "45m", status: "completed", attendees: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"], link: "" },
  { id: "m4", title: "Q1 Marketing Review", date: "Feb 25, 2024", time: "3:00 PM", duration: "1h", status: "completed", attendees: ["u1", "u5"], link: "" },
];

export function MeetingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" description={`${mockMeetings.filter(m => m.status === "upcoming").length} upcoming`}
        breadcrumbs={[{ label: "Workspace" }, { label: "Meetings" }]}
        actions={<Button size="md"><Plus className="size-4" strokeWidth={2.5} /> Schedule</Button>} />

      <div className="space-y-3">
        {["upcoming", "completed"].map((status) => (
          <div key={status}>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground mb-3 capitalize">{status}</p>
            <div className="space-y-2">
              {mockMeetings.filter(m => m.status === status).map((m) => (
                <Card key={m.id} padding="md" className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/30 shrink-0">
                    <Video className="size-4 text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-foreground">{m.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{m.date} · {m.time}</span>
                      <span className="text-xs text-muted-foreground">{m.duration}</span>
                      <div className="flex -space-x-1">
                        {m.attendees.slice(0, 4).map((id) => { const u = mockUsers.find(u => u.id === id); return u ? <Avatar key={id} name={u.name} size="xs" className="ring-1 ring-card" /> : null; })}
                        {m.attendees.length > 4 && <div className="flex size-5 items-center justify-center rounded-full bg-muted text-2xs font-bold ring-1 ring-card">+{m.attendees.length - 4}</div>}
                      </div>
                    </div>
                  </div>
                  {m.status === "upcoming" && m.link && (
                    <Button size="sm" className="shrink-0"><Link className="size-3.5" /> Join</Button>
                  )}
                  {m.status === "completed" && <Badge variant="muted">Completed</Badge>}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const mockFiles = [
  { id: "f1", name: "Design System v2.pdf", type: "pdf", size: "4.2 MB", updatedAt: "Feb 26, 2024", owner: "u2" },
  { id: "f2", name: "Q1 Marketing Report.xlsx", type: "sheet", size: "1.8 MB", updatedAt: "Feb 25, 2024", owner: "u5" },
  { id: "f3", name: "Brand Assets.zip", type: "archive", size: "24.5 MB", updatedAt: "Feb 20, 2024", owner: "u5" },
  { id: "f4", name: "Sprint 12 Screenshots.png", type: "image", size: "3.1 MB", updatedAt: "Feb 22, 2024", owner: "u4" },
  { id: "f5", name: "API Documentation.md", type: "doc", size: "0.5 MB", updatedAt: "Feb 24, 2024", owner: "u3" },
  { id: "f6", name: "Employee Handbook.pdf", type: "pdf", size: "2.3 MB", updatedAt: "Feb 15, 2024", owner: "u6" },
];

const fileIcon: Record<string, React.ReactNode> = {
  pdf: <FileText className="size-4 text-red-500" />,
  sheet: <FileText className="size-4 text-emerald-500" />,
  archive: <Archive className="size-4 text-amber-500" />,
  image: <Image className="size-4 text-blue-500" />,
  doc: <FileText className="size-4 text-slate-500" />,
};

export function FilesPage() {
  const [search, setSearch] = useState("");
  const filtered = mockFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Files" description={`${mockFiles.length} files`}
        breadcrumbs={[{ label: "Workspace" }, { label: "Files" }]}
        actions={<Button size="md"><Plus className="size-4" strokeWidth={2.5} /> Upload</Button>} />

      <Input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="size-3.5" />} className="max-w-sm" />

      <Card padding="none">
        <div className="divide-y divide-border">
          {filtered.map((file) => {
            const owner = mockUsers.find(u => u.id === file.owner);
            return (
              <div key={file.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted shrink-0">{fileIcon[file.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size} · {file.updatedAt}</p>
                </div>
                {owner && <Avatar name={owner.name} size="xs" />}
                <Button variant="ghost" size="xs" className="opacity-0 group-hover:opacity-100">Download</Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

interface Article {
  id: string;
  title: string;
  category: string;
  roles: string[];
  icon: React.ReactNode;
  content: { heading: string; body: string }[];
}

const articles: Article[] = [
  {
    id: "a1", title: "Getting Started — All Roles", category: "Onboarding", roles: ["All"],
    icon: <BookOpen className="size-4 text-rose-600" />,
    content: [
      { heading: "Logging In", body: "Go to the login page and enter your company email and password. Use 'Change password?' if you need to reset it. After login you land on your role-specific dashboard." },
      { heading: "Navigating the Sidebar", body: "The left sidebar shows only the sections relevant to your role. Click any item to navigate. Collapse the sidebar with the arrow at the bottom for more screen space. On mobile, tap the hamburger menu." },
      { heading: "Updating Your Profile", body: "Go to Settings → Profile. Update your name, email, job title, and department then click Save Changes. Your name and email update everywhere in the app immediately." },
      { heading: "Changing Your Password", body: "On the login page click 'Change password?'. Enter your email and new password twice. On the Settings page go to Security → Change Password for in-app changes." },
      { heading: "Switching Theme", body: "Click the sun/moon icon in the top-right header, or go to Settings → Appearance. Choose Light, Dark, or System (follows your OS setting)." },
      { heading: "Notifications", body: "The bell icon in the sidebar shows your unread count. Click Notifications to see all. Notifications arrive automatically when tasks are assigned to you, leave is approved/rejected, or work updates are submitted. Mark individual ones read with the checkmark, or use 'Mark all read'." },
      { heading: "Search / Command Palette", body: "Press ⌘K (Mac) or Ctrl+K (Windows) or click the search bar in the header to open the command palette. Type any page name to jump to it instantly." },
    ],
  },
  {
    id: "a2", title: "Admin Guide", category: "Admin", roles: ["Administrator"],
    icon: <ShieldCheck className="size-4 text-red-600" />,
    content: [
      { heading: "Dashboard Overview", body: "The Admin dashboard shows company-wide KPIs: active projects, open tasks, team velocity, and sprint progress. All stats are live from the database." },
      { heading: "Managing Employees", body: "Go to People → Employees. Click 'Add Employee' to create a new user — fill in name, email, role, department, title, and a temporary password. The employee can change their password on first login. Click any employee row to view their profile." },
      { heading: "Approving Leave", body: "Go to People → Leave or check the HR Dashboard. Pending requests show approve (✓) and reject (✗) buttons. Approving automatically deducts from the employee's leave balance. The employee receives a notification instantly." },
      { heading: "Monitoring Work Updates", body: "Go to Work → Work Updates. All team members' daily logs appear here. Filter by date or user. You receive a notification every time a team member submits an update." },
      { heading: "Sprint & Task Management", body: "Go to Work → Sprint Board for the Kanban view. Drag tasks between columns to update status. Go to Work → Tasks for a list view with filters by status, priority, and assignee. Click 'Add Task' to create new tasks and assign them — the assignee gets notified." },
      { heading: "Projects", body: "Go to Work → Projects. Create projects with name, description, dates, and color. Click 'View Board' on any project to jump to its sprint board." },
      { heading: "Analytics", body: "Go to Analytics for charts on task completion, sprint velocity, and team performance. Go to Activity for a real-time feed of all actions across the platform." },
      { heading: "Settings", body: "Go to Settings to manage your profile, appearance, notification preferences, and security. Changes save immediately to the database." },
    ],
  },
  {
    id: "a3", title: "Developer Guide (Frontend & Backend)", category: "Engineering", roles: ["Frontend Dev", "Backend Dev"],
    icon: <Code className="size-4 text-blue-600" />,
    content: [
      { heading: "Your Dashboard", body: "Shows your assigned tasks, sprint progress, recent commits, and PR activity. KPIs show your personal task counts by status." },
      { heading: "Sprint Board", body: "Go to Work → Sprint Board. Your tasks appear in the Kanban columns: Backlog, To Do, In Progress, In Review, Done, Blocked. Drag a card to a new column to update its status — it saves to the database immediately. Drop onto empty columns works too." },
      { heading: "Tasks", body: "Go to Work → Tasks for a filterable list. Use the status and priority filters to find your work. Tasks assigned to you show your avatar. Click 'Add Task' to create one and assign it to yourself or a teammate — they get notified." },
      { heading: "Logging Work Updates", body: "Go to Work → Work Updates and click 'Log Update'. Add each task you worked on with a ticket reference (e.g. FE-142), status, and hours. Add blockers and your plan for tomorrow. Submit — your admin and product manager are notified automatically." },
      { heading: "Projects & Roadmap", body: "Go to Work → Projects to see all active projects. Go to Work → Roadmap to see the quarterly feature plan. You can see items planned for your team." },
      { heading: "Leave Requests", body: "Go to People → Leave. Click 'Request Leave', choose type (annual/sick/casual), dates, and reason. HR is notified. You'll get a notification when it's approved or rejected." },
    ],
  },
  {
    id: "a4", title: "QA Engineer Guide", category: "Engineering", roles: ["QA"],
    icon: <TestTube className="size-4 text-amber-600" />,
    content: [
      { heading: "Your Dashboard", body: "Shows open bugs, test coverage stats, and tasks assigned to you. Monitor the 'Blocked' column on the sprint board for issues needing QA sign-off." },
      { heading: "Sprint Board & Tasks", body: "Use Work → Sprint Board to track tasks in 'In Review' status — these are ready for QA. Drag to 'Done' once verified or 'Blocked' if issues found. Add tasks for test cases via 'Add Task'." },
      { heading: "Logging Work Updates", body: "Submit daily updates via Work → Work Updates → Log Update. List test cases run, bugs filed, and hours. Your admin and product manager receive a notification." },
      { heading: "Leave", body: "Request leave via People → Leave. HR is notified and you receive a notification on approval/rejection." },
    ],
  },
  {
    id: "a5", title: "HR Manager Guide", category: "HR", roles: ["HR"],
    icon: <Users className="size-4 text-emerald-600" />,
    content: [
      { heading: "HR Dashboard", body: "Shows live stats: total employees (from DB), on leave today (approved leaves overlapping today's date), pending requests count, and department headcount chart — all from real data." },
      { heading: "Leave Management", body: "Go to People → Leave. All requests appear with status badges. Click ✓ to approve or ✗ to reject directly from the list. Approving auto-deducts from the employee's leave balance. The employee is notified instantly via the notification system." },
      { heading: "Attendance", body: "Go to People → Attendance. See the current week's Mon–Fri grid for all employees. Status shows present/absent/late/on-leave per day." },
      { heading: "Employee Directory", body: "Go to People → Employees. See all employees with role, department, location, and start date. Click 'Add Employee' to onboard a new hire — set their role, department, and temporary password." },
      { heading: "Org Chart", body: "Go to People → Org Chart for a visual hierarchy of the company structure by department and role." },
      { heading: "Notifications", body: "You receive a notification every time any employee submits a leave request. Check the Notifications page or the sidebar badge." },
    ],
  },
  {
    id: "a6", title: "Product Manager Guide", category: "Product", roles: ["Product Manager"],
    icon: <Layers className="size-4 text-cyan-600" />,
    content: [
      { heading: "Dashboard", body: "Shows project health, sprint velocity, task breakdown by status, and team activity. All live from the database." },
      { heading: "Roadmap", body: "Go to Work → Roadmap. See all planned features by quarter. Click 'New Item' to add a roadmap entry with title, quarter, year, team, priority, and status. Track progress percentages." },
      { heading: "Sprint Board", body: "Go to Work → Sprint Board. Full Kanban view of all tasks. Drag to reorder and update status. Create tasks and assign to developers — they get notified." },
      { heading: "Projects", body: "Go to Work → Projects. Create and manage projects. Set color, dates, and description. Click 'View Board' to jump to the sprint board filtered for that project." },
      { heading: "Work Updates", body: "Go to Work → Work Updates. See all developer and QA daily logs. You receive a notification every time a dev or QA submits an update — review their blockers and plans." },
      { heading: "Leave", body: "Request your own leave via People → Leave. HR is notified and you receive approval/rejection notifications." },
    ],
  },
  {
    id: "a7", title: "Marketing Guide", category: "Marketing", roles: ["Marketing"],
    icon: <Megaphone className="size-4 text-pink-600" />,
    content: [
      { heading: "Marketing Dashboard", body: "Shows campaign KPIs: total budget, total spent, impressions, clicks, conversions, and average ROI across all active campaigns." },
      { heading: "Campaigns", body: "Go to Growth → Campaigns. See all campaigns with status (draft/active/paused/completed), channel, budget vs spent, and ROI. Click 'New Campaign' to create one — set name, channel (email/social/paid/content/SEO), budget, and dates." },
      { heading: "Campaign Stats", body: "The stats bar at the top of Campaigns shows aggregate impressions, clicks, conversions, and ROI. Individual campaign cards show per-campaign metrics." },
      { heading: "Work Updates", body: "Log your daily work via Work → Work Updates → Log Update. Your admin receives a notification." },
      { heading: "Calendar", body: "Use Workspace → Calendar to schedule campaign launch dates and review meetings. Create events with type, time, and description." },
    ],
  },
  {
    id: "a8", title: "Sales Guide", category: "Sales", roles: ["Sales"],
    icon: <TrendingUp className="size-4 text-orange-600" />,
    content: [
      { heading: "Sales Dashboard", body: "Shows pipeline KPIs: total pipeline value, deals won this month, win rate, and average deal size. All calculated from live deal data." },
      { heading: "Sales Pipeline", body: "Go to Growth → Sales Pipeline. See all deals in a list with stage (Lead → Qualified → Proposal → Negotiation → Closed Won/Lost), value, company, probability, and close date. Click 'New Deal' to add a deal." },
      { heading: "Managing Deals", body: "Create deals with title, company, value, stage, probability (%), and close date. Update stage as deals progress. Won deals show in green, lost in red." },
      { heading: "Work Updates", body: "Log daily activity via Work → Work Updates → Log Update. Your admin receives a notification." },
      { heading: "Calendar", body: "Schedule client calls and follow-ups via Workspace → Calendar. Events are local to your session." },
    ],
  },
  {
    id: "a9", title: "Notifications Guide", category: "System", roles: ["All"],
    icon: <Bell className="size-4 text-violet-600" />,
    content: [
      { heading: "How Notifications Work", body: "Notifications are created automatically by the system when key events happen. They appear in the sidebar badge and on the Notifications page." },
      { heading: "What Triggers a Notification", body: "Task assigned to you → you get notified. Task reassigned to someone else → new assignee notified. Leave request submitted → all HR users notified. Leave approved/rejected → the employee notified. Work update submitted by dev/QA → admin + product manager notified. Work update by other roles → admin notified." },
      { heading: "Reading Notifications", body: "Go to Notifications in the sidebar. Unread items show a blue 'New' badge. Click the checkmark on any notification to mark it read. Use 'Mark all read' to clear all at once." },
      { heading: "Sidebar Badge", body: "The Notifications item in the sidebar shows a live count of unread notifications. It refreshes every 30 seconds automatically. It disappears when count is zero." },
    ],
  },
  {
    id: "a10", title: "Settings & Security", category: "System", roles: ["All"],
    icon: <Settings className="size-4 text-slate-600" />,
    content: [
      { heading: "Profile Settings", body: "Go to Settings → Profile. Update name, email, job title, and department. Click Save Changes — updates are saved to the database and reflected everywhere in the app immediately including the sidebar and header." },
      { heading: "Appearance", body: "Go to Settings → Appearance. Choose Light, Dark, or System theme. The preference is saved locally and persists across sessions." },
      { heading: "Notification Preferences", body: "Go to Settings → Notifications. Toggle which notification types you want to receive (PR reviews, bug assignments, sprint updates, leave approvals, mentions)." },
      { heading: "Security", body: "Go to Settings → Security to enable 2FA, change your password, or manage active sessions. To change password without logging in, use the 'Change password?' link on the login page — enter your email and new password." },
    ],
  },
];

const CATEGORIES = ["All", "Onboarding", "Admin", "Engineering", "HR", "Product", "Marketing", "Sales", "System"];

function ArticleCard({ article }: { article: Article }) {
  const [expanded, setExpanded] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(null);

  return (
    <Card padding="lg" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2 cursor-pointer" onClick={() => setExpanded(p => !p)}>
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-muted shrink-0">
            {article.icon}
          </div>
          <div>
            <p className="text-[13px] font-bold text-foreground">{article.title}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="secondary">{article.category}</Badge>
              {article.roles.map(r => <Badge key={r} variant="muted" size="sm">{r}</Badge>)}
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1">
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-1 border-t border-border pt-3">
          {article.content.map((section, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
                onClick={() => setOpenSection(openSection === i ? null : i)}
              >
                <span className="text-[13px] font-semibold text-foreground">{section.heading}</span>
                {openSection === i ? <ChevronUp className="size-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />}
              </button>
              {openSection === i && (
                <div className="px-4 pb-3 pt-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">{section.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.some(s => s.heading.toLowerCase().includes(search.toLowerCase()) || s.body.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Base" description="Guides for every role and operation"
        breadcrumbs={[{ label: "Workspace" }, { label: "Knowledge Base" }]} />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search guides..." value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="size-3.5" />} className="max-w-sm" />
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-rose-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map(a => <ArticleCard key={a.id} article={a} />)}
        {filtered.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 gap-2">
            <BookOpen className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No articles found</p>
          </div>
        )}
      </div>
    </div>
  );
}

const faqs = [
  { q: "How do I reset my password?", a: "Go to Settings → Security → Change Password. Enter your current password and set a new one." },
  { q: "How do I switch between roles?", a: "Click your profile avatar in the top-right header, then use the 'Switch Role' section in the dropdown." },
  { q: "How do I submit a work update?", a: "Navigate to Work → Work Updates and click 'Log Update'. Fill in your tasks, hours, and any blockers." },
  { q: "How do I request leave?", a: "Go to People → Leave and submit a new leave request with your dates and reason." },
  { q: "Who can approve leave requests?", a: "HR Managers and Administrators can approve or reject leave requests." },
];

export function HelpCenterPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Help Center" description="Find answers and get support"
        breadcrumbs={[{ label: "System" }, { label: "Help Center" }]} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <BookOpen className="size-5 text-rose-600" />, title: "Documentation", desc: "Browse all guides and articles", bg: "bg-rose-50 dark:bg-rose-950/20" },
          { icon: <MessageCircle className="size-5 text-emerald-600" />, title: "Live Chat", desc: "Chat with our support team", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
          { icon: <Mail className="size-5 text-blue-600" />, title: "Email Support", desc: "support@tzmicha.com", bg: "bg-blue-50 dark:bg-blue-950/20" },
        ].map((s) => (
          <Card key={s.title} hover padding="lg" className="flex items-start gap-3 cursor-pointer">
            <div className={`flex size-10 items-center justify-center rounded-xl shrink-0 ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-[13px] font-bold text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="lg">
        <CardHeader><div><CardTitle>Frequently Asked Questions</CardTitle></div></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl border border-border hover:border-border-strong transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-foreground">{faq.q}</p>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
