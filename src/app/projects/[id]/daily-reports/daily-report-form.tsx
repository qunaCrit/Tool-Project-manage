"use client";

import { useActionState } from "react";

import {
  createDailyReportAction,
  type DailyReportFormState,
  updateDailyReportAction,
} from "./actions";
import {
  priorities,
  reportStatuses,
  workItemStatuses,
  type Priority,
  type ReportStatus,
  type WorkItemStatus,
} from "@/db/schema";
import {
  EnumLabel,
  MessageText,
  T,
  type TranslationKey,
  useTranslation,
} from "@/i18n";
import styles from "../../../page.module.css";

type DailyReportFormReport = {
  id?: number;
  reportDate: string;
  projectName: string | null;
  workstream: string | null;
  taskId: string | null;
  task: string;
  owner: string | null;
  planToday: string | null;
  actualResult: string | null;
  completePercent: number | null;
  status: WorkItemStatus;
  priority: Priority;
  blockerIssue: string | null;
  risk: string | null;
  supportNeeded: string | null;
  nextAction: string | null;
  dueDate: string | null;
  health: ReportStatus;
};

const initialState: DailyReportFormState = {};

const buildCopyText = (
  report: DailyReportFormReport,
  t: (key: TranslationKey, values?: Record<string, string | number>) => string,
) => [
  t("dailyReports.copyHeading", { date: report.reportDate }),
  `${t("dailyReports.project")}: ${report.projectName || "-"}`,
  `${t("dailyReports.workstream")}: ${report.workstream || "-"}`,
  `${t("dailyReports.taskId")}: ${report.taskId || "-"}`,
  `${t("dailyReports.task")}: ${report.task || "-"}`,
  `${t("dailyReports.owner")}: ${report.owner || "-"}`,
  `${t("dailyReports.completePercent")}: ${report.completePercent ?? "-"}`,
  `${t("dailyReports.status")}: ${t(
    `enum.workItemStatus.${report.status}` as TranslationKey,
  )}`,
  `${t("dailyReports.priority")}: ${t(
    `enum.priority.${report.priority}` as TranslationKey,
  )}`,
  `${t("dailyReports.health")}: ${t(
    `enum.reportStatus.${report.health}` as TranslationKey,
  )}`,
  `${t("dailyReports.dueDate")}: ${report.dueDate || "-"}`,
  "",
  t("dailyReports.planToday"),
  report.planToday || "-",
  "",
  t("dailyReports.actualResult"),
  report.actualResult || "-",
  "",
  t("dailyReports.blockerIssue"),
  report.blockerIssue || "-",
  "",
  t("dailyReports.risk"),
  report.risk || "-",
  "",
  t("dailyReports.supportNeeded"),
  report.supportNeeded || "-",
  "",
  t("dailyReports.nextAction"),
  report.nextAction || "-",
].join("\n");

export function DailyReportForm({
  projectId,
  report,
}: {
  projectId: number;
  report: DailyReportFormReport;
}) {
  const action = report.id
    ? updateDailyReportAction.bind(null, projectId, report.id)
    : createDailyReportAction.bind(null, projectId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { t } = useTranslation();
  const copyText = buildCopyText(report, t);

  const copyCurrentReport = () => {
    const form = document.getElementById("daily-report-form");

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const formData = new FormData(form);
    const currentReport: DailyReportFormReport = {
      reportDate: String(formData.get("reportDate") ?? ""),
      projectName: String(formData.get("projectName") ?? ""),
      workstream: String(formData.get("workstream") ?? ""),
      taskId: String(formData.get("taskId") ?? ""),
      task: String(formData.get("task") ?? ""),
      owner: String(formData.get("owner") ?? ""),
      planToday: String(formData.get("planToday") ?? ""),
      actualResult: String(formData.get("actualResult") ?? ""),
      completePercent:
        String(formData.get("completePercent") ?? "").trim() === ""
          ? null
          : Number(formData.get("completePercent")),
      status: String(formData.get("status") ?? "TODO") as WorkItemStatus,
      priority: String(formData.get("priority") ?? "MEDIUM") as Priority,
      blockerIssue: String(formData.get("blockerIssue") ?? ""),
      risk: String(formData.get("risk") ?? ""),
      supportNeeded: String(formData.get("supportNeeded") ?? ""),
      nextAction: String(formData.get("nextAction") ?? ""),
      dueDate: String(formData.get("dueDate") ?? ""),
      health: String(formData.get("health") ?? "GREEN") as ReportStatus,
    };

    navigator.clipboard.writeText(buildCopyText(currentReport, t));
  };

  return (
    <div className={styles.reportLayout}>
      <form action={formAction} className={styles.form} id="daily-report-form">
        {state.error ? (
          <p className={styles.formError}><MessageText value={state.error} /></p>
        ) : null}

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="dailyReports.date" /></span>
            <input
              name="reportDate"
              type="date"
              defaultValue={report.reportDate}
              aria-invalid={Boolean(state.fieldErrors?.reportDate)}
            />
            {state.fieldErrors?.reportDate ? (
              <small><MessageText value={state.fieldErrors.reportDate} /></small>
            ) : null}
          </label>

          <label className={styles.field}>
            <span><T k="dailyReports.project" /></span>
            <input
              name="projectName"
              type="text"
              defaultValue={report.projectName ?? ""}
            />
          </label>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="dailyReports.workstream" /></span>
            <input
              name="workstream"
              type="text"
              defaultValue={report.workstream ?? ""}
            />
          </label>

          <label className={styles.field}>
            <span><T k="dailyReports.taskId" /></span>
            <input name="taskId" type="text" defaultValue={report.taskId ?? ""} />
          </label>
        </div>

        <label className={styles.field}>
          <span><T k="dailyReports.task" /></span>
          <input
            name="task"
            type="text"
            defaultValue={report.task}
            aria-invalid={Boolean(state.fieldErrors?.task)}
          />
          {state.fieldErrors?.task ? (
            <small><MessageText value={state.fieldErrors.task} /></small>
          ) : null}
        </label>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="dailyReports.owner" /></span>
            <input name="owner" type="text" defaultValue={report.owner ?? ""} />
          </label>

          <label className={styles.field}>
            <span><T k="dailyReports.completePercent" /></span>
            <input
              name="completePercent"
              type="number"
              min="0"
              max="100"
              defaultValue={report.completePercent ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.completePercent)}
            />
            {state.fieldErrors?.completePercent ? (
              <small>
                <MessageText value={state.fieldErrors.completePercent} />
              </small>
            ) : null}
          </label>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="dailyReports.status" /></span>
            <select
              name="status"
              defaultValue={report.status}
              aria-invalid={Boolean(state.fieldErrors?.status)}
            >
              {workItemStatuses.map((status) => (
                <option key={status} value={status}>
                  <EnumLabel group="workItemStatus" value={status} />
                </option>
              ))}
            </select>
            {state.fieldErrors?.status ? (
              <small><MessageText value={state.fieldErrors.status} /></small>
            ) : null}
          </label>

          <label className={styles.field}>
            <span><T k="dailyReports.priority" /></span>
            <select
              name="priority"
              defaultValue={report.priority}
              aria-invalid={Boolean(state.fieldErrors?.priority)}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  <EnumLabel group="priority" value={priority} />
                </option>
              ))}
            </select>
            {state.fieldErrors?.priority ? (
              <small><MessageText value={state.fieldErrors.priority} /></small>
            ) : null}
          </label>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span><T k="dailyReports.health" /></span>
            <select
              name="health"
              defaultValue={report.health}
              aria-invalid={Boolean(state.fieldErrors?.health)}
            >
              {reportStatuses.map((health) => (
                <option key={health} value={health}>
                  <EnumLabel group="reportStatus" value={health} />
                </option>
              ))}
            </select>
            {state.fieldErrors?.health ? (
              <small><MessageText value={state.fieldErrors.health} /></small>
            ) : null}
          </label>

          <label className={styles.field}>
            <span><T k="dailyReports.dueDate" /></span>
            <input
              name="dueDate"
              type="date"
              defaultValue={report.dueDate ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.dueDate)}
            />
            {state.fieldErrors?.dueDate ? (
              <small><MessageText value={state.fieldErrors.dueDate} /></small>
            ) : null}
          </label>
        </div>

        <label className={styles.field}>
          <span><T k="dailyReports.planToday" /></span>
          <textarea
            name="planToday"
            rows={3}
            defaultValue={report.planToday ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="dailyReports.actualResult" /></span>
          <textarea
            name="actualResult"
            rows={3}
            defaultValue={report.actualResult ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="dailyReports.blockerIssue" /></span>
          <textarea
            name="blockerIssue"
            rows={3}
            defaultValue={report.blockerIssue ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="dailyReports.risk" /></span>
          <textarea name="risk" rows={3} defaultValue={report.risk ?? ""} />
        </label>

        <label className={styles.field}>
          <span><T k="dailyReports.supportNeeded" /></span>
          <textarea
            name="supportNeeded"
            rows={3}
            defaultValue={report.supportNeeded ?? ""}
          />
        </label>

        <label className={styles.field}>
          <span><T k="dailyReports.nextAction" /></span>
          <textarea
            name="nextAction"
            rows={3}
            defaultValue={report.nextAction ?? ""}
          />
        </label>

        <button className={styles.primaryButton} type="submit" disabled={isPending}>
          {isPending ? (
            <T k="common.saving" />
          ) : report.id ? (
            <T k="dailyReports.save" />
          ) : (
            <T k="dailyReports.create" />
          )}
        </button>
      </form>

      <section className={styles.copyPanel}>
        <div className={styles.panelHeader}>
          <h3><T k="dailyReports.copyableOutput" /></h3>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={copyCurrentReport}
          >
            <T k="dailyReports.copyReport" />
          </button>
        </div>
        <pre>{copyText}</pre>
      </section>
    </div>
  );
}
