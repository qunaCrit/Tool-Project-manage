"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  projects,
  riskLevels,
  risks,
  riskStatuses,
  type RiskLevel,
  type RiskSeverity,
  type RiskStatus,
} from "@/db/schema";
import { calculateRiskSeverity } from "./risk-severity";

export type RiskFormState = {
  error?: string;
  fieldErrors?: Partial<Record<RiskField, string>>;
};

type RiskField =
  | "title"
  | "description"
  | "probability"
  | "impact"
  | "mitigation"
  | "owner"
  | "status"
  | "dueDate";

type RiskInput = {
  projectId: number;
  title: string;
  description: string | null;
  probability: RiskLevel;
  impact: RiskLevel;
  severity: RiskSeverity;
  mitigation: string | null;
  owner: string | null;
  status: RiskStatus;
  dueDate: string | null;
};

type RiskValidationResult =
  | { ok: true; input: RiskInput }
  | { ok: false; state: RiskFormState };

const textOrNull = (formData: FormData, key: RiskField) => {
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

const validateRiskInput = async (
  projectId: number,
  formData: FormData,
): Promise<RiskValidationResult> => {
  const fieldErrors: RiskFormState["fieldErrors"] = {};
  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const rawProbability = formData.get("probability");
  const probability =
    typeof rawProbability === "string" &&
    riskLevels.includes(rawProbability as RiskLevel)
      ? (rawProbability as RiskLevel)
      : null;
  const rawImpact = formData.get("impact");
  const impact =
    typeof rawImpact === "string" && riskLevels.includes(rawImpact as RiskLevel)
      ? (rawImpact as RiskLevel)
      : null;
  const rawStatus = formData.get("status");
  const status =
    typeof rawStatus === "string" && riskStatuses.includes(rawStatus as RiskStatus)
      ? (rawStatus as RiskStatus)
      : null;
  const dueDate = textOrNull(formData, "dueDate");

  if (!title) {
    fieldErrors.title = "validation.titleRequired";
  }

  if (!probability) {
    fieldErrors.probability = "validation.probabilityInvalid";
  }

  if (!impact) {
    fieldErrors.impact = "validation.impactInvalid";
  }

  if (!status) {
    fieldErrors.status = "validation.statusInvalid";
  }

  if (dueDate && !isValidDateInput(dueDate)) {
    fieldErrors.dueDate = "validation.dueDateInvalid";
  }

  if (Object.keys(fieldErrors).length > 0 || !probability || !impact || !status) {
    return {
      ok: false,
      state: {
        error: "validation.riskCheck",
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
      description: textOrNull(formData, "description"),
      probability,
      impact,
      severity: calculateRiskSeverity(probability, impact),
      mitigation: textOrNull(formData, "mitigation"),
      owner: textOrNull(formData, "owner"),
      status,
      dueDate,
    },
  };
};

export async function createRiskAction(
  projectId: number,
  _previousState: RiskFormState,
  formData: FormData,
): Promise<RiskFormState> {
  const input = await validateRiskInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    await db.insert(risks).values(input.input);
  } catch {
    return {
      error: "validation.riskCreateFailed",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/risks`);
  redirect(`/projects/${projectId}/risks`);
}

export async function updateRiskAction(
  projectId: number,
  riskId: number,
  _previousState: RiskFormState,
  formData: FormData,
): Promise<RiskFormState> {
  const [existingRisk] = await db
    .select({ id: risks.id })
    .from(risks)
    .where(and(eq(risks.id, riskId), eq(risks.projectId, projectId)))
    .limit(1);

  if (!existingRisk) {
    return {
      error: "validation.riskNotFound",
    };
  }

  const input = await validateRiskInput(projectId, formData);

  if (!input.ok) {
    return input.state;
  }

  try {
    const [updatedRisk] = await db
      .update(risks)
      .set(input.input)
      .where(and(eq(risks.id, riskId), eq(risks.projectId, projectId)))
      .returning({ id: risks.id });

    if (!updatedRisk) {
      return {
        error: "validation.riskNotFound",
      };
    }
  } catch {
    return {
      error: "validation.riskUpdateFailed",
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/risks`);
  redirect(`/projects/${projectId}/risks`);
}

export async function deleteRiskAction(formData: FormData) {
  const rawProjectId = formData.get("projectId");
  const rawRiskId = formData.get("riskId");
  const projectId = typeof rawProjectId === "string" ? Number(rawProjectId) : NaN;
  const riskId = typeof rawRiskId === "string" ? Number(rawRiskId) : NaN;

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(riskId) ||
    riskId <= 0
  ) {
    redirect("/projects?error=invalid-delete");
  }

  try {
    await db
      .delete(risks)
      .where(and(eq(risks.id, riskId), eq(risks.projectId, projectId)));
  } catch {
    redirect(`/projects/${projectId}/risks?error=delete-failed`);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/risks`);
  redirect(`/projects/${projectId}/risks`);
}
