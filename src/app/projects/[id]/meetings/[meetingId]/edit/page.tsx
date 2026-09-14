import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { meetings, projects } from "@/db/schema";
import { T } from "@/i18n";
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
            <h2><T k="meetings.edit" /></h2>
          </div>
          <div className={styles.actionRow}>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/meetings/${meeting.id}`}
            >
              <T k="meetings.back" />
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/meetings`}
            >
              <T k="meetings.backToMeetings" />
            </Link>
          </div>
        </header>
        <MeetingForm projectId={project.id} meeting={meeting} />
      </section>
    </main>
  );
}
