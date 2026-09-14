import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { projects, weeklyReports } from "@/db/schema";
import { WeeklyReportForm } from "../weekly-report-form";
import styles from "../../../../page.module.css";

export default async function WeeklyReportDetailPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const { id, reportId } = await params;
  const projectId = Number(id);
  const selectedReportId = Number(reportId);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(selectedReportId) ||
    selectedReportId <= 0
  ) {
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

  const [report] = await db
    .select()
    .from(weeklyReports)
    .where(
      and(
        eq(weeklyReports.id, selectedReportId),
        eq(weeklyReports.projectId, project.id),
      ),
    )
    .limit(1);

  if (!report) {
    notFound();
  }

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
            <h2>
              Weekly report: {report.weekStart} to {report.weekEnd}
            </h2>
          </div>
          <Link
            className={styles.secondaryButton}
            href={`/projects/${project.id}/weekly-reports`}
          >
            Back to weekly reports
          </Link>
        </header>

        <WeeklyReportForm projectId={project.id} report={report} />
      </section>
    </main>
  );
}
