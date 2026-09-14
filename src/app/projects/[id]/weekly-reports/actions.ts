"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  projects,
  reportStatuses,
  weeklyReports,
  type ReportStatus,
} from "@/db/schema";

export type WeeklyReportFormState = {
  error?: string;
  fieldErrors?: Partial<Record<WeeklyReportField, string>>;
};

type WeeklyReportField =
  | "weekStart"
  | "weekEnd"
  | "overallStatus"
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
  weekStart: string;
  weekEnd: string;
  overallStatus: ReportStatus;
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

const projectExists = async (projectId: number) => {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return Boolean(project);
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

  if (Object.keys(fieldErrors).length > 0 || !overallStatus) {
    return {
      ok: false,
      state: {
        error: "validation.weeklyReportCheck",
        fieldErrors,
      },
    };
  }

  if (!(await projectExists(projectId))) {
    return {
      ok: false,
      state: {
        error: "validation.projectNotFound",
      },
    };
  }

  return {
    ok: true,
    input: {
      projectId,
      weekStart,
      weekEnd,
      overallStatus,
      summary: textOrNull(formData, "summary"),
      completedWork: textOrNull(formData, "completedWork"),
      ongoingWork: textOrNull(formData, "ongoingWork"),
      upcomingWork: textOrNull(formData, "upcomingWork"),
      risks: textOrNull(formData, "risks"),
      issues: textOrNull(formData, "issues"),
      decisions: textOrNull(formData, "decisions"),
      notes: textOrNull(formData, "notes"),
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
