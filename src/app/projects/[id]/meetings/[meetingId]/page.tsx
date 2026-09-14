import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  meetings,
  projects,
  workItems,
  type Priority,
  type WorkItemStatus,
} from "@/db/schema";
import { DeleteMeetingButton } from "../delete-meeting-button";
import { MeetingActionItemForm } from "../meeting-action-item-form";
import styles from "../../../../page.module.css";

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

const formatValue = (value: string | null) => value || "-";

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const MinutesSection = ({
  title,
  children,
}: {
  title: string;
  children: string | null;
}) => (
  <section className={styles.minutesSection}>
    <h3>{title}</h3>
    <p>{formatValue(children)}</p>
  </section>
);

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id, meetingId } = await params;
  const projectId = Number(id);
  const selectedMeetingId = Number(meetingId);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(selectedMeetingId) ||
    selectedMeetingId <= 0
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

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(
      and(eq(meetings.id, selectedMeetingId), eq(meetings.projectId, project.id)),
    )
    .limit(1);

  if (!meeting) {
    notFound();
  }

  const actionItems = await db
    .select()
    .from(workItems)
    .where(
      and(
        eq(workItems.projectId, project.id),
        eq(workItems.meetingId, meeting.id),
      ),
    );

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Meetings</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects">Projects</Link>
          <Link href={`/projects/${project.id}`}>Project Overview</Link>
          <Link href={`/projects/${project.id}/work-items`}>Work Items</Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/meetings`}
          >
            Meetings
          </Link>
          <span>Risks</span>
          <span>Issues</span>
          <span>Weekly Reports</span>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2>{meeting.title}</h2>
          </div>
          <div className={styles.actionRow}>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/meetings`}
            >
              Back to meetings
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/meetings/${meeting.id}/edit`}
            >
              Edit
            </Link>
            <DeleteMeetingButton
              projectId={project.id}
              meetingId={meeting.id}
              meetingTitle={meeting.title}
            />
          </div>
        </header>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Meeting Info</h3>
            <span className={styles.statusPill}>
              {formatDateTime(meeting.meetingDate)}
            </span>
          </div>
          <dl className={styles.detailList}>
            <div>
              <dt>Participants</dt>
              <dd>{formatValue(meeting.participants)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDateTime(meeting.updatedAt)}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.minutes}>
          <MinutesSection title="Agenda">{meeting.agenda}</MinutesSection>
          <MinutesSection title="Notes">{meeting.notes}</MinutesSection>
          <MinutesSection title="Summary">{meeting.summary}</MinutesSection>
          <MinutesSection title="Decisions">{meeting.decisions}</MinutesSection>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Action Items</h3>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/work-items?type=ACTION_ITEM`}
            >
              View in Work Items
            </Link>
          </div>

          {actionItems.length === 0 ? (
            <p>No action items have been created from this meeting yet.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Owner</th>
                    <th>Due date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link
                          className={styles.projectLink}
                          href={`/projects/${project.id}/work-items/${item.id}/edit`}
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td>
                        <span className={styles.statusPill}>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td>{priorityLabels[item.priority]}</td>
                      <td>{formatValue(item.owner)}</td>
                      <td>{formatValue(item.dueDate)}</td>
                      <td>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/work-items/${item.id}/edit`}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.sectionDivider}>
            <h3>Add Action Item</h3>
            <MeetingActionItemForm
              projectId={project.id}
              meetingId={meeting.id}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
