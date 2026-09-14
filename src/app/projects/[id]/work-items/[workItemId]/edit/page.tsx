import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { projects, workItems } from "@/db/schema";
import { WorkItemForm } from "../../work-item-form";
import styles from "../../../../../page.module.css";

export default async function EditWorkItemPage({
  params,
}: {
  params: Promise<{ id: string; workItemId: string }>;
}) {
  const { id, workItemId } = await params;
  const projectId = Number(id);
  const selectedWorkItemId = Number(workItemId);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(selectedWorkItemId) ||
    selectedWorkItemId <= 0
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

  const [workItem] = await db
    .select()
    .from(workItems)
    .where(
      and(
        eq(workItems.id, selectedWorkItemId),
        eq(workItems.projectId, project.id),
      ),
    )
    .limit(1);

  if (!workItem) {
    notFound();
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Work Items</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects">Projects</Link>
          <Link href={`/projects/${project.id}`}>Project Overview</Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/work-items`}
          >
            Work Items
          </Link>
          <span>Meetings</span>
          <span>Risks</span>
          <span>Issues</span>
          <span>Weekly Reports</span>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2>Edit work item</h2>
          </div>
          <Link
            className={styles.secondaryButton}
            href={`/projects/${project.id}/work-items`}
          >
            Back to work items
          </Link>
        </header>
        <WorkItemForm projectId={project.id} workItem={workItem} />
      </section>
    </main>
  );
}
