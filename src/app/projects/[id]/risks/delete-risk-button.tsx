"use client";

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
  return (
    <form
      action={deleteRiskAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete risk "${riskTitle}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="riskId" type="hidden" value={riskId} />
      <button className={styles.dangerButton} type="submit">
        Delete
      </button>
    </form>
  );
}
