import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { projects, type ProjectStatus } from "@/db/schema";
import { DeleteProjectButton } from "../delete-project-button";
import styles from "../../page.module.css";

const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

const formatValue = (value: string | null) => value || "-";

export default async function ProjectDetailPage({
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
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    notFound();
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Overview</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects">Projects</Link>
          <Link className={styles.activeNavItem} href={`/projects/${project.id}`}>
            Project Overview
          </Link>
          <span>Work Items</span>
          <span>Meetings</span>
          <span>Risks</span>
          <span>Issues</span>
          <span>Weekly Reports</span>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Project Detail</p>
            <h2>{project.name}</h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href="/projects">
              Project List
            </Link>
            <Link className={styles.primaryButton} href={`/projects/${project.id}/edit`}>
              Edit Project
            </Link>
            <DeleteProjectButton projectId={project.id} projectName={project.name} />
          </div>
        </header>

        <section className={styles.overviewGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Project Summary</h3>
              <span className={styles.statusPill}>{statusLabels[project.status]}</span>
            </div>
            <dl className={styles.detailList}>
              <div>
                <dt>Owner</dt>
                <dd>{formatValue(project.owner)}</dd>
              </div>
              <div>
                <dt>Customer</dt>
                <dd>{formatValue(project.customer)}</dd>
              </div>
              <div>
                <dt>Start date</dt>
                <dd>{formatValue(project.startDate)}</dd>
              </div>
              <div>
                <dt>End date</dt>
                <dd>{formatValue(project.endDate)}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.panel}>
            <h3>Description</h3>
            <p>{formatValue(project.description)}</p>
          </div>

          <div className={styles.panel}>
            <h3>Objective</h3>
            <p>{formatValue(project.objective)}</p>
          </div>

          <div className={styles.panel}>
            <h3>Health Note</h3>
            <p>{formatValue(project.healthNote)}</p>
          </div>
        </section>

        <section className={styles.placeholderGrid}>
          {["Work Items", "Meetings", "Risks", "Issues", "Weekly Reports"].map(
            (moduleName) => (
              <div className={styles.placeholderPanel} key={moduleName}>
                <h3>{moduleName}</h3>
                <p>Not implemented in this session.</p>
              </div>
            ),
          )}
        </section>
      </section>
    </main>
  );
}
