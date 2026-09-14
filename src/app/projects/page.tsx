import { desc } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { projects, type ProjectStatus } from "@/db/schema";
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

const formatDate = (value: string | null) => value || "-";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const projectList = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.updatedAt));

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

        {projectList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No projects yet</h3>
            <p>Create the first project to start using the MVP.</p>
            <Link className={styles.primaryButton} href="/projects/new">
              Create first project
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
                  <th>Start date</th>
                  <th>End date</th>
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
                    <td>{formatDate(project.startDate)}</td>
                    <td>{formatDate(project.endDate)}</td>
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
