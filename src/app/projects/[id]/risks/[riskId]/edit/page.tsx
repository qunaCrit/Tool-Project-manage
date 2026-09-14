import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { projects, risks } from "@/db/schema";
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
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Risks</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects">Projects</Link>
          <Link href={`/projects/${project.id}`}>Project Overview</Link>
          <Link href={`/projects/${project.id}/work-items`}>Work Items</Link>
          <Link href={`/projects/${project.id}/meetings`}>Meetings</Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/risks`}
          >
            Risks
          </Link>
          <Link href={`/projects/${project.id}/issues`}>Issues</Link>
          <Link href={`/projects/${project.id}/weekly-reports`}>
            Weekly Reports
          </Link>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2>Edit risk</h2>
          </div>
          <Link
            className={styles.secondaryButton}
            href={`/projects/${project.id}/risks`}
          >
            Back to risks
          </Link>
        </header>
        <RiskForm projectId={project.id} risk={risk} />
      </section>
    </main>
  );
}
