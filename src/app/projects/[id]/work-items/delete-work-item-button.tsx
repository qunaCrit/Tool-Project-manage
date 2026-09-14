"use client";

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
  return (
    <form
      action={deleteWorkItemAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete work item "${workItemTitle}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="workItemId" type="hidden" value={workItemId} />
      <button className={styles.dangerButton} type="submit">
        Delete
      </button>
    </form>
  );
}
