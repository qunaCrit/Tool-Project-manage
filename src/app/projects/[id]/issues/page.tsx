import { and, desc, eq, type SQL } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  issueStatuses,
  issues,
  priorities,
  projects,
} from "@/db/schema";
import { EnumLabel, T } from "@/i18n";
import { DeleteIssueButton } from "./delete-issue-button";
import styles from "../../../page.module.css";

const errorMessageKeys: Record<string, Parameters<typeof T>[0]["k"]> = {
  "delete-failed": "error.issueDeleteFailed",
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
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="issues.title" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects"><T k="nav.projects" /></Link>
          <Link href={`/projects/${project.id}`}><T k="nav.overview" /></Link>
          <Link href={`/projects/${project.id}/work-items`}><T k="nav.workItems" /></Link>
          <Link href={`/projects/${project.id}/meetings`}><T k="nav.meetings" /></Link>
          <Link href={`/projects/${project.id}/risks`}><T k="nav.risks" /></Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/issues`}
          >
            <T k="nav.issues" />
          </Link>
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
            <p className={styles.eyebrow}>{project.name}</p>
            <h2><T k="issues.title" /></h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              <T k="common.backToOverview" />
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/issues/new`}
            >
              <T k="issues.add" />
            </Link>
          </div>
        </header>

        {error && errorMessageKeys[error] ? (
          <p className={styles.formError}><T k={errorMessageKeys[error]} /></p>
        ) : null}

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span><T k="common.status" /></span>
            <select name="status" defaultValue={selectedStatus ?? ""}>
              <option value=""><T k="projects.allStatuses" /></option>
              {issueStatuses.map((issueStatus) => (
                <option key={issueStatus} value={issueStatus}>
                  <EnumLabel group="issueStatus" value={issueStatus} />
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span><T k="common.priority" /></span>
            <select name="priority" defaultValue={selectedPriority ?? ""}>
              <option value=""><T k="workItems.allPriorities" /></option>
              {priorities.map((issuePriority) => (
                <option key={issuePriority} value={issuePriority}>
                  <EnumLabel group="priority" value={issuePriority} />
                </option>
              ))}
            </select>
          </label>

          <div className={styles.filterActions}>
            <button className={styles.primaryButton} type="submit">
              <T k="common.applyFilters" />
            </button>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/issues`}
            >
              <T k="common.reset" />
            </Link>
          </div>
        </form>

        {issueList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3><T k="issues.noFoundTitle" /></h3>
            <p><T k="issues.noFoundBody" /></p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/issues/new`}
            >
              <T k="issues.add" />
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><T k="common.title" /></th>
                  <th><T k="common.priority" /></th>
                  <th><T k="issues.impact" /></th>
                  <th><T k="common.owner" /></th>
                  <th><T k="common.status" /></th>
                  <th><T k="common.due" /></th>
                  <th><T k="common.actions" /></th>
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
                    <td><EnumLabel group="priority" value={issue.priority} /></td>
                    <td>{formatValue(issue.impact)}</td>
                    <td>{formatValue(issue.owner)}</td>
                    <td>
                      <span className={styles.statusPill}>
                        <EnumLabel group="issueStatus" value={issue.status} />
                      </span>
                    </td>
                    <td>{formatValue(issue.dueDate)}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/issues/${issue.id}/edit`}
                        >
                          <T k="common.edit" />
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
