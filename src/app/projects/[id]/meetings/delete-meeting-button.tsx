"use client";

import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation();

  return (
    <form
      action={deleteMeetingAction}
      onSubmit={(event) => {
        if (
          !window.confirm(t("meetings.deleteConfirm", { title: meetingTitle }))
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="meetingId" type="hidden" value={meetingId} />
      <button className={styles.dangerButton} type="submit">
        {t("common.delete")}
      </button>
    </form>
  );
}
