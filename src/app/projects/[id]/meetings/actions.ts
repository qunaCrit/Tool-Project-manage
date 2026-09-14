"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  meetings,
  priorities,
  projects,
  workItems,
  workItemStatuses,
  type Priority,
  type WorkItemStatus,
} from "@/db/schema";

export type MeetingFormState = {
  error?: string;
  fieldErrors?: Partial<Record<MeetingField, string>>;
};

export type MeetingActionItemFormState = {
  error?: string;
  fieldErrors?: Partial<Record<ActionItemField, string>>;
};

type MeetingField =
  | "title"
  | "meetingDate"
  | "participants"
  | "agenda"
  | "notes"
  | "summary"
  | "decisions";

type ActionItemField = "title" | "owner" | "dueDate" | "priority" | "status";

type MeetingInput = {
  projectId: number;
  title: string;
  meetingDate: Date;
  participants: string | null;
  agenda: string | null;
  notes: string | null;
  summary: string | null;
  decisions: string | null;
};

type MeetingValidationResult =
  | { ok: true; input: MeetingInput }
  | { ok: false; state: MeetingFormState };

type ActionItemInput = {
  projectId: number;
  meetingId: number;
  type: "ACTION_ITEM";
  title: string;
  description: string | null;
  status: WorkItemStatus;
  priority: Priority;
  owner: string | null;
  dueDate: string | null;
  source: string;
  completedAt: Date | null;
};

type ActionItemValidationResult =
  | { ok: true; input: ActionItemInput }
  | { ok: false; state: MeetingActionItemFormState };

const textOrNull = (formData: FormData, key: MeetingField | ActionItemField) => {
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

const isValidDateTimeInput = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const projectExists = async (projectId: number) => {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return Boolean(project);
};

const getMeetingForProject = async (projectId: number, meetingId: number) => {
  const [meeting] = await db
    .select({ id: meetings.id, title: meetings.title })
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.projectId, projectId)))
    .limit(1);

  return meeting;
};

const validateMeetingInput = async (
  projectId: number,
  formData: FormData,
): Promise<MeetingValidationResult> => {
  const fieldErrors: MeetingFormState["fieldErrors"] = {};
  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const rawMeetingDate = formData.get("meetingDate");
  const meetingDate =
    typeof rawMeetingDate === "string" ? rawMeetingDate.trim() : "";

  if (!title) {
    fieldErrors.title = "validation.titleRequired";
  }

  if (!meetingDate || !isValidDateTimeInput(meetingDate)) {
    fieldErrors.meetingDate = "validation.meetingDateInvalid";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        error: "validation.meetingCheck",
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
      title,
      meetingDate: new Date(meetingDate),
      participants: textOrNull(formData, "participants"),
      agenda: textOrNull(formData, "agenda"),
      notes: textOrNull(formData, "notes"),
      summary: textOrNull(formData, "summary"),
      decisions: textOrNull(formData, "decisions"),
    },
  };
};

const validateActionItemInput = async (
  projectId: number,
  meetingId: number,
  formData: FormData,
): Promise<ActionItemValidationResult> => {
  const fieldErrors: MeetingActionItemFormState["fieldErrors"] = {};
  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const rawPriority = formData.get("priority");
  const priority =
    typeof rawPriority === "string" &&
    priorities.includes(rawPriority as Priority)
      ? (rawPriority as Priority)
      : null;
  const rawStatus = formData.get("status");
  const status =
    typeof rawStatus === "string" &&
    workItemStatuses.includes(rawStatus as WorkItemStatus)
      ? (rawStatus as WorkItemStatus)
      : null;
  const dueDate = textOrNull(formData, "dueDate");

  if (!title) {
    fieldErrors.title = "validation.titleRequired";
  }

  if (!priority) {
    fieldErrors.priority = "validation.priorityInvalid";
  }

  if (!status) {
    fieldErrors.status = "validation.statusInvalid";
  }

  if (dueDate && !isValidDateInput(dueDate)) {
    fieldErrors.dueDate = "validation.dueDateInvalid";
  }

  if (Object.keys(fieldErrors).length > 0 || !priority || !status) {
    return {
      ok: false,
      state: {
        error: "validation.actionItemCheck",
        fieldErrors,
      },
    };
  }

  const meeting = await getMeetingForProject(projectId, meetingId);

  if (!meeting) {
    return {
      ok: false,
      state: {
        error: "validation.meetingNotFound",
      },
    };
  }

  return {
    ok: true,
    input: {
      projectId,
      meetingId,
      type: "ACTION_ITEM",
      title,
      description: null,
      status,
      priority,
      owner: textOrNull(formData, "owner"),
      dueDate,
      source: meeting.title,
      completedAt: status === "DONE" ? new Date() : null,
    },
  };
};

export async function createMeetingAction(
  projectId: number,
  _previousState: MeetingFormState,
  formData: FormData,
): Promise<MeetingFormState> {
  const input = await validateMeetingInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  let createdMeetingId: number;

  try {
    const [createdMeeting] = await db
      .insert(meetings)
      .values(input.input)
      .returning({ id: meetings.id });

    createdMeetingId = createdMeeting.id;
  } catch {
    return {
      error: "validation.meetingCreateFailed",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/meetings`);
  redirect(`/projects/${projectId}/meetings/${createdMeetingId}`);
}

export async function updateMeetingAction(
  projectId: number,
  meetingId: number,
  _previousState: MeetingFormState,
  formData: FormData,
): Promise<MeetingFormState> {
  const existingMeeting = await getMeetingForProject(projectId, meetingId);

  if (!existingMeeting) {
    return {
      error: "validation.meetingNotFound",
    };
  }

  const input = await validateMeetingInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    const [updatedMeeting] = await db
      .update(meetings)
      .set(input.input)
      .where(and(eq(meetings.id, meetingId), eq(meetings.projectId, projectId)))
      .returning({ id: meetings.id });

    if (!updatedMeeting) {
      return {
        error: "validation.meetingNotFound",
      };
    }
  } catch {
    return {
      error: "validation.meetingUpdateFailed",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/meetings`);
  revalidatePath(`/projects/${projectId}/meetings/${meetingId}`);
  redirect(`/projects/${projectId}/meetings/${meetingId}`);
}

export async function deleteMeetingAction(formData: FormData) {
  const rawProjectId = formData.get("projectId");
  const rawMeetingId = formData.get("meetingId");
  const projectId = typeof rawProjectId === "string" ? Number(rawProjectId) : NaN;
  const meetingId = typeof rawMeetingId === "string" ? Number(rawMeetingId) : NaN;

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(meetingId) ||
    meetingId <= 0
  ) {
    redirect("/projects?error=invalid-delete");
  }

  try {
    await db
      .update(workItems)
      .set({ meetingId: null })
      .where(
        and(eq(workItems.projectId, projectId), eq(workItems.meetingId, meetingId)),
      );

    await db
      .delete(meetings)
      .where(and(eq(meetings.id, meetingId), eq(meetings.projectId, projectId)));
  } catch {
    redirect(`/projects/${projectId}/meetings?error=delete-failed`);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/meetings`);
  revalidatePath(`/projects/${projectId}/work-items`);
  redirect(`/projects/${projectId}/meetings`);
}

export async function createMeetingActionItemAction(
  projectId: number,
  meetingId: number,
  _previousState: MeetingActionItemFormState,
  formData: FormData,
): Promise<MeetingActionItemFormState> {
  const input = await validateActionItemInput(projectId, meetingId, formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    await db.insert(workItems).values(input.input);
  } catch {
    return {
      error: "validation.actionItemCreateFailed",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/meetings/${meetingId}`);
  revalidatePath(`/projects/${projectId}/work-items`);
  redirect(`/projects/${projectId}/meetings/${meetingId}`);
}
