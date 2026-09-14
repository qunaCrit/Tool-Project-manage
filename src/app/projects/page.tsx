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
import { DeleteProjectButton } from "./delete-project-button";
import styles from "../page.module.css";

const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

const errorMessages: Record<string, string> = {
  "invalid-delete": "Project delete request was invalid.",
  "delete-failed": "Could not delete the project. Please try again.",
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );
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
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Projects</h1>
        </div>
        <nav className={styles.nav}>
          <Link className={styles.activeNavItem} href="/projects">
            Projects
          </Link>
          <span>Project Overview</span>
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
            <p className={styles.eyebrow}>Project List</p>
            <h2>Manage local projects</h2>
          </div>
          <Link className={styles.primaryButton} href="/projects/new">
            Create Project
          </Link>
        </header>

        {error && errorMessages[error] ? (
          <p className={styles.formError}>{errorMessages[error]}</p>
        ) : null}

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span>Search</span>
            <input
              name="q"
              type="search"
              defaultValue={searchQuery}
              placeholder="Project name"
            />
          </label>

          <label className={styles.field}>
            <span>Status</span>
            <select name="status" defaultValue={selectedStatus}>
              <option value="">All statuses</option>
              {projectStatuses.map((projectStatus) => (
                <option key={projectStatus} value={projectStatus}>
                  {statusLabels[projectStatus]}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.filterActions}>
            <button className={styles.primaryButton} type="submit">
              Apply filters
            </button>
            <Link className={styles.secondaryButton} href="/projects">
              Reset
            </Link>
          </div>
        </form>

        {projectList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No projects found</h3>
            <p>Create a project or adjust the current filters.</p>
            <Link className={styles.primaryButton} href="/projects/new">
              Create Project
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>End date</th>
                  <th>Open work items</th>
                  <th>Open risks/issues</th>
                  <th>Actions</th>
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
                        {statusLabels[project.status]}
                      </span>
                    </td>
                    <td>{project.owner || "-"}</td>
                    <td>{formatDate(project.endDate)}</td>
                    <td>{openWorkItemCounts.get(project.id) ?? 0}</td>
                    <td>{openRiskIssueCounts.get(project.id) ?? 0}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
                          Open
                        </Link>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/edit`}
                        >
                          Edit
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
