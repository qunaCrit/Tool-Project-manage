"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { projects, projectStatuses, type ProjectStatus } from "@/db/schema";

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Partial<Record<ProjectField, string>>;
};

type ProjectField =
  | "name"
  | "description"
  | "status"
  | "startDate"
  | "endDate"
  | "owner"
  | "customer"
  | "objective"
  | "healthNote";

type ProjectInput = {
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  owner: string | null;
  customer: string | null;
  objective: string | null;
  healthNote: string | null;
};

type ProjectValidationResult =
  | { ok: true; input: ProjectInput }
  | { ok: false; state: ProjectFormState };

const textOrNull = (formData: FormData, key: ProjectField) => {
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

const validateProjectInput = (formData: FormData): ProjectValidationResult => {
  const fieldErrors: ProjectFormState["fieldErrors"] = {};
  const rawName = formData.get("name");
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const rawStatus = formData.get("status");
  const status =
    typeof rawStatus === "string" &&
    projectStatuses.includes(rawStatus as ProjectStatus)
      ? (rawStatus as ProjectStatus)
      : null;
  const startDate = textOrNull(formData, "startDate");
  const endDate = textOrNull(formData, "endDate");

  if (!name) {
    fieldErrors.name = "validation.nameRequired";
  }

  if (!status) {
    fieldErrors.status = "validation.statusInvalid";
  }

  if (startDate && !isValidDateInput(startDate)) {
    fieldErrors.startDate = "validation.startDateInvalid";
  }

  if (endDate && !isValidDateInput(endDate)) {
    fieldErrors.endDate = "validation.endDateInvalid";
  }

  if (
    startDate &&
    endDate &&
    isValidDateInput(startDate) &&
    isValidDateInput(endDate) &&
    endDate < startDate
  ) {
    fieldErrors.endDate = "validation.endDateBeforeStart";
  }

  if (Object.keys(fieldErrors).length > 0 || !status) {
    return {
      ok: false,
      state: {
        error: "validation.projectCheck",
        fieldErrors,
      },
    };
  }

  return {
    ok: true,
    input: {
      name,
      description: textOrNull(formData, "description"),
      status,
      startDate,
      endDate,
      owner: textOrNull(formData, "owner"),
      customer: textOrNull(formData, "customer"),
      objective: textOrNull(formData, "objective"),
      healthNote: textOrNull(formData, "healthNote"),
    },
  };
};

export async function createProjectAction(
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const input = validateProjectInput(formData);

  if (!input.ok) {
    return input.state;
  }

  let createdProjectId: number;

  try {
    const [createdProject] = await db
      .insert(projects)
      .values(input.input)
      .returning({
        id: projects.id,
      });

    createdProjectId = createdProject.id;
  } catch {
    return {
      error: "validation.projectCreateFailed",
    };
  }

  revalidatePath("/projects");
  redirect(`/projects/${createdProjectId}`);
}

export async function updateProjectAction(
  projectId: number,
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const input = validateProjectInput(formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    const [updatedProject] = await db
      .update(projects)
      .set(input.input)
      .where(eq(projects.id, projectId))
      .returning({ id: projects.id });

    if (!updatedProject) {
      return {
        error: "validation.projectNotFound",
      };
    }
  } catch {
    return {
      error: "validation.projectUpdateFailed",
    };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function deleteProjectAction(formData: FormData) {
  const rawId = formData.get("projectId");
  const projectId = typeof rawId === "string" ? Number(rawId) : NaN;

  if (!Number.isInteger(projectId) || projectId <= 0) {
    redirect("/projects?error=invalid-delete");
  }

  try {
    await db.delete(projects).where(eq(projects.id, projectId));
  } catch {
    redirect("/projects?error=delete-failed");
  }

  revalidatePath("/projects");
  redirect("/projects");
}
