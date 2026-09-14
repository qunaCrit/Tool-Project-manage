import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { ProjectForm } from "../../project-form";
import styles from "../../../page.module.css";

export default async function EditProjectPage({
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
          <h1>Projects</h1>
        </div>
        <nav className={styles.nav}>
          <Link className={styles.activeNavItem} href="/projects">
            Projects
          </Link>
          <Link href={`/projects/${project.id}`}>Project Overview</Link>
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
            <p className={styles.eyebrow}>Edit Project</p>
            <h2>{project.name}</h2>
          </div>
          <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
            Back to overview
          </Link>
        </header>
        <ProjectForm project={project} />
      </section>
    </main>
  );
}
