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
  type IssueStatus,
  type ProjectStatus,
  type ReportStatus,
  type RiskSeverity,
  type RiskStatus,
  type WorkItemStatus,
} from "@/db/schema";
import { DeleteProjectButton } from "../delete-project-button";
import styles from "../../page.module.css";

const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

const workItemStatusLabels: Record<WorkItemStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  BLOCKED: "Blocked",
};

const riskStatusLabels: Record<RiskStatus, string> = {
  OPEN: "Open",
  MONITORING: "Monitoring",
  MITIGATED: "Mitigated",
  CLOSED: "Closed",
};

const riskSeverityLabels: Record<RiskSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const issueStatusLabels: Record<IssueStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const reportStatusLabels: Record<ReportStatus, string> = {
  GREEN: "Green",
  YELLOW: "Yellow",
  RED: "Red",
};

const formatValue = (value: string | null) => value || "-";

const todayInput = () => new Date().toISOString().slice(0, 10);

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

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

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Overview</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects">Projects</Link>
          <Link className={styles.activeNavItem} href={`/projects/${project.id}`}>
            Project Overview
          </Link>
          <Link href={`/projects/${project.id}/work-items`}>Work Items</Link>
          <Link href={`/projects/${project.id}/meetings`}>Meetings</Link>
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
            <p className={styles.eyebrow}>Project Detail</p>
            <h2>{project.name}</h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href="/projects">
              Project List
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/work-items`}
            >
              Work Items
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/meetings`}
            >
              Meetings
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/risks`}
            >
              Risks
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/issues`}
            >
              Issues
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/weekly-reports/new`}
            >
              Generate Weekly Report
            </Link>
            <Link className={styles.primaryButton} href={`/projects/${project.id}/edit`}>
              Edit Project
            </Link>
            <DeleteProjectButton projectId={project.id} projectName={project.name} />
          </div>
        </header>

        <section className={styles.overviewGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Project Summary</h3>
              <span className={styles.statusPill}>{statusLabels[project.status]}</span>
            </div>
            <dl className={styles.detailList}>
              <div>
                <dt>Owner</dt>
                <dd>{formatValue(project.owner)}</dd>
              </div>
              <div>
                <dt>Customer</dt>
                <dd>{formatValue(project.customer)}</dd>
              </div>
              <div>
                <dt>Start date</dt>
                <dd>{formatValue(project.startDate)}</dd>
              </div>
              <div>
                <dt>End date</dt>
                <dd>{formatValue(project.endDate)}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.panel}>
            <h3>Description</h3>
            <p>{formatValue(project.description)}</p>
          </div>

          <div className={styles.panel}>
            <h3>Objective</h3>
            <p>{formatValue(project.objective)}</p>
          </div>

          <div className={styles.panel}>
            <h3>Health Note</h3>
            <p>{formatValue(project.healthNote)}</p>
          </div>
        </section>

        <section className={styles.overviewGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Work Items</h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/work-items`}
              >
                View Work Items
              </Link>
            </div>
            <div className={styles.metricGrid}>
              <div>
                <strong>{workSummary.total}</strong>
                <span>Total</span>
              </div>
              <div>
                <strong>{workSummary.todo}</strong>
                <span>Todo</span>
              </div>
              <div>
                <strong>{workSummary.inProgress}</strong>
                <span>In progress</span>
              </div>
              <div>
                <strong>{workSummary.done}</strong>
                <span>Done</span>
              </div>
              <div>
                <strong>{workSummary.overdue}</strong>
                <span>Overdue</span>
              </div>
            </div>
            <p>{completion}% complete, {workSummary.blocked} blocked.</p>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Risks</h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/risks`}
              >
                View Risks
              </Link>
            </div>
            <div className={styles.metricGrid}>
              <div>
                <strong>{openRisks.length}</strong>
                <span>Open</span>
              </div>
              <div>
                <strong>{highRisks.length}</strong>
                <span>High severity</span>
              </div>
            </div>
            <ul className={styles.compactList}>
              {highRisks.slice(0, 3).map((risk) => (
                <li key={risk.id}>
                  <Link href={`/projects/${project.id}/risks/${risk.id}/edit`}>
                    {risk.title}
                  </Link>
                  <span>
                    {riskSeverityLabels[risk.severity]} |{" "}
                    {riskStatusLabels[risk.status]}
                  </span>
                </li>
              ))}
              {highRisks.length === 0 ? <li>No high severity risks.</li> : null}
            </ul>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Issues</h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/issues`}
              >
                View Issues
              </Link>
            </div>
            <div className={styles.metricGrid}>
              <div>
                <strong>{openIssues.length}</strong>
                <span>Open</span>
              </div>
              <div>
                <strong>{overdueIssues.length}</strong>
                <span>Overdue</span>
              </div>
              <div>
                <strong>{unassignedIssues.length}</strong>
                <span>No owner</span>
              </div>
            </div>
            <ul className={styles.compactList}>
              {openIssues.slice(0, 3).map((issue) => (
                <li key={issue.id}>
                  <Link href={`/projects/${project.id}/issues/${issue.id}/edit`}>
                    {issue.title}
                  </Link>
                  <span>{issueStatusLabels[issue.status]}</span>
                </li>
              ))}
              {openIssues.length === 0 ? <li>No open issues.</li> : null}
            </ul>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Recent Meetings</h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/meetings`}
              >
                View Meetings
              </Link>
            </div>
            <ul className={styles.compactList}>
              {recentMeetings.map((meeting) => (
                <li key={meeting.id}>
                  <Link href={`/projects/${project.id}/meetings/${meeting.id}`}>
                    {meeting.title}
                  </Link>
                  <span>{formatDateTime(meeting.meetingDate)}</span>
                </li>
              ))}
              {recentMeetings.length === 0 ? <li>No meetings yet.</li> : null}
            </ul>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Latest Weekly Report</h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/weekly-reports`}
              >
                View Reports
              </Link>
            </div>
            {latestWeeklyReport ? (
              <div className={styles.stack}>
                <span className={styles.statusPill}>
                  {reportStatusLabels[latestWeeklyReport.overallStatus]}
                </span>
                <p>
                  {latestWeeklyReport.weekStart} to {latestWeeklyReport.weekEnd}
                </p>
                <p>{truncate(latestWeeklyReport.summary)}</p>
                <Link
                  className={styles.secondaryButton}
                  href={`/projects/${project.id}/weekly-reports/${latestWeeklyReport.id}`}
                >
                  Open Latest Report
                </Link>
              </div>
            ) : (
              <div className={styles.stack}>
                <p>No weekly reports yet.</p>
                <Link
                  className={styles.primaryButton}
                  href={`/projects/${project.id}/weekly-reports/new`}
                >
                  Generate Weekly Report
                </Link>
              </div>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Upcoming Deadlines</h3>
              <Link
                className={styles.secondaryButton}
                href={`/projects/${project.id}/work-items`}
              >
                View All
              </Link>
            </div>
            <ul className={styles.compactList}>
              {upcomingWorkItems.map((item) => (
                <li key={item.id}>
                  <Link href={`/projects/${project.id}/work-items/${item.id}/edit`}>
                    {item.title}
                  </Link>
                  <span>
                    {workItemStatusLabels[item.status]} | Due {item.dueDate}
                  </span>
                </li>
              ))}
              {upcomingWorkItems.length === 0 ? (
                <li>No upcoming work item deadlines.</li>
              ) : null}
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}
