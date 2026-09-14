"use client";

import { useActionState } from "react";

import {
  createIssueAction,
  type IssueFormState,
  updateIssueAction,
} from "./actions";
import {
  issueStatuses,
  priorities,
  type IssueStatus,
  type Priority,
} from "@/db/schema";
import { EnumLabel, MessageText, T } from "@/i18n";
import styles from "../../../page.module.css";

type IssueFormIssue = {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  impact: string | null;
  owner: string | null;
  status: IssueStatus;
  resolution: string | null;
  dueDate: string | null;
  detectedAt: string | null;
};

const initialState: IssueFormState = {};

export function IssueForm({
  projectId,
  issue,
}: {
  projectId: number;
  issue?: IssueFormIssue;
}) {
  const action = issue
    ? updateIssueAction.bind(null, projectId, issue.id)
    : createIssueAction.bind(null, projectId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.error ? (
        <p className={styles.formError}><MessageText value={state.error} /></p>
      ) : null}

      <label className={styles.field}>
        <span><T k="common.title" /></span>
        <input
          name="title"
          type="text"
          defaultValue={issue?.title ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state.fieldErrors?.title ? (
          <small><MessageText value={state.fieldErrors.title} /></small>
        ) : null}
      </label>

      <label className={styles.field}>
        <span><T k="projects.description" /></span>
        <textarea
          name="description"
          rows={4}
          defaultValue={issue?.description ?? ""}
        />
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="common.priority" /></span>
          <select
            name="priority"
            defaultValue={issue?.priority ?? "MEDIUM"}
            aria-invalid={Boolean(state.fieldErrors?.priority)}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                <EnumLabel group="priority" value={priority} />
              </option>
            ))}
          </select>
          {state.fieldErrors?.priority ? (
            <small><MessageText value={state.fieldErrors.priority} /></small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span><T k="common.status" /></span>
          <select
            name="status"
            defaultValue={issue?.status ?? "OPEN"}
            aria-invalid={Boolean(state.fieldErrors?.status)}
          >
            {issueStatuses.map((status) => (
              <option key={status} value={status}>
                <EnumLabel group="issueStatus" value={status} />
              </option>
            ))}
          </select>
          {state.fieldErrors?.status ? (
            <small><MessageText value={state.fieldErrors.status} /></small>
          ) : null}
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="common.owner" /></span>
          <input name="owner" type="text" defaultValue={issue?.owner ?? ""} />
        </label>

        <label className={styles.field}>
          <span><T k="common.due" /></span>
          <input
            name="dueDate"
            type="date"
            defaultValue={issue?.dueDate ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          />
          {state.fieldErrors?.dueDate ? (
            <small><MessageText value={state.fieldErrors.dueDate} /></small>
          ) : null}
        </label>
      </div>

      <label className={styles.field}>
        <span><T k="issues.detectedAt" /></span>
        <input
          name="detectedAt"
          type="date"
          defaultValue={issue?.detectedAt ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.detectedAt)}
        />
        {state.fieldErrors?.detectedAt ? (
          <small><MessageText value={state.fieldErrors.detectedAt} /></small>
        ) : null}
      </label>

      <label className={styles.field}>
        <span><T k="issues.impact" /></span>
        <textarea name="impact" rows={3} defaultValue={issue?.impact ?? ""} />
      </label>

      <label className={styles.field}>
        <span><T k="issues.resolution" /></span>
        <textarea
          name="resolution"
          rows={4}
          defaultValue={issue?.resolution ?? ""}
        />
      </label>

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? (
          <T k="common.saving" />
        ) : issue ? (
          <T k="issues.save" />
        ) : (
          <T k="issues.create" />
        )}
      </button>
    </form>
  );
}
