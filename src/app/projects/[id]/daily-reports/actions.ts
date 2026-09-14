"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  dailyReports,
  priorities,
  projects,
  reportStatuses,
  workItemStatuses,
  type Priority,
  type ReportStatus,
  type WorkItemStatus,
} from "@/db/schema";

export type DailyReportFormState = {
  error?: string;
  fieldErrors?: Partial<Record<DailyReportField, string>>;
};

type DailyReportField =
  | "reportDate"
  | "projectName"
  | "workstream"
  | "taskId"
  | "task"
  | "owner"
  | "planToday"
  | "actualResult"
  | "completePercent"
  | "status"
  | "priority"
  | "blockerIssue"
  | "risk"
  | "supportNeeded"
  | "nextAction"
  | "dueDate"
  | "health";

type DailyReportInput = {
  projectId: number;
  reportDate: string;
  projectName: string | null;
  workstream: string | null;
  taskId: string | null;
  task: string;
  owner: string | null;
  planToday: string | null;
  actualResult: string | null;
  completePercent: number | null;
  status: WorkItemStatus;
  priority: Priority;
  blockerIssue: string | null;
  risk: string | null;
  supportNeeded: string | null;
  nextAction: string | null;
  dueDate: string | null;
  health: ReportStatus;
};

type DailyReportValidationResult =
  | { ok: true; input: DailyReportInput }
  | { ok: false; state: DailyReportFormState };

const textOrNull = (formData: FormData, key: DailyReportField) => {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const numberOrNull = (formData: FormData, key: DailyReportField) => {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
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

const findProject = async (projectId: number) => {
  const [project] = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return project;
};

const validateDailyReportInput = async (
  projectId: number,
  formData: FormData,
): Promise<DailyReportValidationResult> => {
  const fieldErrors: DailyReportFormState["fieldErrors"] = {};
  const rawReportDate = formData.get("reportDate");
  const reportDate = typeof rawReportDate === "string" ? rawReportDate.trim() : "";
  const rawTask = formData.get("task");
  const task = typeof rawTask === "string" ? rawTask.trim() : "";
  const rawStatus = formData.get("status");
  const status =
    typeof rawStatus === "string" &&
    workItemStatuses.includes(rawStatus as WorkItemStatus)
      ? (rawStatus as WorkItemStatus)
      : null;
  const rawPriority = formData.get("priority");
  const priority =
    typeof rawPriority === "string" && priorities.includes(rawPriority as Priority)
      ? (rawPriority as Priority)
      : null;
  const rawHealth = formData.get("health");
  const health =
    typeof rawHealth === "string" &&
    reportStatuses.includes(rawHealth as ReportStatus)
      ? (rawHealth as ReportStatus)
      : null;
  const completePercent = numberOrNull(formData, "completePercent");
  const rawCompletePercent = formData.get("completePercent");
  const dueDate = textOrNull(formData, "dueDate");

  if (!reportDate || !isValidDateInput(reportDate)) {
    fieldErrors.reportDate = "validation.reportDateInvalid";
  }

  if (!task) {
    fieldErrors.task = "validation.titleRequired";
  }

  if (!status) {
    fieldErrors.status = "validation.statusInvalid";
  }

  if (!priority) {
    fieldErrors.priority = "validation.priorityInvalid";
  }

  if (!health) {
    fieldErrors.health = "validation.healthInvalid";
  }

  if (
    typeof rawCompletePercent === "string" &&
    rawCompletePercent.trim() !== "" &&
    (completePercent === null || completePercent < 0 || completePercent > 100)
  ) {
    fieldErrors.completePercent = "validation.completePercentInvalid";
  }

  if (dueDate && !isValidDateInput(dueDate)) {
    fieldErrors.dueDate = "validation.dueDateInvalid";
  }

  if (Object.keys(fieldErrors).length > 0 || !status || !priority || !health) {
    return {
      ok: false,
      state: {
        error: "validation.dailyReportCheck",
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

  return {
    ok: true,
    input: {
      projectId,
      reportDate,
      projectName: textOrNull(formData, "projectName") ?? project.name,
      workstream: textOrNull(formData, "workstream"),
      taskId: textOrNull(formData, "taskId"),
      task,
      owner: textOrNull(formData, "owner"),
      planToday: textOrNull(formData, "planToday"),
      actualResult: textOrNull(formData, "actualResult"),
      completePercent,
      status,
      priority,
      blockerIssue: textOrNull(formData, "blockerIssue"),
      risk: textOrNull(formData, "risk"),
      supportNeeded: textOrNull(formData, "supportNeeded"),
      nextAction: textOrNull(formData, "nextAction"),
      dueDate,
      health,
    },
  };
};

export async function createDailyReportAction(
  projectId: number,
  _previousState: DailyReportFormState,
  formData: FormData,
): Promise<DailyReportFormState> {
  const input = await validateDailyReportInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    await db.insert(dailyReports).values(input.input);
  } catch {
    return {
      error: "validation.dailyReportCreateFailed",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/daily-reports`);
  redirect(`/projects/${projectId}/daily-reports`);
}

export async function updateDailyReportAction(
  projectId: number,
  reportId: number,
  _previousState: DailyReportFormState,
  formData: FormData,
): Promise<DailyReportFormState> {
  const [existingReport] = await db
    .select({ id: dailyReports.id })
    .from(dailyReports)
    .where(and(eq(dailyReports.id, reportId), eq(dailyReports.projectId, projectId)))
    .limit(1);

  if (!existingReport) {
    return {
      error: "validation.dailyReportNotFound",
    };
  }

  const input = await validateDailyReportInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    const [updatedReport] = await db
      .update(dailyReports)
      .set(input.input)
      .where(
        and(eq(dailyReports.id, reportId), eq(dailyReports.projectId, projectId)),
      )
      .returning({ id: dailyReports.id });

    if (!updatedReport) {
      return {
        error: "validation.dailyReportNotFound",
      };
    }
  } catch {
    return {
      error: "validation.dailyReportUpdateFailed",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/daily-reports`);
  redirect(`/projects/${projectId}/daily-reports`);
}

export async function deleteDailyReportAction(formData: FormData) {
  const rawProjectId = formData.get("projectId");
  const rawReportId = formData.get("reportId");
  const projectId = typeof rawProjectId === "string" ? Number(rawProjectId) : NaN;
  const reportId = typeof rawReportId === "string" ? Number(rawReportId) : NaN;

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(reportId) ||
    reportId <= 0
  ) {
    redirect("/projects?error=invalid-delete");
  }

  try {
    await db
      .delete(dailyReports)
      .where(and(eq(dailyReports.id, reportId), eq(dailyReports.projectId, projectId)));
  } catch {
    redirect(`/projects/${projectId}/daily-reports?error=delete-failed`);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/daily-reports`);
  redirect(`/projects/${projectId}/daily-reports`);
}
