"use client";

import { useActionState } from "react";

import {
  type WorkItemFormState,
  createWorkItemAction,
  updateWorkItemAction,
} from "./actions";
import { EnumLabel, MessageText, T } from "@/i18n";
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
      {state.error ? (
        <p className={styles.formError}><MessageText value={state.error} /></p>
      ) : null}

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="common.type" /></span>
          <select
            name="type"
            defaultValue={workItem?.type ?? "TASK"}
            aria-invalid={Boolean(state.fieldErrors?.type)}
          >
            {workItemTypes.map((type) => (
              <option key={type} value={type}>
                <EnumLabel group="workItemType" value={type} />
              </option>
            ))}
          </select>
          {state.fieldErrors?.type ? (
            <small><MessageText value={state.fieldErrors.type} /></small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span><T k="common.status" /></span>
          <select
            name="status"
            defaultValue={workItem?.status ?? "TODO"}
            aria-invalid={Boolean(state.fieldErrors?.status)}
          >
            {workItemStatuses.map((status) => (
              <option key={status} value={status}>
                <EnumLabel group="workItemStatus" value={status} />
              </option>
            ))}
          </select>
          {state.fieldErrors?.status ? (
            <small><MessageText value={state.fieldErrors.status} /></small>
          ) : null}
        </label>
      </div>

      <label className={styles.field}>
        <span><T k="common.title" /></span>
        <input
          name="title"
          type="text"
          defaultValue={workItem?.title ?? ""}
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
          defaultValue={workItem?.description ?? ""}
        />
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="common.priority" /></span>
          <select
            name="priority"
            defaultValue={workItem?.priority ?? "MEDIUM"}
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
          <span><T k="common.due" /></span>
          <input
            name="dueDate"
            type="date"
            defaultValue={workItem?.dueDate ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          />
          {state.fieldErrors?.dueDate ? (
            <small><MessageText value={state.fieldErrors.dueDate} /></small>
          ) : null}
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="common.owner" /></span>
          <input name="owner" type="text" defaultValue={workItem?.owner ?? ""} />
        </label>

        <label className={styles.field}>
          <span><T k="workItems.source" /></span>
          <input
            name="source"
            type="text"
            defaultValue={workItem?.source ?? ""}
          />
        </label>
      </div>

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? (
          <T k="common.saving" />
        ) : workItem ? (
          <T k="workItems.save" />
        ) : (
          <T k="workItems.create" />
        )}
      </button>
    </form>
  );
}
