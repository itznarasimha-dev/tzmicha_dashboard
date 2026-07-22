-- TZMicha Dashboard — Full Schema
-- Run this entire script in Supabase SQL Editor

-- ── Enums ──────────────────────────────────────────────────────────────────

CREATE TYPE "UserRole" AS ENUM ('admin','frontend_dev','backend_dev','qa','marketing','hr','product_manager','sales');
CREATE TYPE "UserStatus" AS ENUM ('active','inactive','on_leave');
CREATE TYPE "TaskStatus" AS ENUM ('backlog','todo','in_progress','in_review','done','blocked');
CREATE TYPE "TaskPriority" AS ENUM ('critical','high','medium','low');
CREATE TYPE "ProjectStatus" AS ENUM ('active','on_hold','completed','archived');
CREATE TYPE "SprintStatus" AS ENUM ('planning','active','completed');
CREATE TYPE "LeaveType" AS ENUM ('annual','sick','casual','unpaid');
CREATE TYPE "LeaveStatus" AS ENUM ('pending','approved','rejected');
CREATE TYPE "AttendanceStatus" AS ENUM ('present','absent','late','half_day','holiday');
CREATE TYPE "CampaignStatus" AS ENUM ('draft','active','paused','completed');
CREATE TYPE "CampaignChannel" AS ENUM ('email','social','paid','content','seo');
CREATE TYPE "DealStage" AS ENUM ('lead','qualified','proposal','negotiation','closed_won','closed_lost');
CREATE TYPE "RoadmapStatus" AS ENUM ('planned','in_progress','completed','cancelled');
CREATE TYPE "NotificationType" AS ENUM ('info','success','warning','error');
CREATE TYPE "ActivityType" AS ENUM ('commit','deploy','bug','task','leave','review','campaign','general');
CREATE TYPE "WorkUpdateTaskStatus" AS ENUM ('not_started','in_progress','completed','blocked');

-- ── Tables ─────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        "UserRole" NOT NULL DEFAULT 'frontend_dev',
  department  TEXT NOT NULL,
  title       TEXT NOT NULL,
  avatar      TEXT,
  status      "UserStatus" NOT NULL DEFAULT 'active',
  phone       TEXT,
  location    TEXT,
  bio         TEXT,
  skills      TEXT[] DEFAULT '{}',
  "startDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "managerId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE refresh_tokens (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  token       TEXT UNIQUE NOT NULL,
  "userId"    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_userId ON refresh_tokens("userId");

CREATE TABLE projects (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  status      "ProjectStatus" NOT NULL DEFAULT 'active',
  progress    INT NOT NULL DEFAULT 0,
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate"   TIMESTAMPTZ,
  color       TEXT NOT NULL DEFAULT '#f43f5e',
  "ownerId"   TEXT NOT NULL REFERENCES users(id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_projects_ownerId ON projects("ownerId");
CREATE INDEX idx_projects_status ON projects(status);

CREATE TABLE sprints (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  "projectId" TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate"   TIMESTAMPTZ NOT NULL,
  status      "SprintStatus" NOT NULL DEFAULT 'planning',
  goal        TEXT,
  velocity    INT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sprints_projectId ON sprints("projectId");
CREATE INDEX idx_sprints_status ON sprints(status);

CREATE TABLE tasks (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title            TEXT NOT NULL,
  description      TEXT,
  status           "TaskStatus" NOT NULL DEFAULT 'backlog',
  priority         "TaskPriority" NOT NULL DEFAULT 'medium',
  "assigneeId"     TEXT REFERENCES users(id),
  "reporterId"     TEXT NOT NULL REFERENCES users(id),
  "projectId"      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "sprintId"       TEXT REFERENCES sprints(id),
  labels           TEXT[] DEFAULT '{}',
  "dueDate"        TIMESTAMPTZ,
  "estimatedHours" FLOAT,
  "loggedHours"    FLOAT,
  "linkedPR"       TEXT,
  "order"          INT NOT NULL DEFAULT 0,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tasks_projectId ON tasks("projectId");
CREATE INDEX idx_tasks_sprintId ON tasks("sprintId");
CREATE INDEX idx_tasks_assigneeId ON tasks("assigneeId");
CREATE INDEX idx_tasks_status ON tasks(status);

CREATE TABLE work_updates (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blockers          TEXT,
  "planForTomorrow" TEXT,
  "totalHours"      FLOAT NOT NULL DEFAULT 0,
  "submittedAt"     TIMESTAMPTZ,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_work_updates_userId ON work_updates("userId");
CREATE INDEX idx_work_updates_date ON work_updates(date);

CREATE TABLE work_update_tasks (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "workUpdateId" TEXT NOT NULL REFERENCES work_updates(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  "ticketRef"    TEXT,
  status         "WorkUpdateTaskStatus" NOT NULL DEFAULT 'not_started',
  hours          FLOAT NOT NULL DEFAULT 0,
  notes          TEXT
);
CREATE INDEX idx_work_update_tasks_workUpdateId ON work_update_tasks("workUpdateId");

CREATE TABLE leave_balances (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "annualTotal" INT NOT NULL DEFAULT 20,
  "annualUsed"  INT NOT NULL DEFAULT 0,
  "sickTotal"   INT NOT NULL DEFAULT 10,
  "sickUsed"    INT NOT NULL DEFAULT 0,
  "casualTotal" INT NOT NULL DEFAULT 5,
  "casualUsed"  INT NOT NULL DEFAULT 0
);

CREATE TABLE leave_requests (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         "LeaveType" NOT NULL,
  "startDate"  TIMESTAMPTZ NOT NULL,
  "endDate"    TIMESTAMPTZ NOT NULL,
  days         INT NOT NULL,
  reason       TEXT NOT NULL,
  status       "LeaveStatus" NOT NULL DEFAULT 'pending',
  "approverId" TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leave_requests_userId ON leave_requests("userId");
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

CREATE TABLE attendance (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        TIMESTAMPTZ NOT NULL,
  status      "AttendanceStatus" NOT NULL DEFAULT 'present',
  "checkIn"   TIMESTAMPTZ,
  "checkOut"  TIMESTAMPTZ,
  notes       TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId", date)
);
CREATE INDEX idx_attendance_userId ON attendance("userId");
CREATE INDEX idx_attendance_date ON attendance(date);

CREATE TABLE campaigns (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  status      "CampaignStatus" NOT NULL DEFAULT 'draft',
  channel     "CampaignChannel" NOT NULL,
  budget      FLOAT NOT NULL,
  spent       FLOAT NOT NULL DEFAULT 0,
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate"   TIMESTAMPTZ,
  impressions INT NOT NULL DEFAULT 0,
  clicks      INT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  roi         FLOAT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_channel ON campaigns(channel);

CREATE TABLE deals (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  value       FLOAT NOT NULL,
  stage       "DealStage" NOT NULL DEFAULT 'lead',
  probability INT NOT NULL DEFAULT 0,
  "ownerId"   TEXT,
  "closeDate" TIMESTAMPTZ,
  notes       TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_ownerId ON deals("ownerId");

CREATE TABLE roadmap_items (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  description TEXT,
  status      "RoadmapStatus" NOT NULL DEFAULT 'planned',
  quarter     TEXT NOT NULL,
  year        INT NOT NULL,
  progress    INT NOT NULL DEFAULT 0,
  team        TEXT,
  priority    "TaskPriority" NOT NULL DEFAULT 'medium',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_roadmap_status ON roadmap_items(status);
CREATE INDEX idx_roadmap_quarter_year ON roadmap_items(quarter, year);

CREATE TABLE notifications (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        "NotificationType" NOT NULL DEFAULT 'info',
  read        BOOLEAN NOT NULL DEFAULT false,
  link        TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_userId ON notifications("userId");
CREATE INDEX idx_notifications_read ON notifications(read);

CREATE TABLE activities (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  target      TEXT NOT NULL,
  type        "ActivityType" NOT NULL DEFAULT 'general',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activities_userId ON activities("userId");
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_createdAt ON activities("createdAt");

CREATE TABLE settings (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key         TEXT UNIQUE NOT NULL,
  value       TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── updatedAt trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at           BEFORE UPDATE ON users           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at        BEFORE UPDATE ON projects        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sprints_updated_at         BEFORE UPDATE ON sprints         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated_at           BEFORE UPDATE ON tasks           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_work_updates_updated_at    BEFORE UPDATE ON work_updates    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leave_requests_updated_at  BEFORE UPDATE ON leave_requests  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_campaigns_updated_at       BEFORE UPDATE ON campaigns       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_deals_updated_at           BEFORE UPDATE ON deals           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_roadmap_items_updated_at   BEFORE UPDATE ON roadmap_items   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_settings_updated_at        BEFORE UPDATE ON settings        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
