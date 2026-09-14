import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { meetings, projects } from "@/db/schema";
import { MeetingForm } from "../../meeting-form";
import styles from "../../../../../page.module.css";

export default async function EditMeetingPage({
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
          <span>Issues</span>
          <span>Weekly Reports</span>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2>Edit meeting</h2>
          </div>
          <div className={styles.actionRow}>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/meetings/${meeting.id}`}
            >
              Back to meeting
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/meetings`}
            >
              Back to meetings
            </Link>
          </div>
        </header>
        <MeetingForm projectId={project.id} meeting={meeting} />
      </section>
    </main>
  );
}
