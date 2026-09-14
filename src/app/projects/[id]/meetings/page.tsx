import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { meetings, projects, workItems } from "@/db/schema";
import { LocalizedDateTime, T } from "@/i18n";
import { DeleteMeetingButton } from "./delete-meeting-button";
import styles from "../../../page.module.css";

const errorMessageKeys: Record<string, Parameters<typeof T>[0]["k"]> = {
  "delete-failed": "error.meetingDeleteFailed",
};

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
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="meetings.title" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects"><T k="nav.projects" /></Link>
          <Link href={`/projects/${project.id}`}><T k="nav.overview" /></Link>
          <Link href={`/projects/${project.id}/work-items`}><T k="nav.workItems" /></Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/meetings`}
          >
            <T k="nav.meetings" />
          </Link>
          <Link href={`/projects/${project.id}/risks`}><T k="nav.risks" /></Link>
          <Link href={`/projects/${project.id}/issues`}><T k="nav.issues" /></Link>
          <Link href={`/projects/${project.id}/weekly-reports`}>
            <T k="nav.weeklyReports" />
          </Link>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2><T k="meetings.title" /></h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              <T k="common.backToOverview" />
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/meetings/new`}
            >
              <T k="meetings.new" />
            </Link>
          </div>
        </header>

        {error && errorMessageKeys[error] ? (
          <p className={styles.formError}><T k={errorMessageKeys[error]} /></p>
        ) : null}

        {meetingList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3><T k="meetings.noFoundTitle" /></h3>
            <p><T k="meetings.noFoundBody" /></p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/meetings/new`}
            >
              <T k="meetings.new" />
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><T k="common.title" /></th>
                  <th><T k="meetings.meetingDate" /></th>
                  <th><T k="meetings.participants" /></th>
                  <th><T k="common.summary" /></th>
                  <th><T k="meetings.actionItems" /></th>
                  <th><T k="common.updated" /></th>
                  <th><T k="common.actions" /></th>
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
                    <td><LocalizedDateTime value={meeting.meetingDate} /></td>
                    <td>{truncate(meeting.participants, 80)}</td>
                    <td>{truncate(meeting.summary)}</td>
                    <td>{meeting.actionItemCount}</td>
                    <td><LocalizedDateTime value={meeting.updatedAt} /></td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/meetings/${meeting.id}`}
                        >
                          <T k="common.open" />
                        </Link>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/meetings/${meeting.id}/edit`}
                        >
                          <T k="common.edit" />
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
