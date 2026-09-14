import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  projects,
  weeklyReports,
} from "@/db/schema";
import { EnumLabel, LocalizedDateTime, T } from "@/i18n";
import styles from "../../../page.module.css";

const truncate = (value: string | null, maxLength = 140) => {
  if (!value) {
    return "-";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
};

export default async function WeeklyReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const reportList = await db
    .select()
    .from(weeklyReports)
    .where(eq(weeklyReports.projectId, project.id))
    .orderBy(desc(weeklyReports.weekStart), desc(weeklyReports.updatedAt));

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="weeklyReports.title" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects"><T k="nav.projects" /></Link>
          <Link href={`/projects/${project.id}`}><T k="nav.overview" /></Link>
          <Link href={`/projects/${project.id}/work-items`}><T k="nav.workItems" /></Link>
          <Link href={`/projects/${project.id}/meetings`}><T k="nav.meetings" /></Link>
          <Link href={`/projects/${project.id}/risks`}><T k="nav.risks" /></Link>
          <Link href={`/projects/${project.id}/issues`}><T k="nav.issues" /></Link>
          <Link href={`/projects/${project.id}/daily-reports`}>
            <T k="nav.dailyReports" />
          </Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/weekly-reports`}
          >
            <T k="nav.weeklyReports" />
          </Link>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2><T k="weeklyReports.title" /></h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              <T k="common.backToOverview" />
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/weekly-reports/new`}
            >
              <T k="weeklyReports.generate" />
            </Link>
          </div>
        </header>

        {reportList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3><T k="weeklyReports.noFoundTitle" /></h3>
            <p><T k="weeklyReports.noFoundBody" /></p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/weekly-reports/new`}
            >
              <T k="weeklyReports.generate" />
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><T k="weeklyReports.week" /></th>
                  <th><T k="weeklyReports.overallStatus" /></th>
                  <th><T k="weeklyReports.progressPercent" /></th>
                  <th><T k="weeklyReports.trend" /></th>
                  <th><T k="common.summary" /></th>
                  <th><T k="common.updated" /></th>
                  <th><T k="common.actions" /></th>
                </tr>
              </thead>
              <tbody>
                {reportList.map((report) => (
                  <tr key={report.id}>
                    <td>
                      {report.weekStart} <T k="common.to" /> {report.weekEnd}
                    </td>
                    <td>
                      <span className={styles.statusPill}>
                        <EnumLabel
                          group="reportStatus"
                          value={report.overallStatus}
                        />
                      </span>
                    </td>
                    <td>{report.progressPercent ?? "-"}</td>
                    <td>
                      {report.trend ? (
                        <EnumLabel group="reportTrend" value={report.trend} />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{truncate(report.summary)}</td>
                    <td><LocalizedDateTime value={report.updatedAt} /></td>
                    <td>
                      <Link
                        className={styles.secondaryButton}
                        href={`/projects/${project.id}/weekly-reports/${report.id}`}
                      >
                        <T k="common.open" />
                      </Link>
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
