"use client";

import { useActionState } from "react";

import {
  createWeeklyReportAction,
  type WeeklyReportFormState,
  updateWeeklyReportAction,
} from "./actions";
import {
  reportStatuses,
  reportTrends,
  type ReportStatus,
  type ReportTrend,
} from "@/db/schema";
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
  week: string | null;
  projectName: string | null;
  weekStart: string;
  weekEnd: string;
  overallStatus: ReportStatus;
  progressPercent: number | null;
  keyAchievements: string | null;
  plannedNotDone: string | null;
  issuesBlockers: string | null;
  decisionsNeeded: string | null;
  nextWeekPlan: string | null;
  owner: string | null;
  dueTarget: string | null;
  managementNote: string | null;
  trend: ReportTrend | null;
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
  `${t("weeklyReports.week")}: ${report.week || "-"}`,
  `${t("weeklyReports.project")}: ${report.projectName || "-"}`,
  `${t("weeklyReports.from")}: ${report.weekStart}`,
  `${t("weeklyReports.to")}: ${report.weekEnd}`,
  t("weeklyReports.copyOverallStatus", {
    status: t(`enum.reportStatus.${report.overallStatus}` as TranslationKey),
  }),
  `${t("weeklyReports.progressPercent")}: ${
    report.progressPercent ?? "-"
  }`,
  `${t("weeklyReports.trend")}: ${
    report.trend ? t(`enum.reportTrend.${report.trend}` as TranslationKey) : "-"
  }`,
  "",
  t("weeklyReports.overview"),
  report.summary || "-",
  "",
  t("weeklyReports.keyAchievements"),
  report.keyAchievements || report.completedWork || "-",
  "",
  t("weeklyReports.plannedNotDone"),
  report.plannedNotDone || report.ongoingWork || "-",
  "",
  t("weeklyReports.issuesBlockers"),
  report.issuesBlockers || report.issues || "-",
  "",
  t("weeklyReports.risks"),
  report.risks || "-",
  "",
  t("weeklyReports.decisionsNeeded"),
  report.decisionsNeeded || report.decisions || "-",
  "",
  t("weeklyReports.nextWeekPlan"),
  report.nextWeekPlan || report.upcomingWork || "-",
  "",
  `${t("weeklyReports.owner")}: ${report.owner || "-"}`,
  `${t("weeklyReports.dueTarget")}: ${report.dueTarget || "-"}`,
  "",
  t("weeklyReports.managementNote"),
  report.managementNote || report.notes || "-",
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
      week: String(formData.get("week") ?? ""),
      projectName: String(formData.get("projectName") ?? ""),
      weekStart: String(formData.get("weekStart") ?? ""),
      weekEnd: String(formData.get("weekEnd") ?? ""),
      overallStatus: String(
        formData.get("overallStatus") ?? "GREEN",
      ) as ReportStatus,
      progressPercent:
        String(formData.get("progressPercent") ?? "").trim() === ""
          ? null
          : Number(formData.get("progressPercent")),
      keyAchievements: String(formData.get("keyAchievements") ?? ""),
      plannedNotDone: String(formData.get("plannedNotDone") ?? ""),
      issuesBlockers: String(formData.get("issuesBlockers") ?? ""),
      decisionsNeeded: String(formData.get("decisionsNeeded") ?? ""),
      nextWeekPlan: String(formData.get("nextWeekPlan") ?? ""),
      owner: String(formData.get("owner") ?? ""),
      dueTarget: String(formData.get("dueTarget") ?? ""),
      managementNote: String(formData.get("managementNote") ?? ""),
      trend:
        String(formData.get("trend") ?? "").trim() === ""
          ? null
          : (String(formData.get("trend")) as ReportTrend),
      summary: String(formData.get("summary") ?? ""),
      completedWork: String(formData.get("keyAchievements") ?? ""),
      ongoingWork: String(formData.get("plannedNotDone") ?? ""),
      upcomingWork: String(formData.get("nextWeekPlan") ?? ""),
      risks: String(formData.get("risks") ?? ""),
      issues: String(formData.get("issuesBlockers") ?? ""),
      decisions: String(formData.get("decisionsNeeded") ?? ""),
      notes: String(formData.get("managementNote") ?? ""),
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
            <span><T k="weeklyReports.week" /></span>
            <input name="week" type="text" defaultValue={report.week ?? ""} />
          </label>

          <label className={styles.field}>
            <span><T k="weeklyReports.project" /></span>
            <input
              name="projectName"
              type="text"
              defaultValue={report.projectName ?? ""}
            />
          </label>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="weeklyReports.from" /></span>
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
            <span><T k="weeklyReports.to" /></span>
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

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="weeklyReports.overview" /></span>
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
            <span><T k="weeklyReports.progressPercent" /></span>
            <input
              name="progressPercent"
              type="number"
              min="0"
              max="100"
              defaultValue={report.progressPercent ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.progressPercent)}
            />
            {state.fieldErrors?.progressPercent ? (
              <small><MessageText value={state.fieldErrors.progressPercent} /></small>
            ) : null}
          </label>
        </div>

        <label className={styles.field}>
          <span><T k="weeklyReports.overviewText" /></span>
          <textarea name="summary" rows={4} defaultValue={report.summary ?? ""} />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.keyAchievements" /></span>
          <textarea
            name="keyAchievements"
            rows={5}
            defaultValue={report.keyAchievements ?? report.completedWork ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.plannedNotDone" /></span>
          <textarea
            name="plannedNotDone"
            rows={5}
            defaultValue={report.plannedNotDone ?? report.ongoingWork ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.issuesBlockers" /></span>
          <textarea
            name="issuesBlockers"
            rows={5}
            defaultValue={report.issuesBlockers ?? report.issues ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.risks" /></span>
          <textarea name="risks" rows={5} defaultValue={report.risks ?? ""} />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.decisionsNeeded" /></span>
          <textarea
            name="decisionsNeeded"
            rows={5}
            defaultValue={report.decisionsNeeded ?? report.decisions ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="weeklyReports.nextWeekPlan" /></span>
          <textarea
            name="nextWeekPlan"
            rows={5}
            defaultValue={report.nextWeekPlan ?? report.upcomingWork ?? ""}
          />
        </label>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="weeklyReports.owner" /></span>
            <input name="owner" type="text" defaultValue={report.owner ?? ""} />
          </label>

          <label className={styles.field}>
            <span><T k="weeklyReports.dueTarget" /></span>
            <input
              name="dueTarget"
              type="text"
              defaultValue={report.dueTarget ?? ""}
            />
          </label>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="weeklyReports.trend" /></span>
            <select name="trend" defaultValue={report.trend ?? "STABLE"}>
              {reportTrends.map((trend) => (
                <option key={trend} value={trend}>
                  <EnumLabel group="reportTrend" value={trend} />
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span><T k="weeklyReports.managementNote" /></span>
          <textarea
            name="managementNote"
            rows={5}
            defaultValue={report.managementNote ?? report.notes ?? ""}
          />
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
