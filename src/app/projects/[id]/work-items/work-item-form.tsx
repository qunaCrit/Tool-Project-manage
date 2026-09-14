"use client";

import { useActionState } from "react";

import {
  type WorkItemFormState,
  createWorkItemAction,
  updateWorkItemAction,
} from "./actions";
import styles from "../../../page.module.css";
import {
  priorities,
  workItemStatuses,
  workItemTypes,
  type Priority,
  type WorkItemStatus,
  type WorkItemType,
} from "@/db/schema";

type WorkItemFormItem = {
  id: number;
  type: WorkItemType;
  title: string;
  description: string | null;
  status: WorkItemStatus;
  priority: Priority;
  owner: string | null;
  dueDate: string | null;
  source: string | null;
};

const typeLabels: Record<WorkItemType, string> = {
  TASK: "Task",
  ACTION_ITEM: "Action Item",
};

const statusLabels: Record<WorkItemStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  BLOCKED: "Blocked",
};

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const initialState: WorkItemFormState = {};

export function WorkItemForm({
  projectId,
  workItem,
}: {
  projectId: number;
  workItem?: WorkItemFormItem;
}) {
  const action = workItem
    ? updateWorkItemAction.bind(null, projectId, workItem.id)
    : createWorkItemAction.bind(null, projectId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.error ? <p className={styles.formError}>{state.error}</p> : null}

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Type</span>
          <select
            name="type"
            defaultValue={workItem?.type ?? "TASK"}
            aria-invalid={Boolean(state.fieldErrors?.type)}
          >
            {workItemTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type]}
              </option>
            ))}
          </select>
          {state.fieldErrors?.type ? (
            <small>{state.fieldErrors.type}</small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Status</span>
          <select
            name="status"
            defaultValue={workItem?.status ?? "TODO"}
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

      <label className={styles.field}>
        <span>Title</span>
        <input
          name="title"
          type="text"
          defaultValue={workItem?.title ?? ""}
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
          defaultValue={workItem?.description ?? ""}
        />
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Priority</span>
          <select
            name="priority"
            defaultValue={workItem?.priority ?? "MEDIUM"}
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
          <span>Due date</span>
          <input
            name="dueDate"
            type="date"
            defaultValue={workItem?.dueDate ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          />
          {state.fieldErrors?.dueDate ? (
            <small>{state.fieldErrors.dueDate}</small>
          ) : null}
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Owner</span>
          <input name="owner" type="text" defaultValue={workItem?.owner ?? ""} />
        </label>

        <label className={styles.field}>
          <span>Source</span>
          <input
            name="source"
            type="text"
            defaultValue={workItem?.source ?? ""}
          />
        </label>
      </div>

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending
          ? "Saving..."
          : workItem
            ? "Save Work Item"
            : "Create Work Item"}
      </button>
    </form>
  );
}
