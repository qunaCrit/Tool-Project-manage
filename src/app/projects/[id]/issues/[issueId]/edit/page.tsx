import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { issues, projects } from "@/db/schema";
import { IssueForm } from "../../issue-form";
import styles from "../../../../../page.module.css";

export default async function EditIssuePage({
  params,
}: {
  params: Promise<{ id: string; issueId: string }>;
}) {
  const { id, issueId } = await params;
  const projectId = Number(id);
  const selectedIssueId = Number(issueId);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(selectedIssueId) ||
    selectedIssueId <= 0
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

  const [issue] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.id, selectedIssueId), eq(issues.projectId, project.id)))
    .limit(1);

  if (!issue) {
    notFound();
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Issues</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects">Projects</Link>
          <Link href={`/projects/${project.id}`}>Project Overview</Link>
          <Link href={`/projects/${project.id}/work-items`}>Work Items</Link>
          <Link href={`/projects/${project.id}/meetings`}>Meetings</Link>
          <Link href={`/projects/${project.id}/risks`}>Risks</Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/issues`}
          >
            Issues
          </Link>
          <Link href={`/projects/${project.id}/weekly-reports`}>
            Weekly Reports
          </Link>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2>Edit issue</h2>
          </div>
          <Link
            className={styles.secondaryButton}
            href={`/projects/${project.id}/issues`}
          >
            Back to issues
          </Link>
        </header>
        <IssueForm projectId={project.id} issue={issue} />
      </section>
    </main>
  );
}
