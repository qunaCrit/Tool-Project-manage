import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { projects, risks } from "@/db/schema";
import { T } from "@/i18n";
import { RiskForm } from "../../risk-form";
import styles from "../../../../../page.module.css";

export default async function EditRiskPage({
  params,
}: {
  params: Promise<{ id: string; riskId: string }>;
}) {
  const { id, riskId } = await params;
  const projectId = Number(id);
  const selectedRiskId = Number(riskId);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(selectedRiskId) ||
    selectedRiskId <= 0
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

  const [risk] = await db
    .select()
    .from(risks)
    .where(and(eq(risks.id, selectedRiskId), eq(risks.projectId, project.id)))
    .limit(1);

  if (!risk) {
    notFound();
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="risks.title" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects"><T k="nav.projects" /></Link>
          <Link href={`/projects/${project.id}`}><T k="nav.overview" /></Link>
          <Link href={`/projects/${project.id}/work-items`}><T k="nav.workItems" /></Link>
          <Link href={`/projects/${project.id}/meetings`}><T k="nav.meetings" /></Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/risks`}
          >
            <T k="nav.risks" />
          </Link>
          <Link href={`/projects/${project.id}/issues`}><T k="nav.issues" /></Link>
          <Link href={`/projects/${project.id}/weekly-reports`}>
            <T k="nav.weeklyReports" />
          </Link>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2><T k="risks.edit" /></h2>
          </div>
          <Link
            className={styles.secondaryButton}
            href={`/projects/${project.id}/risks`}
          >
            <T k="risks.back" />
          </Link>
        </header>
        <RiskForm projectId={project.id} risk={risk} />
      </section>
    </main>
  );
}
