import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { dailyReports, projects } from "@/db/schema";
import { T } from "@/i18n";
import { DailyReportForm } from "../../daily-report-form";
import styles from "../../../../../page.module.css";

export default async function EditDailyReportPage({
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
    .from(dailyReports)
    .where(
      and(
        eq(dailyReports.id, selectedReportId),
        eq(dailyReports.projectId, project.id),
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
            <h2><T k="dailyReports.edit" /></h2>
          </div>
          <Link
            className={styles.secondaryButton}
            href={`/projects/${project.id}/daily-reports`}
          >
            <T k="dailyReports.back" />
          </Link>
        </header>
        <DailyReportForm projectId={project.id} report={report} />
      </section>
    </main>
  );
}
