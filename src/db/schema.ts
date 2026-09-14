import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const projectStatuses = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
] as const;

export const workItemTypes = ["TASK", "ACTION_ITEM"] as const;

export const workItemStatuses = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "BLOCKED",
] as const;

export const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const riskLevels = ["LOW", "MEDIUM", "HIGH"] as const;

export const riskSeverities = ["LOW", "MEDIUM", "HIGH"] as const;

export const riskStatuses = [
  "OPEN",
  "MONITORING",
  "MITIGATED",
  "CLOSED",
] as const;

export const issueStatuses = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export const reportStatuses = ["GREEN", "YELLOW", "RED"] as const;

export const reportTrends = ["IMPROVING", "STABLE", "DECLINING"] as const;

export type ProjectStatus = (typeof projectStatuses)[number];
export type WorkItemType = (typeof workItemTypes)[number];
export type WorkItemStatus = (typeof workItemStatuses)[number];
export type Priority = (typeof priorities)[number];
export type RiskLevel = (typeof riskLevels)[number];
export type RiskSeverity = (typeof riskSeverities)[number];
export type RiskStatus = (typeof riskStatuses)[number];
export type IssueStatus = (typeof issueStatuses)[number];
export type ReportStatus = (typeof reportStatuses)[number];
export type ReportTrend = (typeof reportTrends)[number];

const id = integer("id").primaryKey({ autoIncrement: true });
const createdAt = integer("created_at", { mode: "timestamp_ms" })
  .notNull()
  .default(sql`(unixepoch() * 1000)`);
const updatedAt = integer("updated_at", { mode: "timestamp_ms" })
  .notNull()
  .default(sql`(unixepoch() * 1000)`)
  .$onUpdate(() => new Date());

const enumCheck = (columnName: string, values: readonly string[]) =>
  sql.raw(`${columnName} in (${values.map((value) => `'${value}'`).join(", ")})`);

export const projects = sqliteTable(
  "projects",
  {
    id,
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").$type<ProjectStatus>().notNull().default("PLANNING"),
    startDate: text("start_date"),
    endDate: text("end_date"),
    owner: text("owner"),
    customer: text("customer"),
    objective: text("objective"),
    healthNote: text("health_note"),
    createdAt,
    updatedAt,
  },
  (table) => [
    check("projects_status_check", enumCheck(table.status.name, projectStatuses)),
    index("projects_status_idx").on(table.status),
  ],
);

export const meetings = sqliteTable(
  "meetings",
  {
    id,
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    meetingDate: integer("meeting_date", { mode: "timestamp_ms" }).notNull(),
    participants: text("participants"),
    agenda: text("agenda"),
    notes: text("notes"),
    summary: text("summary"),
    decisions: text("decisions"),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("meetings_project_id_idx").on(table.projectId),
    index("meetings_meeting_date_idx").on(table.meetingDate),
  ],
);

export const workItems = sqliteTable(
  "work_items",
  {
    id,
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    meetingId: integer("meeting_id").references(() => meetings.id, {
      onDelete: "set null",
    }),
    type: text("type").$type<WorkItemType>().notNull().default("TASK"),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<WorkItemStatus>().notNull().default("TODO"),
    priority: text("priority").$type<Priority>().notNull().default("MEDIUM"),
    owner: text("owner"),
    dueDate: text("due_date"),
    source: text("source"),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    check("work_items_type_check", enumCheck(table.type.name, workItemTypes)),
    check(
      "work_items_status_check",
      enumCheck(table.status.name, workItemStatuses),
    ),
    check("work_items_priority_check", enumCheck(table.priority.name, priorities)),
    index("work_items_project_id_idx").on(table.projectId),
    index("work_items_meeting_id_idx").on(table.meetingId),
    index("work_items_status_idx").on(table.status),
    index("work_items_due_date_idx").on(table.dueDate),
  ],
);

export const risks = sqliteTable(
  "risks",
  {
    id,
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    probability: text("probability").$type<RiskLevel>().notNull(),
    impact: text("impact").$type<RiskLevel>().notNull(),
    severity: text("severity").$type<RiskSeverity>().notNull(),
    mitigation: text("mitigation"),
    owner: text("owner"),
    status: text("status").$type<RiskStatus>().notNull().default("OPEN"),
    dueDate: text("due_date"),
    createdAt,
    updatedAt,
  },
  (table) => [
    check("risks_probability_check", enumCheck(table.probability.name, riskLevels)),
    check("risks_impact_check", enumCheck(table.impact.name, riskLevels)),
    check("risks_severity_check", enumCheck(table.severity.name, riskSeverities)),
    check("risks_status_check", enumCheck(table.status.name, riskStatuses)),
    index("risks_project_id_idx").on(table.projectId),
    index("risks_status_idx").on(table.status),
    index("risks_severity_idx").on(table.severity),
    index("risks_due_date_idx").on(table.dueDate),
  ],
);

export const issues = sqliteTable(
  "issues",
  {
    id,
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    priority: text("priority").$type<Priority>().notNull().default("MEDIUM"),
    impact: text("impact"),
    owner: text("owner"),
    status: text("status").$type<IssueStatus>().notNull().default("OPEN"),
    resolution: text("resolution"),
    dueDate: text("due_date"),
    detectedAt: text("detected_at"),
    resolvedAt: text("resolved_at"),
    createdAt,
    updatedAt,
  },
  (table) => [
    check("issues_priority_check", enumCheck(table.priority.name, priorities)),
    check("issues_status_check", enumCheck(table.status.name, issueStatuses)),
    index("issues_project_id_idx").on(table.projectId),
    index("issues_status_idx").on(table.status),
    index("issues_due_date_idx").on(table.dueDate),
  ],
);

export const weeklyReports = sqliteTable(
  "weekly_reports",
  {
    id,
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    week: text("week"),
    projectName: text("project_name"),
    weekStart: text("week_start").notNull(),
    weekEnd: text("week_end").notNull(),
    overallStatus: text("overall_status")
      .$type<ReportStatus>()
      .notNull()
      .default("GREEN"),
    progressPercent: integer("progress_percent"),
    keyAchievements: text("key_achievements"),
    plannedNotDone: text("planned_not_done"),
    issuesBlockers: text("issues_blockers"),
    decisionsNeeded: text("decisions_needed"),
    nextWeekPlan: text("next_week_plan"),
    owner: text("owner"),
    dueTarget: text("due_target"),
    managementNote: text("management_note"),
    trend: text("trend").$type<ReportTrend>(),
    summary: text("summary"),
    completedWork: text("completed_work"),
    ongoingWork: text("ongoing_work"),
    upcomingWork: text("upcoming_work"),
    risks: text("risks"),
    issues: text("issues"),
    decisions: text("decisions"),
    notes: text("notes"),
    createdAt,
    updatedAt,
  },
  (table) => [
    check(
      "weekly_reports_overall_status_check",
      enumCheck(table.overallStatus.name, reportStatuses),
    ),
    check("weekly_reports_trend_check", enumCheck(table.trend.name, reportTrends)),
    index("weekly_reports_project_id_idx").on(table.projectId),
    index("weekly_reports_week_start_idx").on(table.weekStart),
  ],
);

export const dailyReports = sqliteTable(
  "daily_reports",
  {
    id,
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    reportDate: text("report_date").notNull(),
    projectName: text("project_name"),
    workstream: text("workstream"),
    taskId: text("task_id"),
    task: text("task").notNull(),
    owner: text("owner"),
    planToday: text("plan_today"),
    actualResult: text("actual_result"),
    completePercent: integer("complete_percent"),
    status: text("status").$type<WorkItemStatus>().notNull().default("TODO"),
    priority: text("priority").$type<Priority>().notNull().default("MEDIUM"),
    blockerIssue: text("blocker_issue"),
    risk: text("risk"),
    supportNeeded: text("support_needed"),
    nextAction: text("next_action"),
    dueDate: text("due_date"),
    health: text("health").$type<ReportStatus>().notNull().default("GREEN"),
    createdAt,
    updatedAt,
  },
  (table) => [
    check(
      "daily_reports_status_check",
      enumCheck(table.status.name, workItemStatuses),
    ),
    check(
      "daily_reports_priority_check",
      enumCheck(table.priority.name, priorities),
    ),
    check(
      "daily_reports_health_check",
      enumCheck(table.health.name, reportStatuses),
    ),
    index("daily_reports_project_id_idx").on(table.projectId),
    index("daily_reports_report_date_idx").on(table.reportDate),
    index("daily_reports_status_idx").on(table.status),
  ],
);

export const projectsRelations = relations(projects, ({ many }) => ({
  meetings: many(meetings),
  workItems: many(workItems),
  risks: many(risks),
  issues: many(issues),
  weeklyReports: many(weeklyReports),
  dailyReports: many(dailyReports),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  project: one(projects, {
    fields: [meetings.projectId],
    references: [projects.id],
  }),
  workItems: many(workItems),
}));

export const workItemsRelations = relations(workItems, ({ one }) => ({
  project: one(projects, {
    fields: [workItems.projectId],
    references: [projects.id],
  }),
  meeting: one(meetings, {
    fields: [workItems.meetingId],
    references: [meetings.id],
  }),
}));

export const risksRelations = relations(risks, ({ one }) => ({
  project: one(projects, {
    fields: [risks.projectId],
    references: [projects.id],
  }),
}));

export const issuesRelations = relations(issues, ({ one }) => ({
  project: one(projects, {
    fields: [issues.projectId],
    references: [projects.id],
  }),
}));

export const weeklyReportsRelations = relations(weeklyReports, ({ one }) => ({
  project: one(projects, {
    fields: [weeklyReports.projectId],
    references: [projects.id],
  }),
}));

export const dailyReportsRelations = relations(dailyReports, ({ one }) => ({
  project: one(projects, {
    fields: [dailyReports.projectId],
    references: [projects.id],
  }),
}));
