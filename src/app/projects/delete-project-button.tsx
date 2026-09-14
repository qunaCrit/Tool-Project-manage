"use client";

import { deleteProjectAction } from "./actions";
import styles from "../page.module.css";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: number;
  projectName: string;
}) {
  return (
    <form
      action={deleteProjectAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete project "${projectName}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <button className={styles.dangerButton} type="submit">
        Delete
      </button>
    </form>
  );
}
