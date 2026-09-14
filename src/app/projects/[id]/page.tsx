import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  issues,
  meetings,
  projects,
  risks,
  weeklyReports,
  workItems,
} from "@/db/schema";
import { EnumLabel, LocalizedDate, LocalizedDateTime, T } from "@/i18n";
import { DeleteProjectButton } from "../delete-project-button";
import styles from "../../page.module.css";

const formatValue = (value: string | null) => value || "-";

const todayInput = () => new Date().toISOString().slice(0, 10);

const truncate = (value: string | null, maxLength = 140) => {
  if (!value) {
    return "-";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    notFound();
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    notFound();
  }

  const [
    projectWorkItems,
    projectRisks,
    projectIssues,
    recentMeetings,
    latestReport,
  ] = await Promise.all([
    db.select().from(workItems).where(eq(workItems.projectId, project.id)),
    db.select().from(risks).where(eq(risks.projectId, project.id)),
    db.select().from(issues).where(eq(issues.projectId, project.id)),
    db
      .select()
      .from(meetings)
      .where(eq(meetings.projectId, project.id))
      .orderBy(desc(meetings.meetingDate))
      .limit(3),
    db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.projectId, project.id))
      .orderBy(desc(weeklyReports.weekStart), desc(weeklyReports.updatedAt))
      .limit(1),
  ]);

  const today = todayInput();
  const workSummary = {
    total: projectWorkItems.length,
    todo: projectWorkItems.filter((item) => item.status === "TODO").length,
    inProgress: projectWorkItems.filter((item) => item.status === "IN_PROGRESS")
      .length,
    done: projectWorkItems.filter((item) => item.status === "DONE").length,
    blocked: projectWorkItems.filter((item) => item.status === "BLOCKED").length,
    overdue: projectWorkItems.filter(
      (item) => item.status !== "DONE" && item.dueDate && item.dueDate < today,
    ).length,
  };
  const completion =
    workSummary.total > 0
      ? Math.round((workSummary.done / workSummary.total) * 100)
      : 0;
  const upcomingWorkItems = projectWorkItems
    .filter((item) => item.status !== "DONE" && item.dueDate)
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
    .slice(0, 5);
  const overdueWorkItems = projectWorkItems
    .filter((item) => item.status !== "DONE" && item.dueDate && item.dueDate < today)
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  const openRisks = projectRisks.filter((risk) =>
    ["OPEN", "MONITORING"].includes(risk.status),
  );
  const highRisks = projectRisks.filter((risk) => risk.severity === "HIGH");
  const openIssues = projectIssues.filter((issue) =>
    ["OPEN", "IN_PROGRESS"].includes(issue.status),
  );
  const overdueIssues = openIssues.filter(
    (issue) => issue.dueDate && issue.dueDate < today,
  );
  const unassignedIssues = openIssues.filter((issue) => !issue.owner);
  const latestWeeklyReport = latestReport[0];
  const actionItemCountByMeeting = new Map<number, number>();

  for (const item of projectWorkItems) {
    if (item.type === "ACTION_ITEM" && item.meetingId) {
      actionItemCountByMeeting.set(
        item.meetingId,
        (actionItemCountByMeeting.get(item.meetingId) ?? 0) + 1,
      );
    }
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="nav.overview" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects"><T k="nav.projects" /></Link>
          <Link className={styles.activeNavItem} href={`/projects/${project.id}`}>
            <T k="nav.overview" />
          </Link>
          <Link href={`/projects/${project.id}/work-items`}><T k="nav.workItems" /></Link>
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
            <p className={styles.eyebrow}><T k="projects.detail" /></p>
            <h2>{project.name}</h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href="/projects">
              <T k="projects.projectList" />
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/work-items`}
            >
              <T k="nav.workItems" />
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/meetings`}
            >
              <T k="nav.meetings" />
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/risks`}
            >
              <T k="nav.risks" />
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/issues`}
            >
              <T k="nav.issues" />
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/daily-reports/new`}
            >
              <T k="dailyReports.add" />
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/weekly-reports/new`}
            >
              <T k="weeklyReports.generate" />
            </Link>
            <Link className={styles.primaryButton} href={`/projects/${project.id}/edit`}>
              <T k="projects.edit" />
            </Link>
            <DeleteProjectButton projectId={project.id} projectName={project.name} />
          </div>
        </header>

        <section className={styles.overviewGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3><T k="projects.summary" /></h3>
              <span className={styles.statusPill}>
                <EnumLabel group="projectStatus" value={project.status} />
              </span>
            </div>
            <dl className={styles.detailList}>
              <div>
                <dt><T k="common.owner" /></dt>
                <dd>{formatValue(project.owner)}</dd>
              </div>
              <div>
                <dt><T k="projects.customer" /></dt>
                <dd>{formatValue(project.customer)}</dd>
              </div>
              <div>
                <dt><T k="projects.startDate" /></dt>
                <dd><LocalizedDate value={project.startDate} /></dd>
              </div>
              <div>
                <dt><T k="projects.endDate" /></dt>
                <dd><LocalizedDate value={project.endDate} /></dd>
              </div>
            </dl>
          </div>

          <div className={styles.panel}>
            <h3><T k="projects.description" /></h3>
            <p>{formatValue(project.description)}</p>
          </div>

          <div className={styles.panel}>
            <h3><T k="projects.objective" /></h3>
            <p>{formatValue(project.objective)}</p>
          </div>

          <div className={styles.panel}>
            <h3><T k="projects.healthNote" /></h3>
            <p>{formatValue(project.healthNote)}</p>
          </div>
        </section>

        <section className={styles.overviewGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3><T k="nav.workItems" /></h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/work-items`}
              >
                <T k="overview.viewWorkItems" />
              </Link>
            </div>
            <div className={styles.metricGrid}>
              <div>
                <strong>{workSummary.total}</strong>
                <span><T k="common.total" /></span>
              </div>
              <div>
                <strong>{workSummary.todo}</strong>
                <span><EnumLabel group="workItemStatus" value="TODO" /></span>
              </div>
              <div>
                <strong>{workSummary.inProgress}</strong>
                <span><EnumLabel group="workItemStatus" value="IN_PROGRESS" /></span>
              </div>
              <div>
                <strong>{workSummary.done}</strong>
                <span><EnumLabel group="workItemStatus" value="DONE" /></span>
              </div>
              <div>
                <strong>{workSummary.overdue}</strong>
                <span><T k="common.overdue" /></span>
              </div>
            </div>
            <div className={styles.progressTrack} aria-label="work-completion">
              <span style={{ width: `${completion}%` }} />
            </div>
            <p>
              <T
                k="overview.completeBlocked"
                values={{ completion, blocked: workSummary.blocked }}
              />
            </p>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3><T k="nav.risks" /></h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/risks`}
              >
                <T k="overview.viewRisks" />
              </Link>
            </div>
            <div className={styles.metricGrid}>
              <div>
                <strong>{openRisks.length}</strong>
                <span><EnumLabel group="riskStatus" value="OPEN" /></span>
              </div>
              <div>
                <strong>{highRisks.length}</strong>
                <span><T k="overview.highSeverity" /></span>
              </div>
            </div>
            <ul className={styles.compactList}>
              {highRisks.slice(0, 3).map((risk) => (
                <li key={risk.id}>
                  <Link href={`/projects/${project.id}/risks/${risk.id}/edit`}>
                    {risk.title}
                  </Link>
                  <span>
                    <EnumLabel group="riskSeverity" value={risk.severity} /> |{" "}
                    <EnumLabel group="riskStatus" value={risk.status} />
                  </span>
                </li>
              ))}
              {highRisks.length === 0 ? <li><T k="overview.noHighRisks" /></li> : null}
            </ul>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3><T k="nav.issues" /></h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/issues`}
              >
                <T k="overview.viewIssues" />
              </Link>
            </div>
            <div className={styles.metricGrid}>
              <div>
                <strong>{openIssues.length}</strong>
                <span><EnumLabel group="issueStatus" value="OPEN" /></span>
              </div>
              <div>
                <strong>{overdueIssues.length}</strong>
                <span><T k="common.overdue" /></span>
              </div>
              <div>
                <strong>{unassignedIssues.length}</strong>
                <span><T k="common.noOwner" /></span>
              </div>
            </div>
            <ul className={styles.compactList}>
              {openIssues.slice(0, 3).map((issue) => (
                <li key={issue.id}>
                  <Link href={`/projects/${project.id}/issues/${issue.id}/edit`}>
                    {issue.title}
                  </Link>
                  <span><EnumLabel group="issueStatus" value={issue.status} /></span>
                </li>
              ))}
              {openIssues.length === 0 ? <li><T k="overview.noOpenIssues" /></li> : null}
            </ul>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3><T k="overview.recentMeetings" /></h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/meetings`}
              >
                <T k="overview.viewMeetings" />
              </Link>
            </div>
            <ul className={styles.compactList}>
              {recentMeetings.map((meeting) => (
                <li key={meeting.id}>
                  <Link href={`/projects/${project.id}/meetings/${meeting.id}`}>
                    {meeting.title}
                  </Link>
                  <span>
                    <LocalizedDateTime value={meeting.meetingDate} /> |{" "}
                    <T
                      k="meetings.actionItemCount"
                      values={{
                        count: actionItemCountByMeeting.get(meeting.id) ?? 0,
                      }}
                    />
                  </span>
                </li>
              ))}
              {recentMeetings.length === 0 ? <li><T k="overview.noMeetings" /></li> : null}
            </ul>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3><T k="overview.latestWeeklyReport" /></h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/weekly-reports`}
              >
                <T k="overview.viewReports" />
              </Link>
            </div>
            {latestWeeklyReport ? (
              <div className={styles.stack}>
                <span className={styles.statusPill}>
                  <EnumLabel
                    group="reportStatus"
                    value={latestWeeklyReport.overallStatus}
                  />
                </span>
                <p>
                  {latestWeeklyReport.weekStart} <T k="common.to" />{" "}
                  {latestWeeklyReport.weekEnd}
                </p>
                <p>{truncate(latestWeeklyReport.summary)}</p>
                <Link
                  className={styles.secondaryButton}
                  href={`/projects/${project.id}/weekly-reports/${latestWeeklyReport.id}`}
                >
                  <T k="overview.openLatestReport" />
                </Link>
              </div>
            ) : (
              <div className={styles.stack}>
                <p><T k="overview.noWeeklyReports" /></p>
                <Link
                  className={styles.primaryButton}
                  href={`/projects/${project.id}/weekly-reports/new`}
                >
                  <T k="weeklyReports.generate" />
                </Link>
              </div>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3><T k="overview.upcomingDeadlines" /></h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/work-items`}
              >
                <T k="overview.viewAll" />
              </Link>
            </div>
            <ul className={styles.compactList}>
              {upcomingWorkItems.map((item) => (
                <li key={item.id}>
                  <Link href={`/projects/${project.id}/work-items/${item.id}/edit`}>
                    {item.title}
                  </Link>
                  <span
                    className={
                      overdueWorkItems.some((overdue) => overdue.id === item.id)
                        ? styles.overdueText
                        : undefined
                    }
                  >
                    {item.dueDate && item.dueDate < today ? (
                      <T k="common.overdue" />
                    ) : (
                      <T k="common.due" />
                    )}{" "}
                    <LocalizedDate value={item.dueDate} /> |{" "}
                    <EnumLabel group="workItemStatus" value={item.status} />
                  </span>
                </li>
              ))}
              {upcomingWorkItems.length === 0 ? (
                <li><T k="overview.noUpcomingDeadlines" /></li>
              ) : null}
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}
