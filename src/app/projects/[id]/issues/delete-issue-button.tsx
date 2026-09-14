"use client";

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
  return (
    <form
      action={deleteIssueAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete issue "${issueTitle}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="issueId" type="hidden" value={issueId} />
      <button className={styles.dangerButton} type="submit">
        Delete
      </button>
    </form>
  );
}
