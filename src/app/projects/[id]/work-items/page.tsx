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
  type Priority,
  type WorkItemStatus,
  type WorkItemType,
} from "@/db/schema";
import { DeleteWorkItemButton } from "./delete-work-item-button";
import styles from "../../../page.module.css";

const typeLabels: Record<WorkItemType, string> = {
  TASK: "Task",
  ACTION_ITEM: "Action Item",
};

const statusLabels: Record<WorkItemStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  BLOCKED: "Blocked",
};

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const errorMessages: Record<string, string> = {
  "delete-failed": "Could not delete the work item. Please try again.",
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
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Work Items</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects">Projects</Link>
          <Link href={`/projects/${project.id}`}>Project Overview</Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/work-items`}
          >
            Work Items
          </Link>
          <Link href={`/projects/${project.id}/meetings`}>Meetings</Link>
          <span>Risks</span>
          <span>Issues</span>
          <span>Weekly Reports</span>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2>Work Items</h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              Back to overview
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/work-items/new`}
            >
              Add Work Item
            </Link>
          </div>
        </header>

        {error && errorMessages[error] ? (
          <p className={styles.formError}>{errorMessages[error]}</p>
        ) : null}

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span>Type</span>
            <select name="type" defaultValue={selectedType ?? ""}>
              <option value="">All types</option>
              {workItemTypes.map((itemType) => (
                <option key={itemType} value={itemType}>
                  {typeLabels[itemType]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Status</span>
            <select name="status" defaultValue={selectedStatus ?? ""}>
              <option value="">All statuses</option>
              {workItemStatuses.map((itemStatus) => (
                <option key={itemStatus} value={itemStatus}>
                  {statusLabels[itemStatus]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Priority</span>
            <select name="priority" defaultValue={selectedPriority ?? ""}>
              <option value="">All priorities</option>
              {priorities.map((itemPriority) => (
                <option key={itemPriority} value={itemPriority}>
                  {priorityLabels[itemPriority]}
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
              href={`/projects/${project.id}/work-items`}
            >
              Reset
            </Link>
          </div>
        </form>

        {workItemList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No work items found</h3>
            <p>Add the first task or action item for this project.</p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/work-items/new`}
            >
              Add Work Item
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Owner</th>
                  <th>Due date</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workItemList.map((workItem) => (
                  <tr key={workItem.id}>
                    <td>{typeLabels[workItem.type]}</td>
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
                        {statusLabels[workItem.status]}
                      </span>
                    </td>
                    <td>{priorityLabels[workItem.priority]}</td>
                    <td>{formatValue(workItem.owner)}</td>
                    <td>{formatValue(workItem.dueDate)}</td>
                    <td>{formatValue(workItem.source)}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/work-items/${workItem.id}/edit`}
                        >
                          Edit
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
