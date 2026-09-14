import { and, desc, eq, type SQL } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  projects,
  risks,
  riskSeverities,
  riskStatuses,
  type RiskSeverity,
} from "@/db/schema";
import { EnumLabel, T } from "@/i18n";
import { DeleteRiskButton } from "./delete-risk-button";
import styles from "../../../page.module.css";

const severityClasses: Record<RiskSeverity, string> = {
  LOW: styles.severityLOW,
  MEDIUM: styles.severityMEDIUM,
  HIGH: styles.severityHIGH,
};

const errorMessageKeys: Record<string, Parameters<typeof T>[0]["k"]> = {
  "delete-failed": "error.riskDeleteFailed",
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
          <p className={styles.eyebrow}><T k="app.eyebrow" /></p>
          <h1><T k="risks.title" /></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/projects"><T k="nav.projects" /></Link>
          <Link href={`/projects/${project.id}`}><T k="nav.overview" /></Link>
          <Link href={`/projects/${project.id}/work-items`}><T k="nav.workItems" /></Link>
          <Link href={`/projects/${project.id}/meetings`}><T k="nav.meetings" /></Link>
          <Link
            className={styles.activeNavItem}
            href={`/projects/${project.id}/risks`}
          >
            <T k="nav.risks" />
          </Link>
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
            <h2><T k="risks.title" /></h2>
          </div>
          <div className={styles.actionRow}>
            <Link className={styles.secondaryButton} href={`/projects/${project.id}`}>
              <T k="common.backToOverview" />
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/risks/new`}
            >
              <T k="risks.add" />
            </Link>
          </div>
        </header>

        {error && errorMessageKeys[error] ? (
          <p className={styles.formError}><T k={errorMessageKeys[error]} /></p>
        ) : null}

        <form className={styles.filterBar}>
          <label className={styles.field}>
            <span><T k="common.status" /></span>
            <select name="status" defaultValue={selectedStatus ?? ""}>
              <option value=""><T k="projects.allStatuses" /></option>
              {riskStatuses.map((riskStatus) => (
                <option key={riskStatus} value={riskStatus}>
                  <EnumLabel group="riskStatus" value={riskStatus} />
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span><T k="risks.severity" /></span>
            <select name="severity" defaultValue={selectedSeverity ?? ""}>
              <option value=""><T k="risks.allSeverities" /></option>
              {riskSeverities.map((riskSeverity) => (
                <option key={riskSeverity} value={riskSeverity}>
                  <EnumLabel group="riskSeverity" value={riskSeverity} />
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span><T k="common.owner" /></span>
            <input name="owner" type="text" defaultValue={selectedOwner} />
          </label>

          <div className={styles.filterActions}>
            <button className={styles.primaryButton} type="submit">
              <T k="common.applyFilters" />
            </button>
            <Link
              className={styles.secondaryButton}
              href={`/projects/${project.id}/risks`}
            >
              <T k="common.reset" />
            </Link>
          </div>
        </form>

        {riskList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3><T k="risks.noFoundTitle" /></h3>
            <p><T k="risks.noFoundBody" /></p>
            <Link
              className={styles.primaryButton}
              href={`/projects/${project.id}/risks/new`}
            >
              <T k="risks.add" />
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><T k="common.title" /></th>
                  <th><T k="risks.probability" /></th>
                  <th><T k="risks.impact" /></th>
                  <th><T k="risks.severity" /></th>
                  <th><T k="common.owner" /></th>
                  <th><T k="common.status" /></th>
                  <th><T k="common.due" /></th>
                  <th><T k="common.actions" /></th>
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
                    <td><EnumLabel group="riskLevel" value={risk.probability} /></td>
                    <td><EnumLabel group="riskLevel" value={risk.impact} /></td>
                    <td>
                      <span
                        className={`${styles.severityPill} ${
                          severityClasses[risk.severity]
                        }`}
                      >
                        <EnumLabel group="riskSeverity" value={risk.severity} />
                      </span>
                    </td>
                    <td>{formatValue(risk.owner)}</td>
                    <td>
                      <span className={styles.statusPill}>
                        <EnumLabel group="riskStatus" value={risk.status} />
                      </span>
                    </td>
                    <td>{formatValue(risk.dueDate)}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <Link
                          className={styles.secondaryButton}
                          href={`/projects/${project.id}/risks/${risk.id}/edit`}
                        >
                          <T k="common.edit" />
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
