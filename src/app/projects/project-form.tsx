"use client";

import { useActionState } from "react";

import {
  type ProjectFormState,
  createProjectAction,
  updateProjectAction,
} from "./actions";
import styles from "../page.module.css";
import { projectStatuses, type ProjectStatus } from "@/db/schema";

type ProjectFormProject = {
  id: number;
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

const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

const initialState: ProjectFormState = {};

export function ProjectForm({ project }: { project?: ProjectFormProject }) {
  const action = project
    ? updateProjectAction.bind(null, project.id)
    : createProjectAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.error ? <p className={styles.formError}>{state.error}</p> : null}

      <label className={styles.field}>
        <span>Name</span>
        <input
          name="name"
          type="text"
          defaultValue={project?.name ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.name)}
        />
        {state.fieldErrors?.name ? (
          <small>{state.fieldErrors.name}</small>
        ) : null}
      </label>

      <label className={styles.field}>
        <span>Status</span>
        <select
          name="status"
          defaultValue={project?.status ?? "PLANNING"}
          aria-invalid={Boolean(state.fieldErrors?.status)}
        >
          {projectStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        {state.fieldErrors?.status ? (
          <small>{state.fieldErrors.status}</small>
        ) : null}
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Owner</span>
          <input name="owner" type="text" defaultValue={project?.owner ?? ""} />
        </label>

        <label className={styles.field}>
          <span>Customer</span>
          <input
            name="customer"
            type="text"
            defaultValue={project?.customer ?? ""}
          />
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Start date</span>
          <input
            name="startDate"
            type="date"
            defaultValue={project?.startDate ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.startDate)}
          />
          {state.fieldErrors?.startDate ? (
            <small>{state.fieldErrors.startDate}</small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>End date</span>
          <input
            name="endDate"
            type="date"
            defaultValue={project?.endDate ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.endDate)}
          />
          {state.fieldErrors?.endDate ? (
            <small>{state.fieldErrors.endDate}</small>
          ) : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={project?.description ?? ""}
        />
      </label>

      <label className={styles.field}>
        <span>Objective</span>
        <textarea
          name="objective"
          rows={3}
          defaultValue={project?.objective ?? ""}
        />
      </label>

      <label className={styles.field}>
        <span>Health note</span>
        <textarea
          name="healthNote"
          rows={3}
          defaultValue={project?.healthNote ?? ""}
        />
      </label>

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? "Saving..." : project ? "Save Project" : "Create Project"}
      </button>
    </form>
  );
}
