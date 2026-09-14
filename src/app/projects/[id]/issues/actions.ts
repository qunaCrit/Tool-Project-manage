"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  issueStatuses,
  issues,
  priorities,
  projects,
  type IssueStatus,
  type Priority,
} from "@/db/schema";

export type IssueFormState = {
  error?: string;
  fieldErrors?: Partial<Record<IssueField, string>>;
};

type IssueField =
  | "title"
  | "description"
  | "priority"
  | "impact"
  | "owner"
  | "status"
  | "resolution"
  | "dueDate"
  | "detectedAt";

type IssueInput = {
  projectId: number;
  title: string;
  description: string | null;
  priority: Priority;
  impact: string | null;
  owner: string | null;
  status: IssueStatus;
  resolution: string | null;
  dueDate: string | null;
  detectedAt: string | null;
  resolvedAt: string | null;
};

type IssueValidationResult =
  | { ok: true; input: IssueInput }
  | { ok: false; state: IssueFormState };

const textOrNull = (formData: FormData, key: IssueField) => {
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

const todayInput = () => new Date().toISOString().slice(0, 10);

const projectExists = async (projectId: number) => {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return Boolean(project);
};

const validateIssueInput = async (
  projectId: number,
  formData: FormData,
  existingResolvedAt?: string | null,
): Promise<IssueValidationResult> => {
  const fieldErrors: IssueFormState["fieldErrors"] = {};
  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const rawPriority = formData.get("priority");
  const priority =
    typeof rawPriority === "string" && priorities.includes(rawPriority as Priority)
      ? (rawPriority as Priority)
      : null;
  const rawStatus = formData.get("status");
  const status =
    typeof rawStatus === "string" &&
    issueStatuses.includes(rawStatus as IssueStatus)
      ? (rawStatus as IssueStatus)
      : null;
  const dueDate = textOrNull(formData, "dueDate");
  const detectedAt = textOrNull(formData, "detectedAt");

  if (!title) {
    fieldErrors.title = "Title is required.";
  }

  if (!priority) {
    fieldErrors.priority = "Priority is invalid.";
  }

  if (!status) {
    fieldErrors.status = "Status is invalid.";
  }

  if (dueDate && !isValidDateInput(dueDate)) {
    fieldErrors.dueDate = "Due date must be a valid date.";
  }

  if (detectedAt && !isValidDateInput(detectedAt)) {
    fieldErrors.detectedAt = "Detected date must be a valid date.";
  }

  if (Object.keys(fieldErrors).length > 0 || !priority || !status) {
    return {
      ok: false,
      state: {
        error: "Please check the issue information.",
        fieldErrors,
      },
    };
  }

  if (!(await projectExists(projectId))) {
    return {
      ok: false,
      state: {
        error: "Project was not found.",
      },
    };
  }

  return {
    ok: true,
    input: {
      projectId,
      title,
      description: textOrNull(formData, "description"),
      priority,
      impact: textOrNull(formData, "impact"),
      owner: textOrNull(formData, "owner"),
      status,
      resolution: textOrNull(formData, "resolution"),
      dueDate,
      detectedAt,
      resolvedAt:
        status === "RESOLVED" || status === "CLOSED"
          ? existingResolvedAt ?? todayInput()
          : null,
    },
  };
};

export async function createIssueAction(
  projectId: number,
  _previousState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  const input = await validateIssueInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    await db.insert(issues).values(input.input);
  } catch {
    return {
      error: "Could not create the issue. Please try again.",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/issues`);
  redirect(`/projects/${projectId}/issues`);
}

export async function updateIssueAction(
  projectId: number,
  issueId: number,
  _previousState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  const [existingIssue] = await db
    .select({ resolvedAt: issues.resolvedAt })
    .from(issues)
    .where(and(eq(issues.id, issueId), eq(issues.projectId, projectId)))
    .limit(1);

  if (!existingIssue) {
    return {
      error: "Issue was not found.",
    };
  }

  const input = await validateIssueInput(
    projectId,
    formData,
    existingIssue.resolvedAt,
  );

  if (!input.ok) {
    return input.state;
  }

  try {
    const [updatedIssue] = await db
      .update(issues)
      .set(input.input)
      .where(and(eq(issues.id, issueId), eq(issues.projectId, projectId)))
      .returning({ id: issues.id });

    if (!updatedIssue) {
      return {
        error: "Issue was not found.",
      };
    }
  } catch {
    return {
      error: "Could not update the issue. Please try again.",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/issues`);
  redirect(`/projects/${projectId}/issues`);
}

export async function deleteIssueAction(formData: FormData) {
  const rawProjectId = formData.get("projectId");
  const rawIssueId = formData.get("issueId");
  const projectId = typeof rawProjectId === "string" ? Number(rawProjectId) : NaN;
  const issueId = typeof rawIssueId === "string" ? Number(rawIssueId) : NaN;

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(issueId) ||
    issueId <= 0
  ) {
    redirect("/projects?error=invalid-delete");
  }

  try {
    await db
      .delete(issues)
      .where(and(eq(issues.id, issueId), eq(issues.projectId, projectId)));
  } catch {
    redirect(`/projects/${projectId}/issues?error=delete-failed`);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/issues`);
  redirect(`/projects/${projectId}/issues`);
}
