import { desc } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import {
  issues,
  projects,
  risks,
  workItems,
  projectStatuses,
  type ProjectStatus,
} from "@/db/schema";
import { EnumLabel, LocalizedDate, T } from "@/i18n";
import { DeleteProjectButton } from "./delete-project-button";
import styles from "../page.module.css";

const errorMessageKeys: Record<string, Parameters<typeof T>[0]["k"]> = {
  "invalid-delete": "error.invalidDelete",
  "delete-failed": "error.projectDeleteFailed",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string; status?: string }>;
}) {
  const { error, q, status } = await searchParams;
  const searchQuery = typeof q === "string" ? q.trim() : "";
  const selectedStatus =
    typeof status === "string" &&
    projectStatuses.includes(status as ProjectStatus)
      ? (status as ProjectStatus)
      : "";
  const [allProjects, allWorkItems, allRisks, allIssues] = await Promise.all([
    db
    .select()
    .from(projects)
      .orderBy(desc(projects.updatedAt)),
    db.select().from(workItems),
    db.select().from(risks),
    db.select().from(issues),
  ]);

  const projectList = allProjects
    .filter((project) =>
      selectedStatus ? project.status === selectedStatus : true,
    )
    .filter((project) =>
      searchQuery
        ? project.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    );

  const openWorkItemCounts = new Map<number, number>();
  const openRiskIssueCounts = new Map<number, number>();

  for (const item of allWorkItems) {
    if (item.status !== "DONE") {
      openWorkItemCounts.set(
        item.projectId,
        (openWorkItemCounts.get(item.projectId) ?? 0) + 1,
      );
    }
  }

  for (const risk of allRisks) {
    if (risk.status === "OPEN" || risk.status === "MONITORING") {
      openRiskIssueCounts.set(
        risk.projectId,
        (openRiskIssueCounts.get(risk.projectId) ?? 0) + 1,
      );
    }
  }

  for (const issue of allIssues) {
    if (issue.status === "OPEN" || issue.status === "IN_PROGRESS") {
      openRiskIssueCounts.set(
        issue.projectId,
        (openRiskIssueCounts.get(issue.projectId) ?? 0) + 1,
      );
    }
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
          <span><T k="nav.overview" /></span>
          <span><T k="nav.workItems" /></span>
          <span><T k="nav.meetings" /></span>
          <span><T k="nav.risks" /></span>
          <span><T k="nav.issues" /></span>
          <span><T k="nav.weeklyReports" /></span>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}><T k="projects.list" /></p>
            <h2><T k="projects.manage" /></h2>
          </div>
          <Link className={styles.primaryButton} href="/projects/new">
            <T k="projects.create" />
          </Link>
        </header>

        {error && errorMessageKeys[error] ? (
          <p className={styles.formError}><T k={errorMessageKeys[error]} /></p>
        ) : null}

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span><T k="common.search" /></span>
            <input
              name="q"
              type="search"
              defaultValue={searchQuery}
              placeholder=""
            />
          </label>

          <label className={styles.field}>
            <span><T k="common.status" /></span>
            <select name="status" defaultValue={selectedStatus}>
              <option value=""><T k="projects.allStatuses" /></option>
              {projectStatuses.map((projectStatus) => (
                <option key={projectStatus} value={projectStatus}>
                  <EnumLabel group="projectStatus" value={projectStatus} />
                </option>
              ))}
            </select>
          </label>

          <div className={styles.filterActions}>
            <button className={styles.primaryButton} type="submit">
              <T k="common.applyFilters" />
            </button>
            <Link className={styles.secondaryButton} href="/projects">
              <T k="common.reset" />
            </Link>
          </div>
        </form>

        {projectList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3><T k="projects.noFoundTitle" /></h3>
            <p><T k="projects.noFoundBody" /></p>
            <Link className={styles.primaryButton} href="/projects/new">
              <T k="projects.create" />
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><T k="common.name" /></th>
                  <th><T k="common.status" /></th>
                  <th><T k="common.owner" /></th>
                  <th><T k="projects.endDate" /></th>
                  <th><T k="projects.openWorkItems" /></th>
                  <th><T k="projects.openRisksIssues" /></th>
                  <th><T k="common.actions" /></th>
                </tr>
              </thead>
              <tbody>
                {projectList.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link className={styles.projectLink} href={`/projects/${project.id}`}>
                        {project.name}
                      </Link>
                    </td>
                    <td>
                      <span className={styles.statusPill}>
                        <EnumLabel group="projectStatus" value={project.status} />
                      </span>
                    </td>
                    <td>{project.owner || "-"}</td>
                    <td><LocalizedDate value={project.endDate} /></td>
                    <td>{openWorkItemCounts.get(project.id) ?? 0}</td>
                    <td>{openRiskIssueCounts.get(project.id) ?? 0}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
                          <T k="common.open" />
                        </Link>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/edit`}
                        >
                          <T k="common.edit" />
                        </Link>
                        <DeleteProjectButton
                          projectId={project.id}
                          projectName={project.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
