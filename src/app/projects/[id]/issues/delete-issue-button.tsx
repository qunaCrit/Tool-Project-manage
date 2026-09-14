"use client";

import { useTranslation } from "@/i18n";
import { deleteIssueAction } from "./actions";
import styles from "../../../page.module.css";

export function DeleteIssueButton({
  projectId,
  issueId,
  issueTitle,
}: {
  projectId: number;
  issueId: number;
  issueTitle: string;
}) {
  const { t } = useTranslation();

  return (
    <form
      action={deleteIssueAction}
      onSubmit={(event) => {
        if (!window.confirm(t("issues.deleteConfirm", { title: issueTitle }))) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="issueId" type="hidden" value={issueId} />
      <button className={styles.dangerButton} type="submit">
        {t("common.delete")}
      </button>
    </form>
  );
}
