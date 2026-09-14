import { and, asc, desc, eq, gte, inArray, lte, or } from "drizzle-orm";

import { db } from "@/db";
import { issues, meetings, projects, risks, workItems } from "@/db/schema";

export type WeeklyReportDraft = {
  week: string;
  projectName: string;
  weekStart: string;
  weekEnd: string;
  overallStatus: "GREEN" | "YELLOW" | "RED";
  progressPercent: number;
  keyAchievements: string;
  plannedNotDone: string;
  issuesBlockers: string;
  decisionsNeeded: string;
  nextWeekPlan: string;
  owner: string;
  dueTarget: string;
  managementNote: string;
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  summary: string;
  completedWork: string;
  ongoingWork: string;
  upcomingWork: string;
  risks: string;
  issues: string;
  decisions: string;
  notes: string;
};

const isValidDateInput = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

export const isValidReportRange = (weekStart?: string, weekEnd?: string) =>
  Boolean(
    weekStart &&
      weekEnd &&
      isValidDateInput(weekStart) &&
      isValidDateInput(weekEnd) &&
      weekEnd >= weekStart,
  );

const startOfDay = (dateInput: string) => new Date(`${dateInput}T00:00:00`);
const endOfDay = (dateInput: string) => new Date(`${dateInput}T23:59:59.999`);

const nextWeekEnd = (dateInput: string) => {
  const date = startOfDay(dateInput);
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

const formatLine = (parts: (string | null | undefined)[]) =>
  `- ${parts.filter(Boolean).join(" | ")}`;

const emptyText = (label: string) => `- No ${label} for this period.`;

const statusLabel = (value: string) => value.replaceAll("_", " ");

export async function generateWeeklyReportDraft(
  projectId: number,
  weekStart: string,
  weekEnd: string,
): Promise<WeeklyReportDraft> {
  const [project] = await db
    .select({
      name: projects.name,
      owner: projects.owner,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  const completed = await db
    .select()
    .from(workItems)
    .where(
      and(
        eq(workItems.projectId, projectId),
        eq(workItems.status, "DONE"),
        gte(workItems.completedAt, startOfDay(weekStart)),
        lte(workItems.completedAt, endOfDay(weekEnd)),
      ),
    )
    .orderBy(desc(workItems.completedAt));

  const ongoing = await db
    .select()
    .from(workItems)
    .where(
      and(
        eq(workItems.projectId, projectId),
        inArray(workItems.status, ["IN_PROGRESS", "BLOCKED"]),
      ),
    )
    .orderBy(asc(workItems.dueDate));

  const upcoming = await db
    .select()
    .from(workItems)
    .where(
      and(
        eq(workItems.projectId, projectId),
        inArray(workItems.status, ["TODO", "IN_PROGRESS", "BLOCKED"]),
        gte(workItems.dueDate, weekStart),
        lte(workItems.dueDate, nextWeekEnd(weekEnd)),
      ),
    )
    .orderBy(asc(workItems.dueDate));

  const openRisks = await db
    .select()
    .from(risks)
    .where(
      and(
        eq(risks.projectId, projectId),
        or(
          inArray(risks.status, ["OPEN", "MONITORING"]),
          eq(risks.severity, "HIGH"),
        ),
      ),
    )
    .orderBy(desc(risks.severity), asc(risks.dueDate));

  const openIssues = await db
    .select()
    .from(issues)
    .where(
      and(
        eq(issues.projectId, projectId),
        inArray(issues.status, ["OPEN", "IN_PROGRESS"]),
      ),
    )
    .orderBy(desc(issues.priority), asc(issues.dueDate));

  const weeklyMeetings = await db
    .select()
    .from(meetings)
    .where(
      and(
        eq(meetings.projectId, projectId),
        gte(meetings.meetingDate, startOfDay(weekStart)),
        lte(meetings.meetingDate, endOfDay(weekEnd)),
      ),
    )
    .orderBy(asc(meetings.meetingDate));

  const completedWork =
    completed.length > 0
      ? completed
          .map((item) =>
            formatLine([
              item.title,
              item.owner ? `Owner: ${item.owner}` : null,
              item.completedAt
                ? `Completed: ${item.completedAt.toISOString().slice(0, 10)}`
                : null,
            ]),
          )
          .join("\n")
      : emptyText("completed work");

  const ongoingWork =
    ongoing.length > 0
      ? ongoing
          .map((item) =>
            formatLine([
              item.title,
              `Status: ${statusLabel(item.status)}`,
              item.owner ? `Owner: ${item.owner}` : null,
              item.dueDate ? `Due: ${item.dueDate}` : null,
            ]),
          )
          .join("\n")
      : emptyText("ongoing work");

  const upcomingWork =
    upcoming.length > 0
      ? upcoming
          .map((item) =>
            formatLine([
              item.title,
              `Status: ${statusLabel(item.status)}`,
              item.owner ? `Owner: ${item.owner}` : null,
              item.dueDate ? `Due: ${item.dueDate}` : null,
            ]),
          )
          .join("\n")
      : emptyText("upcoming work");

  const riskText =
    openRisks.length > 0
      ? openRisks
          .map((risk) =>
            formatLine([
              risk.title,
              `Severity: ${risk.severity}`,
              `Status: ${statusLabel(risk.status)}`,
              risk.owner ? `Owner: ${risk.owner}` : null,
              risk.dueDate ? `Review: ${risk.dueDate}` : null,
            ]),
          )
          .join("\n")
      : emptyText("open risks");

  const issueText =
    openIssues.length > 0
      ? openIssues
          .map((issue) =>
            formatLine([
              issue.title,
              `Priority: ${issue.priority}`,
              `Status: ${statusLabel(issue.status)}`,
              issue.owner ? `Owner: ${issue.owner}` : null,
              issue.dueDate ? `Due: ${issue.dueDate}` : null,
            ]),
          )
          .join("\n")
      : emptyText("open issues");

  const decisionText =
    weeklyMeetings.length > 0
      ? weeklyMeetings
          .map((meeting) =>
            formatLine([
              meeting.title,
              meeting.decisions ? `Decisions: ${meeting.decisions}` : null,
            ]),
          )
          .join("\n")
      : emptyText("meeting decisions");

  const hasRedFlags =
    openIssues.some((issue) => issue.priority === "CRITICAL") ||
    openRisks.some((risk) => risk.severity === "HIGH");
  const hasAttentionItems = openIssues.length > 0 || openRisks.length > 0;
  const totalWorkItems = completed.length + ongoing.length;
  const progressPercent =
    totalWorkItems > 0 ? Math.round((completed.length / totalWorkItems) * 100) : 0;
  const dueTarget = upcoming.find((item) => item.dueDate)?.dueDate ?? "";
  const overallStatus = hasRedFlags ? "RED" : hasAttentionItems ? "YELLOW" : "GREEN";

  return {
    week: `${weekStart} - ${weekEnd}`,
    projectName: project?.name ?? "",
    weekStart,
    weekEnd,
    overallStatus,
    progressPercent,
    keyAchievements: completedWork,
    plannedNotDone: ongoingWork,
    issuesBlockers: issueText,
    decisionsNeeded: decisionText,
    nextWeekPlan: upcomingWork,
    owner: project?.owner ?? "",
    dueTarget,
    managementNote: "",
    trend: overallStatus === "RED" ? "DECLINING" : "STABLE",
    summary: `Weekly status for ${weekStart} to ${weekEnd}. Review the generated sections and adjust before saving this snapshot.`,
    completedWork,
    ongoingWork,
    upcomingWork,
    risks: riskText,
    issues: issueText,
    decisions: decisionText,
    notes: "",
  };
}
