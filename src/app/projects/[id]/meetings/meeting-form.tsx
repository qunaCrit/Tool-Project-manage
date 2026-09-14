"use client";

import { useActionState } from "react";

import {
  createMeetingAction,
  type MeetingFormState,
  updateMeetingAction,
} from "./actions";
import { MessageText, T } from "@/i18n";
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
      {state.error ? (
        <p className={styles.formError}><MessageText value={state.error} /></p>
      ) : null}

      <label className={styles.field}>
        <span><T k="common.title" /></span>
        <input
          name="title"
          type="text"
          defaultValue={meeting?.title ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state.fieldErrors?.title ? (
          <small><MessageText value={state.fieldErrors.title} /></small>
        ) : null}
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span><T k="meetings.meetingDate" /></span>
          <input
            name="meetingDate"
            type="datetime-local"
            defaultValue={
              meeting ? toDateTimeInputValue(meeting.meetingDate) : ""
            }
            aria-invalid={Boolean(state.fieldErrors?.meetingDate)}
          />
          {state.fieldErrors?.meetingDate ? (
            <small><MessageText value={state.fieldErrors.meetingDate} /></small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span><T k="meetings.participants" /></span>
          <input
            name="participants"
            type="text"
            defaultValue={meeting?.participants ?? ""}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span><T k="meetings.agenda" /></span>
        <textarea name="agenda" rows={5} defaultValue={meeting?.agenda ?? ""} />
      </label>

      <label className={styles.field}>
        <span><T k="meetings.notes" /></span>
        <textarea name="notes" rows={8} defaultValue={meeting?.notes ?? ""} />
      </label>

      <label className={styles.field}>
        <span><T k="common.summary" /></span>
        <textarea
          name="summary"
          rows={5}
          defaultValue={meeting?.summary ?? ""}
        />
      </label>

      <label className={styles.field}>
        <span><T k="meetings.decisions" /></span>
        <textarea
          name="decisions"
          rows={5}
          defaultValue={meeting?.decisions ?? ""}
        />
      </label>

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? (
          <T k="common.saving" />
        ) : meeting ? (
          <T k="meetings.save" />
        ) : (
          <T k="meetings.create" />
        )}
      </button>
    </form>
  );
}
