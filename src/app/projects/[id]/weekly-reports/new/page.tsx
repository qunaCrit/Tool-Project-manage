import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { T } from "@/i18n";
import { generateWeeklyReportDraft, isValidReportRange } from "../draft";
import { WeeklyReportForm } from "../weekly-report-form";
import styles from "../../../../page.module.css";

const todayInput = () => new Date().toISOString().slice(0, 10);

export default async function NewWeeklyReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ weekStart?: string; weekEnd?: string }>;
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

  const { weekStart, weekEnd } = await searchParams;
  const canGenerate = isValidReportRange(weekStart, weekEnd);
  const draft = canGenerate
    ? await generateWeeklyReportDraft(project.id, weekStart!, weekEnd!)
    : null;
  const today = todayInput();

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
            <h2><T k="weeklyReports.generate" /></h2>
          </div>
          <Link
            className={styles.secondaryButton}
            href={`/projects/${project.id}/weekly-reports`}
          >
            <T k="weeklyReports.back" />
          </Link>
        </header>

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span><T k="weeklyReports.weekStart" /></span>
            <input
              name="weekStart"
              type="date"
              defaultValue={weekStart ?? today}
            />
          </label>
          <label className={styles.field}>
            <span><T k="weeklyReports.weekEnd" /></span>
            <input name="weekEnd" type="date" defaultValue={weekEnd ?? today} />
          </label>
          <div className={styles.filterActions}>
            <button className={styles.primaryButton} type="submit">
              <T k="weeklyReports.generateDraft" />
            </button>
          </div>
        </form>

        {weekStart || weekEnd ? (
          draft ? (
            <WeeklyReportForm projectId={project.id} report={draft} />
          ) : (
            <p className={styles.formError}>
              <T k="weeklyReports.invalidRange" />
            </p>
          )
        ) : (
          <div className={styles.emptyState}>
            <h3><T k="weeklyReports.selectRangeTitle" /></h3>
            <p><T k="weeklyReports.selectRangeBody" /></p>
          </div>
        )}
      </section>
    </main>
  );
}
