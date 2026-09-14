import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { dailyReports, projects } from "@/db/schema";
import { EnumLabel, T } from "@/i18n";
import { DeleteDailyReportButton } from "./delete-daily-report-button";
import styles from "../../../page.module.css";

const errorMessageKeys: Record<string, Parameters<typeof T>[0]["k"]> = {
  "delete-failed": "error.dailyReportDeleteFailed",
};

const formatValue = (value: string | number | null) =>
  value === null || value === "" ? "-" : value;

export default async function DailyReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    notFound();
  }

  const [project] = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    notFound();
  }

  const { error } = await searchParams;
  const reportList = await db
    .select()
    .from(dailyReports)
    .where(eq(dailyReports.projectId, project.id))
    .orderBy(desc(dailyReports.reportDate), desc(dailyReports.updatedAt));

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="dailyReports.title" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects"><T k="nav.projects" /></Link>
          <Link href={`/projects/${project.id}`}><T k="nav.overview" /></Link>
          <Link href={`/projects/${project.id}/work-items`}><T k="nav.workItems" /></Link>
          <Link href={`/projects/${project.id}/meetings`}><T k="nav.meetings" /></Link>
          <Link href={`/projects/${project.id}/risks`}><T k="nav.risks" /></Link>
          <Link href={`/projects/${project.id}/issues`}><T k="nav.issues" /></Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/daily-reports`}
          >
            <T k="nav.dailyReports" />
          </Link>
          <Link href={`/projects/${project.id}/weekly-reports`}>
            <T k="nav.weeklyReports" />
          </Link>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2><T k="dailyReports.title" /></h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              <T k="common.backToOverview" />
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/daily-reports/new`}
            >
              <T k="dailyReports.add" />
            </Link>
          </div>
        </header>

        {error && errorMessageKeys[error] ? (
          <p className={styles.formError}><T k={errorMessageKeys[error]} /></p>
        ) : null}

        {reportList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3><T k="dailyReports.noFoundTitle" /></h3>
            <p><T k="dailyReports.noFoundBody" /></p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/daily-reports/new`}
            >
              <T k="dailyReports.add" />
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><T k="dailyReports.date" /></th>
                  <th><T k="dailyReports.task" /></th>
                  <th><T k="dailyReports.owner" /></th>
                  <th><T k="dailyReports.completePercent" /></th>
                  <th><T k="dailyReports.status" /></th>
                  <th><T k="dailyReports.health" /></th>
                  <th><T k="common.actions" /></th>
                </tr>
              </thead>
              <tbody>
                {reportList.map((report) => (
                  <tr key={report.id}>
                    <td>{report.reportDate}</td>
                    <td>
                      <Link
                        className={styles.projectLink}
                        href={`/projects/${project.id}/daily-reports/${report.id}/edit`}
                      >
                        {report.task}
                      </Link>
                    </td>
                    <td>{formatValue(report.owner)}</td>
                    <td>{formatValue(report.completePercent)}</td>
                    <td>
                      <span className={styles.statusPill}>
                        <EnumLabel group="workItemStatus" value={report.status} />
                      </span>
                    </td>
                    <td>
                      <span className={styles.statusPill}>
                        <EnumLabel group="reportStatus" value={report.health} />
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/daily-reports/${report.id}/edit`}
                        >
                          <T k="common.edit" />
                        </Link>
                        <DeleteDailyReportButton
                          projectId={project.id}
                          reportId={report.id}
                          task={report.task}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
