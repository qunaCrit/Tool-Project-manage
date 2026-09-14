import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  meetings,
  projects,
  workItems,
} from "@/db/schema";
import { EnumLabel, LocalizedDateTime, T, type TranslationKey } from "@/i18n";
import { DeleteMeetingButton } from "../delete-meeting-button";
import { MeetingActionItemForm } from "../meeting-action-item-form";
import styles from "../../../../page.module.css";

const formatValue = (value: string | null) => value || "-";

const MinutesSection = ({
  titleKey,
  children,
}: {
  titleKey: TranslationKey;
  children: string | null;
}) => (
  <section className={styles.minutesSection}>
    <h3><T k={titleKey} /></h3>
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
            <h2>{meeting.title}</h2>
          </div>
          <div className={styles.actionRow}>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/meetings`}
            >
              <T k="meetings.backToMeetings" />
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
        </header>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3><T k="meetings.info" /></h3>
            <span className={styles.statusPill}>
              <LocalizedDateTime value={meeting.meetingDate} />
            </span>
          </div>
          <dl className={styles.detailList}>
            <div>
              <dt><T k="meetings.participants" /></dt>
              <dd>{formatValue(meeting.participants)}</dd>
            </div>
            <div>
              <dt><T k="common.updated" /></dt>
              <dd><LocalizedDateTime value={meeting.updatedAt} /></dd>
            </div>
          </dl>
        </section>

        <section className={styles.minutes}>
          <MinutesSection titleKey="meetings.agenda">{meeting.agenda}</MinutesSection>
          <MinutesSection titleKey="meetings.notes">{meeting.notes}</MinutesSection>
          <MinutesSection titleKey="common.summary">{meeting.summary}</MinutesSection>
          <MinutesSection titleKey="meetings.decisions">{meeting.decisions}</MinutesSection>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3><T k="meetings.actionItems" /></h3>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/work-items?type=ACTION_ITEM`}
            >
              <T k="meetings.viewInWorkItems" />
            </Link>
          </div>

          {actionItems.length === 0 ? (
            <p><T k="meetings.noActionItems" /></p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th><T k="common.title" /></th>
                    <th><T k="common.status" /></th>
                    <th><T k="common.priority" /></th>
                    <th><T k="common.owner" /></th>
                    <th><T k="common.due" /></th>
                    <th><T k="common.actions" /></th>
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
                          <EnumLabel group="workItemStatus" value={item.status} />
                        </span>
                      </td>
                      <td><EnumLabel group="priority" value={item.priority} /></td>
                      <td>{formatValue(item.owner)}</td>
                      <td>{formatValue(item.dueDate)}</td>
                      <td>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/work-items/${item.id}/edit`}
                        >
                          <T k="common.edit" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.sectionDivider}>
            <h3><T k="meetings.addActionItem" /></h3>
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
