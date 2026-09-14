import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { meetings, projects, workItems } from "@/db/schema";
import { DeleteMeetingButton } from "./delete-meeting-button";
import styles from "../../../page.module.css";

const errorMessages: Record<string, string> = {
  "delete-failed": "Could not delete the meeting. Please try again.",
};

const formatValue = (value: string | null) => value || "-";

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const truncate = (value: string | null, maxLength = 120) => {
  if (!value) {
    return "-";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
};

export default async function MeetingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
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

  const meetingList = await db
    .select({
      id: meetings.id,
      title: meetings.title,
      meetingDate: meetings.meetingDate,
      participants: meetings.participants,
      summary: meetings.summary,
      updatedAt: meetings.updatedAt,
      actionItemCount: count(workItems.id),
    })
    .from(meetings)
    .leftJoin(workItems, eq(workItems.meetingId, meetings.id))
    .where(eq(meetings.projectId, project.id))
    .groupBy(meetings.id)
    .orderBy(desc(meetings.meetingDate));

  const { error } = await searchParams;

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
          <Link href={`/projects/${project.id}/risks`}>Risks</Link>
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
            <h2>Meetings</h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              Back to overview
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/meetings/new`}
            >
              New Meeting
            </Link>
          </div>
        </header>

        {error && errorMessages[error] ? (
          <p className={styles.formError}>{errorMessages[error]}</p>
        ) : null}

        {meetingList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No meetings yet</h3>
            <p>Create the first meeting minutes for this project.</p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/meetings/new`}
            >
              New Meeting
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Meeting date</th>
                  <th>Participants</th>
                  <th>Summary</th>
                  <th>Action items</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetingList.map((meeting) => (
                  <tr key={meeting.id}>
                    <td>
                      <Link
                        className={styles.projectLink}
                        href={`/projects/${project.id}/meetings/${meeting.id}`}
                      >
                        {meeting.title}
                      </Link>
                    </td>
                    <td>{formatDateTime(meeting.meetingDate)}</td>
                    <td>{truncate(meeting.participants, 80)}</td>
                    <td>{truncate(meeting.summary)}</td>
                    <td>{meeting.actionItemCount}</td>
                    <td>{formatValue(formatDateTime(meeting.updatedAt))}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/meetings/${meeting.id}`}
                        >
                          Open
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
