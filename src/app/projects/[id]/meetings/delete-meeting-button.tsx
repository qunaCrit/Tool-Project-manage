"use client";

import { deleteMeetingAction } from "./actions";
import styles from "../../../page.module.css";

export function DeleteMeetingButton({
  projectId,
  meetingId,
  meetingTitle,
}: {
  projectId: number;
  meetingId: number;
  meetingTitle: string;
}) {
  return (
    <form
      action={deleteMeetingAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete meeting "${meetingTitle}"? Linked work items will be kept.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="meetingId" type="hidden" value={meetingId} />
      <button className={styles.dangerButton} type="submit">
        Delete
      </button>
    </form>
  );
}
