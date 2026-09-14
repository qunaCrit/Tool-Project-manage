"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  priorities,
  projects,
  workItems,
  workItemStatuses,
  workItemTypes,
  type Priority,
  type WorkItemStatus,
  type WorkItemType,
} from "@/db/schema";

export type WorkItemFormState = {
  error?: string;
  fieldErrors?: Partial<Record<WorkItemField, string>>;
};

type WorkItemField =
  | "type"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "owner"
  | "dueDate"
  | "source";

type WorkItemInput = {
  projectId: number;
  meetingId: number | null;
  type: WorkItemType;
  title: string;
  description: string | null;
  status: WorkItemStatus;
  priority: Priority;
  owner: string | null;
  dueDate: string | null;
  source: string | null;
  completedAt: Date | null;
};

type WorkItemValidationResult =
  | { ok: true; input: WorkItemInput }
  | { ok: false; state: WorkItemFormState };

const textOrNull = (formData: FormData, key: WorkItemField) => {
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

const validateWorkItemInput = async (
  projectId: number,
  formData: FormData,
  existingCompletedAt?: Date | null,
): Promise<WorkItemValidationResult> => {
  const fieldErrors: WorkItemFormState["fieldErrors"] = {};
  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const rawType = formData.get("type");
  const type =
    typeof rawType === "string" && workItemTypes.includes(rawType as WorkItemType)
      ? (rawType as WorkItemType)
      : null;
  const rawStatus = formData.get("status");
  const status =
    typeof rawStatus === "string" &&
    workItemStatuses.includes(rawStatus as WorkItemStatus)
      ? (rawStatus as WorkItemStatus)
      : null;
  const rawPriority = formData.get("priority");
  const priority =
    typeof rawPriority === "string" &&
    priorities.includes(rawPriority as Priority)
      ? (rawPriority as Priority)
      : null;
  const dueDate = textOrNull(formData, "dueDate");

  if (!title) {
    fieldErrors.title = "Title is required.";
  }

  if (!type) {
    fieldErrors.type = "Type is invalid.";
  }

  if (!status) {
    fieldErrors.status = "Status is invalid.";
  }

  if (!priority) {
    fieldErrors.priority = "Priority is invalid.";
  }

  if (dueDate && !isValidDateInput(dueDate)) {
    fieldErrors.dueDate = "Due date must be a valid date.";
  }

  if (Object.keys(fieldErrors).length > 0 || !type || !status || !priority) {
    return {
      ok: false,
      state: {
        error: "Please check the work item information.",
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
      meetingId: null,
      type,
      title,
      description: textOrNull(formData, "description"),
      status,
      priority,
      owner: textOrNull(formData, "owner"),
      dueDate,
      source: textOrNull(formData, "source"),
      completedAt: status === "DONE" ? existingCompletedAt ?? new Date() : null,
    },
  };
};

export async function createWorkItemAction(
  projectId: number,
  _previousState: WorkItemFormState,
  formData: FormData,
): Promise<WorkItemFormState> {
  const input = await validateWorkItemInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    await db.insert(workItems).values(input.input);
  } catch {
    return {
      error: "Could not create the work item. Please try again.",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work-items`);
  redirect(`/projects/${projectId}/work-items`);
}

export async function updateWorkItemAction(
  projectId: number,
  workItemId: number,
  _previousState: WorkItemFormState,
  formData: FormData,
): Promise<WorkItemFormState> {
  const [existingWorkItem] = await db
    .select({ completedAt: workItems.completedAt })
    .from(workItems)
    .where(and(eq(workItems.id, workItemId), eq(workItems.projectId, projectId)))
    .limit(1);

  if (!existingWorkItem) {
    return {
      error: "Work item was not found.",
    };
  }

  const input = await validateWorkItemInput(
    projectId,
    formData,
    existingWorkItem.completedAt,
  );

  if (!input.ok) {
    return input.state;
  }

  try {
    const [updatedWorkItem] = await db
      .update(workItems)
      .set(input.input)
      .where(and(eq(workItems.id, workItemId), eq(workItems.projectId, projectId)))
      .returning({ id: workItems.id });

    if (!updatedWorkItem) {
      return {
        error: "Work item was not found.",
      };
    }
  } catch {
    return {
      error: "Could not update the work item. Please try again.",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work-items`);
  redirect(`/projects/${projectId}/work-items`);
}

export async function deleteWorkItemAction(formData: FormData) {
  const rawProjectId = formData.get("projectId");
  const rawWorkItemId = formData.get("workItemId");
  const projectId = typeof rawProjectId === "string" ? Number(rawProjectId) : NaN;
  const workItemId =
    typeof rawWorkItemId === "string" ? Number(rawWorkItemId) : NaN;

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(workItemId) ||
    workItemId <= 0
  ) {
    redirect("/projects?error=invalid-delete");
  }

  try {
    await db
      .delete(workItems)
      .where(and(eq(workItems.id, workItemId), eq(workItems.projectId, projectId)));
  } catch {
    redirect(`/projects/${projectId}/work-items?error=delete-failed`);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work-items`);
  redirect(`/projects/${projectId}/work-items`);
}
