"use client";

import { useActionState } from "react";

import {
  createWeeklyReportAction,
  type WeeklyReportFormState,
  updateWeeklyReportAction,
} from "./actions";
import { reportStatuses, type ReportStatus } from "@/db/schema";
import styles from "../../../page.module.css";

type WeeklyReportFormReport = {
  id?: number;
  weekStart: string;
  weekEnd: string;
  overallStatus: ReportStatus;
  summary: string | null;
  completedWork: string | null;
  ongoingWork: string | null;
  upcomingWork: string | null;
  risks: string | null;
  issues: string | null;
  decisions: string | null;
  notes: string | null;
};

const statusLabels: Record<ReportStatus, string> = {
  GREEN: "Green",
  YELLOW: "Yellow",
  RED: "Red",
};

const initialState: WeeklyReportFormState = {};

const buildCopyText = (report: WeeklyReportFormReport) => [
  `Weekly Report: ${report.weekStart} to ${report.weekEnd}`,
  `Overall Status: ${statusLabels[report.overallStatus]}`,
  "",
  "Summary",
  report.summary || "-",
  "",
  "Completed Work",
  report.completedWork || "-",
  "",
  "Ongoing Work",
  report.ongoingWork || "-",
  "",
  "Upcoming Work",
  report.upcomingWork || "-",
  "",
  "Risks",
  report.risks || "-",
  "",
  "Issues",
  report.issues || "-",
  "",
  "Decisions",
  report.decisions || "-",
  "",
  "Notes / Support Needed",
  report.notes || "-",
].join("\n");

export function WeeklyReportForm({
  projectId,
  report,
}: {
  projectId: number;
  report: WeeklyReportFormReport;
}) {
  const action = report.id
    ? updateWeeklyReportAction.bind(null, projectId, report.id)
    : createWeeklyReportAction.bind(null, projectId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const copyText = buildCopyText(report);

  return (
    <div className={styles.reportLayout}>
      <form action={formAction} className={styles.form}>
        {state.error ? <p className={styles.formError}>{state.error}</p> : null}

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Week start</span>
            <input
              name="weekStart"
              type="date"
              defaultValue={report.weekStart}
              aria-invalid={Boolean(state.fieldErrors?.weekStart)}
            />
            {state.fieldErrors?.weekStart ? (
              <small>{state.fieldErrors.weekStart}</small>
            ) : null}
          </label>

          <label className={styles.field}>
            <span>Week end</span>
            <input
              name="weekEnd"
              type="date"
              defaultValue={report.weekEnd}
              aria-invalid={Boolean(state.fieldErrors?.weekEnd)}
            />
            {state.fieldErrors?.weekEnd ? (
              <small>{state.fieldErrors.weekEnd}</small>
            ) : null}
          </label>
        </div>

        <label className={styles.field}>
          <span>Overall status</span>
          <select
            name="overallStatus"
            defaultValue={report.overallStatus}
            aria-invalid={Boolean(state.fieldErrors?.overallStatus)}
          >
            {reportStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          {state.fieldErrors?.overallStatus ? (
            <small>{state.fieldErrors.overallStatus}</small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Summary</span>
          <textarea name="summary" rows={4} defaultValue={report.summary ?? ""} />
        </label>

        <label className={styles.field}>
          <span>Completed Work</span>
          <textarea
            name="completedWork"
            rows={5}
            defaultValue={report.completedWork ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span>Ongoing Work</span>
          <textarea
            name="ongoingWork"
            rows={5}
            defaultValue={report.ongoingWork ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span>Upcoming Work</span>
          <textarea
            name="upcomingWork"
            rows={5}
            defaultValue={report.upcomingWork ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span>Risks</span>
          <textarea name="risks" rows={5} defaultValue={report.risks ?? ""} />
        </label>

        <label className={styles.field}>
          <span>Issues</span>
          <textarea name="issues" rows={5} defaultValue={report.issues ?? ""} />
        </label>

        <label className={styles.field}>
          <span>Decisions</span>
          <textarea
            name="decisions"
            rows={5}
            defaultValue={report.decisions ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span>Notes / Support Needed</span>
          <textarea name="notes" rows={5} defaultValue={report.notes ?? ""} />
        </label>

        <button className={styles.primaryButton} type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : report.id
              ? "Save Report"
              : "Save Snapshot"}
        </button>
      </form>

      <section className={styles.copyPanel}>
        <div className={styles.panelHeader}>
          <h3>Copyable Output</h3>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => navigator.clipboard.writeText(copyText)}
          >
            Copy Report
          </button>
        </div>
        <pre>{copyText}</pre>
      </section>
    </div>
  );
}
