"use client";

import { useTranslation } from "@/i18n";
import { deleteProjectAction } from "./actions";
import styles from "../page.module.css";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: number;
  projectName: string;
}) {
  const { t } = useTranslation();

  return (
    <form
      action={deleteProjectAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            t("projects.deleteConfirm", { name: projectName }),
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <button className={styles.dangerButton} type="submit">
        {t("common.delete")}
      </button>
    </form>
  );
}
