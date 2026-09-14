"use client";

import { useTranslation } from "@/i18n";
import { deleteDailyReportAction } from "./actions";
import styles from "../../../page.module.css";

export function DeleteDailyReportButton({
  projectId,
  reportId,
  task,
}: {
  projectId: number;
  reportId: number;
  task: string;
}) {
  const { t } = useTranslation();

  return (
    <form
      action={deleteDailyReportAction}
      onSubmit={(event) => {
        if (!window.confirm(t("dailyReports.deleteConfirm", { task }))) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="reportId" type="hidden" value={reportId} />
      <button className={styles.dangerButton} type="submit">
        {t("common.delete")}
      </button>
    </form>
  );
}
