"use client";

import { useActionState } from "react";

import {
  type ProjectFormState,
  createProjectAction,
  updateProjectAction,
} from "./actions";
import { EnumLabel, MessageText, T } from "@/i18n";
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

const initialState: ProjectFormState = {};

export function ProjectForm({ project }: { project?: ProjectFormProject }) {
  const action = project
    ? updateProjectAction.bind(null, project.id)
    : createProjectAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.error ? (
        <p className={styles.formError}><MessageText value={state.error} /></p>
      ) : null}

      <label className={styles.field}>
        <span><T k="common.name" /></span>
        <input
          name="name"
          type="text"
          defaultValue={project?.name ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.name)}
        />
        {state.fieldErrors?.name ? (
          <small><MessageText value={state.fieldErrors.name} /></small>
        ) : null}
      </label>

      <label className={styles.field}>
        <span><T k="common.status" /></span>
        <select
          name="status"
          defaultValue={project?.status ?? "PLANNING"}
          aria-invalid={Boolean(state.fieldErrors?.status)}
        >
          {projectStatuses.map((status) => (
            <option key={status} value={status}>
              <EnumLabel group="projectStatus" value={status} />
            </option>
          ))}
        </select>
        {state.fieldErrors?.status ? (
          <small><MessageText value={state.fieldErrors.status} /></small>
        ) : null}
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="common.owner" /></span>
          <input name="owner" type="text" defaultValue={project?.owner ?? ""} />
        </label>

        <label className={styles.field}>
          <span><T k="projects.customer" /></span>
          <input
            name="customer"
            type="text"
            defaultValue={project?.customer ?? ""}
          />
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="projects.startDate" /></span>
          <input
            name="startDate"
            type="date"
            defaultValue={project?.startDate ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.startDate)}
          />
          {state.fieldErrors?.startDate ? (
            <small><MessageText value={state.fieldErrors.startDate} /></small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span><T k="projects.endDate" /></span>
          <input
            name="endDate"
            type="date"
            defaultValue={project?.endDate ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.endDate)}
          />
          {state.fieldErrors?.endDate ? (
            <small><MessageText value={state.fieldErrors.endDate} /></small>
          ) : null}
        </label>
      </div>

      <label className={styles.field}>
        <span><T k="projects.description" /></span>
        <textarea
          name="description"
          rows={3}
          defaultValue={project?.description ?? ""}
        />
      </label>

      <label className={styles.field}>
        <span><T k="projects.objective" /></span>
        <textarea
          name="objective"
          rows={3}
          defaultValue={project?.objective ?? ""}
        />
      </label>

      <label className={styles.field}>
        <span><T k="projects.healthNote" /></span>
        <textarea
          name="healthNote"
          rows={3}
          defaultValue={project?.healthNote ?? ""}
        />
      </label>

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? (
          <T k="common.saving" />
        ) : project ? (
          <T k="projects.save" />
        ) : (
          <T k="projects.create" />
        )}
      </button>
    </form>
  );
}
