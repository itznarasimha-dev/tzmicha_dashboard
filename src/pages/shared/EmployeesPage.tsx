import { useState } from "react";
import { Search, Plus, Filter, Mail, Phone, MapPin, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { mockEmployees } from "@/data/users";
import { ROLE_LABELS, ROLE_COLORS } from "@/constants";
import { cn, formatDate } from "@/utils";

export function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = mockEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={`${mockEmployees.length} team members across all departments`}
        breadcrumbs={[{ label: "People" }, { label: "Employees" }]}
        actions={
          <Button size="md">
            <Plus className="size-4" strokeWidth={2.5} /> Add Employee
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="size-3.5" />}
          className="flex-1 min-w-[160px] max-w-sm"
        />
        <Button variant="outline" size="sm">
          <Filter className="size-3.5" /> Filter
        </Button>
        <div className="ml-auto flex items-center gap-px rounded-md border border-border bg-muted/30 p-0.5">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "flex size-7 items-center justify-center rounded transition-all duration-150",
              view === "grid" ? "bg-card shadow-card text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex size-7 items-center justify-center rounded transition-all duration-150",
              view === "list" ? "bg-card shadow-card text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card hover padding="lg" className="flex flex-col items-center text-center gap-3">
                  <Avatar name={emp.name} src={emp.avatar} size="lg" showStatus status={emp.status} />
                  <div className="w-full">
                    <p className="text-[13px] font-semibold text-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{emp.title}</p>
                    <p className="text-xs text-muted-foreground">{emp.department}</p>
                  </div>
                  <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", ROLE_COLORS[emp.role])}>
                    {ROLE_LABELS[emp.role]}
                  </span>
                  <div className="flex items-center gap-2 w-full pt-3 border-t border-border">
                    <Button variant="ghost" size="icon-xs" className="flex-1">
                      <Mail className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="flex-1">
                      <Phone className="size-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <Card padding="none">
              <div className="divide-y divide-border">
                {filtered.map((emp, i) => (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <Avatar name={emp.name} src={emp.avatar} size="md" showStatus status={emp.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.title}</p>
                    </div>
                    <div className="hidden md:block text-xs text-muted-foreground w-28 shrink-0">{emp.department}</div>
                    <span className={cn("hidden sm:inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", ROLE_COLORS[emp.role])}>
                      {ROLE_LABELS[emp.role]}
                    </span>
                    <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground w-28 shrink-0">
                      <MapPin className="size-3" /> {emp.location ?? "Remote"}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      Since {formatDate(emp.startDate, "MMM yyyy")}
                    </div>
                    <Badge
                      variant={emp.status === "active" ? "success" : emp.status === "on-leave" ? "warning" : "muted"}
                      dot
                    >
                      {emp.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
