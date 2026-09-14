"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  projects,
  reportStatuses,
  reportTrends,
  weeklyReports,
  type ReportStatus,
  type ReportTrend,
} from "@/db/schema";

export type WeeklyReportFormState = {
  error?: string;
  fieldErrors?: Partial<Record<WeeklyReportField, string>>;
};

type WeeklyReportField =
  | "week"
  | "projectName"
  | "weekStart"
  | "weekEnd"
  | "overallStatus"
  | "progressPercent"
  | "keyAchievements"
  | "plannedNotDone"
  | "issuesBlockers"
  | "decisionsNeeded"
  | "nextWeekPlan"
  | "owner"
  | "dueTarget"
  | "managementNote"
  | "trend"
  | "summary"
  | "completedWork"
  | "ongoingWork"
  | "upcomingWork"
  | "risks"
  | "issues"
  | "decisions"
  | "notes";

type WeeklyReportInput = {
  projectId: number;
  week: string | null;
  projectName: string | null;
  weekStart: string;
  weekEnd: string;
  overallStatus: ReportStatus;
  progressPercent: number | null;
  keyAchievements: string | null;
  plannedNotDone: string | null;
  issuesBlockers: string | null;
  decisionsNeeded: string | null;
  nextWeekPlan: string | null;
  owner: string | null;
  dueTarget: string | null;
  managementNote: string | null;
  trend: ReportTrend | null;
  summary: string | null;
  completedWork: string | null;
  ongoingWork: string | null;
  upcomingWork: string | null;
  risks: string | null;
  issues: string | null;
  decisions: string | null;
  notes: string | null;
};

type WeeklyReportValidationResult =
  | { ok: true; input: WeeklyReportInput }
  | { ok: false; state: WeeklyReportFormState };

const textOrNull = (formData: FormData, key: WeeklyReportField) => {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

const numberOrNull = (formData: FormData, key: WeeklyReportField) => {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const findProject = async (projectId: number) => {
  const [project] = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return project;
};

const validateWeeklyReportInput = async (
  projectId: number,
  formData: FormData,
): Promise<WeeklyReportValidationResult> => {
  const fieldErrors: WeeklyReportFormState["fieldErrors"] = {};
  const rawWeekStart = formData.get("weekStart");
  const weekStart = typeof rawWeekStart === "string" ? rawWeekStart.trim() : "";
  const rawWeekEnd = formData.get("weekEnd");
  const weekEnd = typeof rawWeekEnd === "string" ? rawWeekEnd.trim() : "";
  const rawOverallStatus = formData.get("overallStatus");
  const overallStatus =
    typeof rawOverallStatus === "string" &&
    reportStatuses.includes(rawOverallStatus as ReportStatus)
      ? (rawOverallStatus as ReportStatus)
      : null;
  const progressPercent = numberOrNull(formData, "progressPercent");
  const rawProgressPercent = formData.get("progressPercent");
  const rawTrend = formData.get("trend");
  const trend =
    typeof rawTrend === "string" && rawTrend.trim() !== ""
      ? reportTrends.includes(rawTrend as ReportTrend)
        ? (rawTrend as ReportTrend)
        : null
      : null;

  if (!weekStart || !isValidDateInput(weekStart)) {
    fieldErrors.weekStart = "validation.weekStartInvalid";
  }

  if (!weekEnd || !isValidDateInput(weekEnd)) {
    fieldErrors.weekEnd = "validation.weekEndInvalid";
  }

  if (
    weekStart &&
    weekEnd &&
    isValidDateInput(weekStart) &&
    isValidDateInput(weekEnd) &&
    weekEnd < weekStart
  ) {
    fieldErrors.weekEnd = "validation.weekEndBeforeStart";
  }

  if (!overallStatus) {
    fieldErrors.overallStatus = "validation.overallStatusInvalid";
  }

  if (
    typeof rawProgressPercent === "string" &&
    rawProgressPercent.trim() !== "" &&
    (progressPercent === null || progressPercent < 0 || progressPercent > 100)
  ) {
    fieldErrors.progressPercent = "validation.progressPercentInvalid";
  }

  if (typeof rawTrend === "string" && rawTrend.trim() !== "" && !trend) {
    fieldErrors.trend = "validation.trendInvalid";
  }

  if (Object.keys(fieldErrors).length > 0 || !overallStatus) {
    return {
      ok: false,
      state: {
        error: "validation.weeklyReportCheck",
        fieldErrors,
      },
    };
  }

  const project = await findProject(projectId);

  if (!project) {
    return {
      ok: false,
      state: {
        error: "validation.projectNotFound",
      },
    };
  }

  const keyAchievements = textOrNull(formData, "keyAchievements");
  const plannedNotDone = textOrNull(formData, "plannedNotDone");
  const issuesBlockers = textOrNull(formData, "issuesBlockers");
  const decisionsNeeded = textOrNull(formData, "decisionsNeeded");
  const nextWeekPlan = textOrNull(formData, "nextWeekPlan");
  const managementNote = textOrNull(formData, "managementNote");

  return {
    ok: true,
    input: {
      projectId,
      week: textOrNull(formData, "week"),
      projectName: textOrNull(formData, "projectName") ?? project.name,
      weekStart,
      weekEnd,
      overallStatus,
      progressPercent,
      keyAchievements,
      plannedNotDone,
      issuesBlockers,
      decisionsNeeded,
      nextWeekPlan,
      owner: textOrNull(formData, "owner"),
      dueTarget: textOrNull(formData, "dueTarget"),
      managementNote,
      trend,
      summary: textOrNull(formData, "summary"),
      completedWork: keyAchievements,
      ongoingWork: plannedNotDone,
      upcomingWork: nextWeekPlan,
      risks: textOrNull(formData, "risks"),
      issues: issuesBlockers,
      decisions: decisionsNeeded,
      notes: managementNote,
    },
  };
};

export async function createWeeklyReportAction(
  projectId: number,
  _previousState: WeeklyReportFormState,
  formData: FormData,
): Promise<WeeklyReportFormState> {
  const input = await validateWeeklyReportInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  let createdReportId: number;

  try {
    const [createdReport] = await db
      .insert(weeklyReports)
      .values(input.input)
      .returning({ id: weeklyReports.id });

    createdReportId = createdReport.id;
  } catch {
    return {
      error: "validation.weeklyReportSaveFailed",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/weekly-reports`);
  redirect(`/projects/${projectId}/weekly-reports/${createdReportId}`);
}

export async function updateWeeklyReportAction(
  projectId: number,
  reportId: number,
  _previousState: WeeklyReportFormState,
  formData: FormData,
): Promise<WeeklyReportFormState> {
  const [existingReport] = await db
    .select({ id: weeklyReports.id })
    .from(weeklyReports)
    .where(
      and(eq(weeklyReports.id, reportId), eq(weeklyReports.projectId, projectId)),
    )
    .limit(1);

  if (!existingReport) {
    return {
      error: "validation.weeklyReportNotFound",
    };
  }

  const input = await validateWeeklyReportInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    const [updatedReport] = await db
      .update(weeklyReports)
      .set(input.input)
      .where(
        and(eq(weeklyReports.id, reportId), eq(weeklyReports.projectId, projectId)),
      )
      .returning({ id: weeklyReports.id });

    if (!updatedReport) {
      return {
        error: "validation.weeklyReportNotFound",
      };
    }
  } catch {
    return {
      error: "validation.weeklyReportUpdateFailed",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/weekly-reports`);
  revalidatePath(`/projects/${projectId}/weekly-reports/${reportId}`);
  redirect(`/projects/${projectId}/weekly-reports/${reportId}`);
}
