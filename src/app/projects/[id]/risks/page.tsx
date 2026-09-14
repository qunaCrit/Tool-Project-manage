import { and, desc, eq, type SQL } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  projects,
  risks,
  riskSeverities,
  riskStatuses,
  type RiskLevel,
  type RiskSeverity,
  type RiskStatus,
} from "@/db/schema";
import { DeleteRiskButton } from "./delete-risk-button";
import styles from "../../../page.module.css";

const levelLabels: Record<RiskLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const severityLabels: Record<RiskSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const severityClasses: Record<RiskSeverity, string> = {
  LOW: styles.severityLOW,
  MEDIUM: styles.severityMEDIUM,
  HIGH: styles.severityHIGH,
};

const statusLabels: Record<RiskStatus, string> = {
  OPEN: "Open",
  MONITORING: "Monitoring",
  MITIGATED: "Mitigated",
  CLOSED: "Closed",
};

const errorMessages: Record<string, string> = {
  "delete-failed": "Could not delete the risk. Please try again.",
};

const formatValue = (value: string | null) => value || "-";

const isValidFilter = <T extends string>(
  value: string | undefined,
  validValues: readonly T[],
): value is T => Boolean(value && validValues.includes(value as T));

export default async function RisksPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    status?: string;
    severity?: string;
    owner?: string;
    error?: string;
  }>;
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

  const { status, severity, owner, error } = await searchParams;
  const selectedStatus = isValidFilter(status, riskStatuses) ? status : undefined;
  const selectedSeverity = isValidFilter(severity, riskSeverities)
    ? severity
    : undefined;
  const selectedOwner = typeof owner === "string" ? owner.trim() : "";
  const filters: SQL[] = [eq(risks.projectId, projectId)];

  if (selectedStatus) {
    filters.push(eq(risks.status, selectedStatus));
  }

  if (selectedSeverity) {
    filters.push(eq(risks.severity, selectedSeverity));
  }

  if (selectedOwner) {
    filters.push(eq(risks.owner, selectedOwner));
  }

  const riskList = await db
    .select()
    .from(risks)
    .where(and(...filters))
    .orderBy(desc(risks.updatedAt));

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Local PM Assistant</p>
          <h1>Risks</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects">Projects</Link>
          <Link href={`/projects/${project.id}`}>Project Overview</Link>
          <Link href={`/projects/${project.id}/work-items`}>Work Items</Link>
          <Link href={`/projects/${project.id}/meetings`}>Meetings</Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/risks`}
          >
            Risks
          </Link>
          <span>Issues</span>
          <span>Weekly Reports</span>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{project.name}</p>
            <h2>Risks</h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              Back to overview
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/risks/new`}
            >
              Add Risk
            </Link>
          </div>
        </header>

        {error && errorMessages[error] ? (
          <p className={styles.formError}>{errorMessages[error]}</p>
        ) : null}

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span>Status</span>
            <select name="status" defaultValue={selectedStatus ?? ""}>
              <option value="">All statuses</option>
              {riskStatuses.map((riskStatus) => (
                <option key={riskStatus} value={riskStatus}>
                  {statusLabels[riskStatus]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Severity</span>
            <select name="severity" defaultValue={selectedSeverity ?? ""}>
              <option value="">All severities</option>
              {riskSeverities.map((riskSeverity) => (
                <option key={riskSeverity} value={riskSeverity}>
                  {severityLabels[riskSeverity]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Owner</span>
            <input name="owner" type="text" defaultValue={selectedOwner} />
          </label>

          <div className={styles.filterActions}>
            <button className={styles.primaryButton} type="submit">
              Apply filters
            </button>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/risks`}
            >
              Reset
            </Link>
          </div>
        </form>

        {riskList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No risks found</h3>
            <p>Add the first risk for this project.</p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/risks/new`}
            >
              Add Risk
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Probability</th>
                  <th>Impact</th>
                  <th>Severity</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Due date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riskList.map((risk) => (
                  <tr
                    className={
                      risk.severity === "HIGH" ? styles.highSeverityRow : undefined
                    }
                    key={risk.id}
                  >
                    <td>
                      <Link
                        className={styles.projectLink}
                        href={`/projects/${project.id}/risks/${risk.id}/edit`}
                      >
                        {risk.title}
                      </Link>
                    </td>
                    <td>{levelLabels[risk.probability]}</td>
                    <td>{levelLabels[risk.impact]}</td>
                    <td>
                      <span
                        className={`${styles.severityPill} ${
                          severityClasses[risk.severity]
                        }`}
                      >
                        {severityLabels[risk.severity]}
                      </span>
                    </td>
                    <td>{formatValue(risk.owner)}</td>
                    <td>
                      <span className={styles.statusPill}>
                        {statusLabels[risk.status]}
                      </span>
                    </td>
                    <td>{formatValue(risk.dueDate)}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/risks/${risk.id}/edit`}
                        >
                          Edit
                        </Link>
                        <DeleteRiskButton
                          projectId={project.id}
                          riskId={risk.id}
                          riskTitle={risk.title}
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
