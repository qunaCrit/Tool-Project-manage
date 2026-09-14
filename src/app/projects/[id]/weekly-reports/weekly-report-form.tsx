"use client";

import { useActionState } from "react";

import {
  createWeeklyReportAction,
  type WeeklyReportFormState,
  updateWeeklyReportAction,
} from "./actions";
import { reportStatuses, type ReportStatus } from "@/db/schema";
import {
  EnumLabel,
  MessageText,
  T,
  type TranslationKey,
  useTranslation,
} from "@/i18n";
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

const initialState: WeeklyReportFormState = {};

const buildCopyText = (
  report: WeeklyReportFormReport,
  t: (key: TranslationKey, values?: Record<string, string | number>) => string,
) => [
  t("weeklyReports.copyHeading", {
    start: report.weekStart,
    end: report.weekEnd,
  }),
  t("weeklyReports.copyOverallStatus", {
    status: t(`enum.reportStatus.${report.overallStatus}` as TranslationKey),
  }),
  "",
  t("common.summary"),
  report.summary || "-",
  "",
  t("weeklyReports.completedWork"),
  report.completedWork || "-",
  "",
  t("weeklyReports.ongoingWork"),
  report.ongoingWork || "-",
  "",
  t("weeklyReports.upcomingWork"),
  report.upcomingWork || "-",
  "",
  t("nav.risks"),
  report.risks || "-",
  "",
  t("nav.issues"),
  report.issues || "-",
  "",
  t("meetings.decisions"),
  report.decisions || "-",
  "",
  t("weeklyReports.notesSupport"),
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
  const { t } = useTranslation();
  const copyText = buildCopyText(report, t);
  const copyCurrentReport = () => {
    const form = document.getElementById("weekly-report-form");

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const formData = new FormData(form);
    const currentReport: WeeklyReportFormReport = {
      weekStart: String(formData.get("weekStart") ?? ""),
      weekEnd: String(formData.get("weekEnd") ?? ""),
      overallStatus: String(
        formData.get("overallStatus") ?? "GREEN",
      ) as ReportStatus,
      summary: String(formData.get("summary") ?? ""),
      completedWork: String(formData.get("completedWork") ?? ""),
      ongoingWork: String(formData.get("ongoingWork") ?? ""),
      upcomingWork: String(formData.get("upcomingWork") ?? ""),
      risks: String(formData.get("risks") ?? ""),
      issues: String(formData.get("issues") ?? ""),
      decisions: String(formData.get("decisions") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    };

    navigator.clipboard.writeText(buildCopyText(currentReport, t));
  };

  return (
    <div className={styles.reportLayout}>
      <form action={formAction} className={styles.form} id="weekly-report-form">
        {state.error ? (
          <p className={styles.formError}><MessageText value={state.error} /></p>
        ) : null}

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="weeklyReports.weekStart" /></span>
            <input
              name="weekStart"
              type="date"
              defaultValue={report.weekStart}
              aria-invalid={Boolean(state.fieldErrors?.weekStart)}
            />
            {state.fieldErrors?.weekStart ? (
              <small><MessageText value={state.fieldErrors.weekStart} /></small>
            ) : null}
          </label>

          <label className={styles.field}>
            <span><T k="weeklyReports.weekEnd" /></span>
            <input
              name="weekEnd"
              type="date"
              defaultValue={report.weekEnd}
              aria-invalid={Boolean(state.fieldErrors?.weekEnd)}
            />
            {state.fieldErrors?.weekEnd ? (
              <small><MessageText value={state.fieldErrors.weekEnd} /></small>
            ) : null}
          </label>
        </div>

        <label className={styles.field}>
          <span><T k="weeklyReports.overallStatus" /></span>
          <select
            name="overallStatus"
            defaultValue={report.overallStatus}
            aria-invalid={Boolean(state.fieldErrors?.overallStatus)}
          >
            {reportStatuses.map((status) => (
              <option key={status} value={status}>
                <EnumLabel group="reportStatus" value={status} />
              </option>
            ))}
          </select>
          {state.fieldErrors?.overallStatus ? (
            <small><MessageText value={state.fieldErrors.overallStatus} /></small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span><T k="common.summary" /></span>
          <textarea name="summary" rows={4} defaultValue={report.summary ?? ""} />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.completedWork" /></span>
          <textarea
            name="completedWork"
            rows={5}
            defaultValue={report.completedWork ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.ongoingWork" /></span>
          <textarea
            name="ongoingWork"
            rows={5}
            defaultValue={report.ongoingWork ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.upcomingWork" /></span>
          <textarea
            name="upcomingWork"
            rows={5}
            defaultValue={report.upcomingWork ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="nav.risks" /></span>
          <textarea name="risks" rows={5} defaultValue={report.risks ?? ""} />
        </label>

        <label className={styles.field}>
          <span><T k="nav.issues" /></span>
          <textarea name="issues" rows={5} defaultValue={report.issues ?? ""} />
        </label>

        <label className={styles.field}>
          <span><T k="meetings.decisions" /></span>
          <textarea
            name="decisions"
            rows={5}
            defaultValue={report.decisions ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.notesSupport" /></span>
          <textarea name="notes" rows={5} defaultValue={report.notes ?? ""} />
        </label>

        <button className={styles.primaryButton} type="submit" disabled={isPending}>
          {isPending
            ? <T k="common.saving" />
            : report.id
              ? <T k="weeklyReports.saveReport" />
              : <T k="weeklyReports.saveSnapshot" />}
        </button>
      </form>

      <section className={styles.copyPanel}>
        <div className={styles.panelHeader}>
          <h3><T k="weeklyReports.copyableOutput" /></h3>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={copyCurrentReport}
          >
            <T k="weeklyReports.copyReport" />
          </button>
        </div>
        <pre>{copyText}</pre>
      </section>
    </div>
  );
}
