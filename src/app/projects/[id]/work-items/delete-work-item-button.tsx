"use client";

import { useTranslation } from "@/i18n";
import { deleteWorkItemAction } from "./actions";
import styles from "../../../page.module.css";

export function DeleteWorkItemButton({
  projectId,
  workItemId,
  workItemTitle,
}: {
  projectId: number;
  workItemId: number;
  workItemTitle: string;
}) {
  const { t } = useTranslation();

  return (
    <form
      action={deleteWorkItemAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            t("workItems.deleteConfirm", { title: workItemTitle }),
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="workItemId" type="hidden" value={workItemId} />
      <button className={styles.dangerButton} type="submit">
        {t("common.delete")}
      </button>
    </form>
  );
}
