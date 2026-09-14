import { and, desc, eq, type SQL } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  priorities,
  projects,
  workItems,
  workItemStatuses,
  workItemTypes,
} from "@/db/schema";
import { EnumLabel, T } from "@/i18n";
import { DeleteWorkItemButton } from "./delete-work-item-button";
import styles from "../../../page.module.css";

const errorMessageKeys: Record<string, Parameters<typeof T>[0]["k"]> = {
  "delete-failed": "error.workItemDeleteFailed",
};

const formatValue = (value: string | null) => value || "-";

const isValidFilter = <T extends string>(
  value: string | undefined,
  validValues: readonly T[],
): value is T => Boolean(value && validValues.includes(value as T));

export default async function WorkItemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    type?: string;
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
    .select({ id: projects.id, name: projects.name, status: projects.status })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    notFound();
  }

  const { type, status, priority, error } = await searchParams;
  const selectedType = isValidFilter(type, workItemTypes) ? type : undefined;
  const selectedStatus = isValidFilter(status, workItemStatuses)
    ? status
    : undefined;
  const selectedPriority = isValidFilter(priority, priorities)
    ? priority
    : undefined;
  const filters: SQL[] = [eq(workItems.projectId, projectId)];

  if (selectedType) {
    filters.push(eq(workItems.type, selectedType));
  }

  if (selectedStatus) {
    filters.push(eq(workItems.status, selectedStatus));
  }

  if (selectedPriority) {
    filters.push(eq(workItems.priority, selectedPriority));
  }

  const workItemList = await db
    .select()
    .from(workItems)
    .where(and(...filters))
    .orderBy(desc(workItems.updatedAt));

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="workItems.title" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects"><T k="nav.projects" /></Link>
          <Link href={`/projects/${project.id}`}><T k="nav.overview" /></Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/work-items`}
          >
            <T k="nav.workItems" />
          </Link>
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
            <p className={styles.eyebrow}>{project.name}</p>
            <h2><T k="workItems.title" /></h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              <T k="common.backToOverview" />
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/work-items/new`}
            >
              <T k="workItems.add" />
            </Link>
          </div>
        </header>

        {error && errorMessageKeys[error] ? (
          <p className={styles.formError}><T k={errorMessageKeys[error]} /></p>
        ) : null}

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span><T k="common.type" /></span>
            <select name="type" defaultValue={selectedType ?? ""}>
              <option value=""><T k="workItems.allTypes" /></option>
              {workItemTypes.map((itemType) => (
                <option key={itemType} value={itemType}>
                  <EnumLabel group="workItemType" value={itemType} />
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span><T k="common.status" /></span>
            <select name="status" defaultValue={selectedStatus ?? ""}>
              <option value=""><T k="projects.allStatuses" /></option>
              {workItemStatuses.map((itemStatus) => (
                <option key={itemStatus} value={itemStatus}>
                  <EnumLabel group="workItemStatus" value={itemStatus} />
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span><T k="common.priority" /></span>
            <select name="priority" defaultValue={selectedPriority ?? ""}>
              <option value=""><T k="workItems.allPriorities" /></option>
              {priorities.map((itemPriority) => (
                <option key={itemPriority} value={itemPriority}>
                  <EnumLabel group="priority" value={itemPriority} />
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
              href={`/projects/${project.id}/work-items`}
            >
              <T k="common.reset" />
            </Link>
          </div>
        </form>

        {workItemList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3><T k="workItems.noFoundTitle" /></h3>
            <p><T k="workItems.noFoundBody" /></p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/work-items/new`}
            >
              <T k="workItems.add" />
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><T k="common.type" /></th>
                  <th><T k="common.title" /></th>
                  <th><T k="common.status" /></th>
                  <th><T k="common.priority" /></th>
                  <th><T k="common.owner" /></th>
                  <th><T k="common.due" /></th>
                  <th><T k="workItems.source" /></th>
                  <th><T k="common.actions" /></th>
                </tr>
              </thead>
              <tbody>
                {workItemList.map((workItem) => (
                  <tr key={workItem.id}>
                    <td><EnumLabel group="workItemType" value={workItem.type} /></td>
                    <td>
                      <Link
                        className={styles.projectLink}
                        href={`/projects/${project.id}/work-items/${workItem.id}/edit`}
                      >
                        {workItem.title}
                      </Link>
                    </td>
                    <td>
                      <span className={styles.statusPill}>
                        <EnumLabel group="workItemStatus" value={workItem.status} />
                      </span>
                    </td>
                    <td><EnumLabel group="priority" value={workItem.priority} /></td>
                    <td>{formatValue(workItem.owner)}</td>
                    <td>{formatValue(workItem.dueDate)}</td>
                    <td>{formatValue(workItem.source)}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/work-items/${workItem.id}/edit`}
                        >
                          <T k="common.edit" />
                        </Link>
                        <DeleteWorkItemButton
                          projectId={project.id}
                          workItemId={workItem.id}
                          workItemTitle={workItem.title}
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
