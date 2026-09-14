"use client";

import { useActionState } from "react";

import {
  createMeetingActionItemAction,
  type MeetingActionItemFormState,
} from "./actions";
import styles from "../../../page.module.css";
import {
  priorities,
  workItemStatuses,
  type Priority,
  type WorkItemStatus,
} from "@/db/schema";

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const statusLabels: Record<WorkItemStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  BLOCKED: "Blocked",
};

const initialState: MeetingActionItemFormState = {};

export function MeetingActionItemForm({
  projectId,
  meetingId,
}: {
  projectId: number;
  meetingId: number;
}) {
  const action = createMeetingActionItemAction.bind(null, projectId, meetingId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.inlineForm}>
      {state.error ? <p className={styles.formError}>{state.error}</p> : null}

      <label className={styles.field}>
        <span>Title</span>
        <input
          name="title"
          type="text"
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state.fieldErrors?.title ? (
          <small>{state.fieldErrors.title}</small>
        ) : null}
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Owner</span>
          <input name="owner" type="text" />
        </label>

        <label className={styles.field}>
          <span>Due date</span>
          <input
            name="dueDate"
            type="date"
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          />
          {state.fieldErrors?.dueDate ? (
            <small>{state.fieldErrors.dueDate}</small>
          ) : null}
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Priority</span>
          <select
            name="priority"
            defaultValue="MEDIUM"
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
            defaultValue="TODO"
            aria-invalid={Boolean(state.fieldErrors?.status)}
          >
            {workItemStatuses.map((status) => (
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

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add Action Item"}
      </button>
    </form>
  );
}
