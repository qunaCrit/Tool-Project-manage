"use client";

import { useActionState } from "react";

import {
  createMeetingAction,
  type MeetingFormState,
  updateMeetingAction,
} from "./actions";
import styles from "../../../page.module.css";

type MeetingFormItem = {
  id: number;
  title: string;
  meetingDate: Date;
  participants: string | null;
  agenda: string | null;
  notes: string | null;
  summary: string | null;
  decisions: string | null;
};

const initialState: MeetingFormState = {};

const toDateTimeInputValue = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

export function MeetingForm({
  projectId,
  meeting,
}: {
  projectId: number;
  meeting?: MeetingFormItem;
}) {
  const action = meeting
    ? updateMeetingAction.bind(null, projectId, meeting.id)
    : createMeetingAction.bind(null, projectId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.error ? <p className={styles.formError}>{state.error}</p> : null}

      <label className={styles.field}>
        <span>Title</span>
        <input
          name="title"
          type="text"
          defaultValue={meeting?.title ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state.fieldErrors?.title ? (
          <small>{state.fieldErrors.title}</small>
        ) : null}
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Meeting date</span>
          <input
            name="meetingDate"
            type="datetime-local"
            defaultValue={
              meeting ? toDateTimeInputValue(meeting.meetingDate) : ""
            }
            aria-invalid={Boolean(state.fieldErrors?.meetingDate)}
          />
          {state.fieldErrors?.meetingDate ? (
            <small>{state.fieldErrors.meetingDate}</small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Participants</span>
          <input
            name="participants"
            type="text"
            defaultValue={meeting?.participants ?? ""}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>Agenda</span>
        <textarea name="agenda" rows={5} defaultValue={meeting?.agenda ?? ""} />
      </label>

      <label className={styles.field}>
        <span>Notes</span>
        <textarea name="notes" rows={8} defaultValue={meeting?.notes ?? ""} />
      </label>

      <label className={styles.field}>
        <span>Summary</span>
        <textarea
          name="summary"
          rows={5}
          defaultValue={meeting?.summary ?? ""}
        />
      </label>

      <label className={styles.field}>
        <span>Decisions</span>
        <textarea
          name="decisions"
          rows={5}
          defaultValue={meeting?.decisions ?? ""}
        />
      </label>

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? "Saving..." : meeting ? "Save Meeting" : "Create Meeting"}
      </button>
    </form>
  );
}
