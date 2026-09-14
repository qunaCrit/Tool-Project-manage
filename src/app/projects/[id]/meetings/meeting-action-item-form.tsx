"use client";

import { useActionState } from "react";

import {
  createMeetingActionItemAction,
  type MeetingActionItemFormState,
} from "./actions";
import { EnumLabel, MessageText, T } from "@/i18n";
import styles from "../../../page.module.css";
import {
  priorities,
  workItemStatuses,
} from "@/db/schema";

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
      {state.error ? (
        <p className={styles.formError}><MessageText value={state.error} /></p>
      ) : null}

      <label className={styles.field}>
        <span><T k="common.title" /></span>
        <input
          name="title"
          type="text"
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state.fieldErrors?.title ? (
          <small><MessageText value={state.fieldErrors.title} /></small>
        ) : null}
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="common.owner" /></span>
          <input name="owner" type="text" />
        </label>

        <label className={styles.field}>
          <span><T k="common.due" /></span>
          <input
            name="dueDate"
            type="date"
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          />
          {state.fieldErrors?.dueDate ? (
            <small><MessageText value={state.fieldErrors.dueDate} /></small>
          ) : null}
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="common.priority" /></span>
          <select
            name="priority"
            defaultValue="MEDIUM"
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
            defaultValue="TODO"
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

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? <T k="meetings.adding" /> : <T k="meetings.addActionItem" />}
      </button>
    </form>
  );
}
