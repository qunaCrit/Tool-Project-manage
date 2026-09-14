import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { projects } from "@/db/schema";
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
            <h2>Generate weekly report</h2>
          </div>
          <Link
            className={styles.secondaryButton}
            href={`/projects/${project.id}/weekly-reports`}
          >
            Back to weekly reports
          </Link>
        </header>

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span>Week start</span>
            <input
              name="weekStart"
              type="date"
              defaultValue={weekStart ?? today}
            />
          </label>
          <label className={styles.field}>
            <span>Week end</span>
            <input name="weekEnd" type="date" defaultValue={weekEnd ?? today} />
          </label>
          <div className={styles.filterActions}>
            <button className={styles.primaryButton} type="submit">
              Generate Draft
            </button>
          </div>
        </form>

        {weekStart || weekEnd ? (
          draft ? (
            <WeeklyReportForm projectId={project.id} report={draft} />
          ) : (
            <p className={styles.formError}>
              Please choose a valid report date range.
            </p>
          )
        ) : (
          <div className={styles.emptyState}>
            <h3>Select report range</h3>
            <p>Choose week start and week end to generate a draft from project data.</p>
          </div>
        )}
      </section>
    </main>
  );
}
