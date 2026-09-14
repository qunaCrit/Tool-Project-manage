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

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const statusLabels: Record<IssueStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
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
      {state.error ? <p className={styles.formError}>{state.error}</p> : null}

      <label className={styles.field}>
        <span>Title</span>
        <input
          name="title"
          type="text"
          defaultValue={issue?.title ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state.fieldErrors?.title ? (
          <small>{state.fieldErrors.title}</small>
        ) : null}
      </label>

      <label className={styles.field}>
        <span>Description</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={issue?.description ?? ""}
        />
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Priority</span>
          <select
            name="priority"
            defaultValue={issue?.priority ?? "MEDIUM"}
            aria-invalid={Boolean(state.fieldErrors?.priority)}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>
          {state.fieldErrors?.priority ? (
            <small>{state.fieldErrors.priority}</small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Status</span>
          <select
            name="status"
            defaultValue={issue?.status ?? "OPEN"}
            aria-invalid={Boolean(state.fieldErrors?.status)}
          >
            {issueStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          {state.fieldErrors?.status ? (
            <small>{state.fieldErrors.status}</small>
          ) : null}
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Owner</span>
          <input name="owner" type="text" defaultValue={issue?.owner ?? ""} />
        </label>

        <label className={styles.field}>
          <span>Due date</span>
          <input
            name="dueDate"
            type="date"
            defaultValue={issue?.dueDate ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          />
          {state.fieldErrors?.dueDate ? (
            <small>{state.fieldErrors.dueDate}</small>
          ) : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Detected at</span>
        <input
          name="detectedAt"
          type="date"
          defaultValue={issue?.detectedAt ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.detectedAt)}
        />
        {state.fieldErrors?.detectedAt ? (
          <small>{state.fieldErrors.detectedAt}</small>
        ) : null}
      </label>

      <label className={styles.field}>
        <span>Impact</span>
        <textarea name="impact" rows={3} defaultValue={issue?.impact ?? ""} />
      </label>

      <label className={styles.field}>
        <span>Resolution</span>
        <textarea
          name="resolution"
          rows={4}
          defaultValue={issue?.resolution ?? ""}
        />
      </label>

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? "Saving..." : issue ? "Save Issue" : "Create Issue"}
      </button>
    </form>
  );
}
