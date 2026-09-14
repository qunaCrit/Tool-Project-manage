import { and, desc, eq, type SQL } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  issueStatuses,
  issues,
  priorities,
  projects,
  type IssueStatus,
  type Priority,
} from "@/db/schema";
import { DeleteIssueButton } from "./delete-issue-button";
import styles from "../../../page.module.css";

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const statusLabels: Record<IssueStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const errorMessages: Record<string, string> = {
  "delete-failed": "Could not delete the issue. Please try again.",
};

const formatValue = (value: string | null) => value || "-";

const isValidFilter = <T extends string>(
  value: string | undefined,
  validValues: readonly T[],
): value is T => Boolean(value && validValues.includes(value as T));

export default async function IssuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    status?: string;
    priority?: string;
    error?: string;
  }>;
}) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
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

  const { status, priority, error } = await searchParams;
  const selectedStatus = isValidFilter(status, issueStatuses) ? status : undefined;
  const selectedPriority = isValidFilter(priority, priorities)
    ? priority
    : undefined;
  const filters: SQL[] = [eq(issues.projectId, projectId)];

  if (selectedStatus) {
    filters.push(eq(issues.status, selectedStatus));
  }

  if (selectedPriority) {
    filters.push(eq(issues.priority, selectedPriority));
  }

  const issueList = await db
    .select()
    .from(issues)
    .where(and(...filters))
    .orderBy(desc(issues.updatedAt));

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
            <h2>Issues</h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              Back to overview
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/issues/new`}
            >
              Add Issue
            </Link>
          </div>
        </header>

        {error && errorMessages[error] ? (
          <p className={styles.formError}>{errorMessages[error]}</p>
        ) : null}

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span>Status</span>
            <select name="status" defaultValue={selectedStatus ?? ""}>
              <option value="">All statuses</option>
              {issueStatuses.map((issueStatus) => (
                <option key={issueStatus} value={issueStatus}>
                  {statusLabels[issueStatus]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Priority</span>
            <select name="priority" defaultValue={selectedPriority ?? ""}>
              <option value="">All priorities</option>
              {priorities.map((issuePriority) => (
                <option key={issuePriority} value={issuePriority}>
                  {priorityLabels[issuePriority]}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.filterActions}>
            <button className={styles.primaryButton} type="submit">
              Apply filters
            </button>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/issues`}
            >
              Reset
            </Link>
          </div>
        </form>

        {issueList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No issues found</h3>
            <p>Add the first issue for this project.</p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/issues/new`}
            >
              Add Issue
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Impact</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Due date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issueList.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <Link
                        className={styles.projectLink}
                        href={`/projects/${project.id}/issues/${issue.id}/edit`}
                      >
                        {issue.title}
                      </Link>
                    </td>
                    <td>{priorityLabels[issue.priority]}</td>
                    <td>{formatValue(issue.impact)}</td>
                    <td>{formatValue(issue.owner)}</td>
                    <td>
                      <span className={styles.statusPill}>
                        {statusLabels[issue.status]}
                      </span>
                    </td>
                    <td>{formatValue(issue.dueDate)}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/issues/${issue.id}/edit`}
                        >
                          Edit
                        </Link>
                        <DeleteIssueButton
                          projectId={project.id}
                          issueId={issue.id}
                          issueTitle={issue.title}
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
