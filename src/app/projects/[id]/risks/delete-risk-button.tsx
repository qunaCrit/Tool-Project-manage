"use client";

import { useTranslation } from "@/i18n";
import { deleteRiskAction } from "./actions";
import styles from "../../../page.module.css";

export function DeleteRiskButton({
  projectId,
  riskId,
  riskTitle,
}: {
  projectId: number;
  riskId: number;
  riskTitle: string;
}) {
  const { t } = useTranslation();

  return (
    <form
      action={deleteRiskAction}
      onSubmit={(event) => {
        if (!window.confirm(t("risks.deleteConfirm", { title: riskTitle }))) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="riskId" type="hidden" value={riskId} />
      <button className={styles.dangerButton} type="submit">
        {t("common.delete")}
      </button>
    </form>
  );
}
