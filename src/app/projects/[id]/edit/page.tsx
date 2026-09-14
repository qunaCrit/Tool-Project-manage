import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { T } from "@/i18n";
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
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="projects.title" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link className={styles.activeNavItem} href="/projects">
            <T k="nav.projects" />
          </Link>
          <Link href={`/projects/${project.id}`}><T k="nav.overview" /></Link>
          <Link href={`/projects/${project.id}/work-items`}><T k="nav.workItems" /></Link>
          <Link href={`/projects/${project.id}/meetings`}><T k="nav.meetings" /></Link>
          <Link href={`/projects/${project.id}/risks`}><T k="nav.risks" /></Link>
          <Link href={`/projects/${project.id}/issues`}><T k="nav.issues" /></Link>
          <Link href={`/projects/${project.id}/daily-reports`}>
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
            <p className={styles.eyebrow}><T k="projects.edit" /></p>
            <h2>{project.name}</h2>
          </div>
          <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
            <T k="common.backToOverview" />
          </Link>
        </header>
        <ProjectForm project={project} />
      </section>
    </main>
  );
}
