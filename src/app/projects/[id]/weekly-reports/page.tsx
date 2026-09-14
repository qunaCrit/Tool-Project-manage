import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  projects,
  weeklyReports,
  type ReportStatus,
} from "@/db/schema";
import styles from "../../../page.module.css";

const statusLabels: Record<ReportStatus, string> = {
  GREEN: "Green",
  YELLOW: "Yellow",
  RED: "Red",
};

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

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
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Weekly Reports</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects">Projects</Link>
          <Link href={`/projects/${project.id}`}>Project Overview</Link>
          <Link href={`/projects/${project.id}/work-items`}>Work Items</Link>
          <Link href={`/projects/${project.id}/meetings`}>Meetings</Link>
          <Link href={`/projects/${project.id}/risks`}>Risks</Link>
          <Link href={`/projects/${project.id}/issues`}>Issues</Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/weekly-reports`}
          >
            Weekly Reports
          </Link>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2>Weekly Reports</h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              Back to overview
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/weekly-reports/new`}
            >
              Generate Weekly Report
            </Link>
          </div>
        </header>

        {reportList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No weekly reports yet</h3>
            <p>Generate the first weekly report draft from project data.</p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/weekly-reports/new`}
            >
              Generate Weekly Report
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Overall status</th>
                  <th>Summary</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportList.map((report) => (
                  <tr key={report.id}>
                    <td>
                      {report.weekStart} to {report.weekEnd}
                    </td>
                    <td>
                      <span className={styles.statusPill}>
                        {statusLabels[report.overallStatus]}
                      </span>
                    </td>
                    <td>{truncate(report.summary)}</td>
                    <td>{formatDateTime(report.updatedAt)}</td>
                    <td>
                      <Link
                        className={styles.secondaryButton}
                        href={`/projects/${project.id}/weekly-reports/${report.id}`}
                      >
                        Open
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
