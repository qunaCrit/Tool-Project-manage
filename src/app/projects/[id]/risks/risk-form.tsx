"use client";

import { useActionState, useMemo, useState } from "react";

import {
  createRiskAction,
  type RiskFormState,
  updateRiskAction,
} from "./actions";
import { calculateRiskSeverity } from "./risk-severity";
import {
  riskLevels,
  riskStatuses,
  type RiskLevel,
  type RiskSeverity,
  type RiskStatus,
} from "@/db/schema";
import styles from "../../../page.module.css";

type RiskFormRisk = {
  id: number;
  title: string;
  description: string | null;
  probability: RiskLevel;
  impact: RiskLevel;
  severity: RiskSeverity;
  mitigation: string | null;
  owner: string | null;
  status: RiskStatus;
  dueDate: string | null;
};

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

const statusLabels: Record<RiskStatus, string> = {
  OPEN: "Open",
  MONITORING: "Monitoring",
  MITIGATED: "Mitigated",
  CLOSED: "Closed",
};

const initialState: RiskFormState = {};

export function RiskForm({
  projectId,
  risk,
}: {
  projectId: number;
  risk?: RiskFormRisk;
}) {
  const action = risk
    ? updateRiskAction.bind(null, projectId, risk.id)
    : createRiskAction.bind(null, projectId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [probability, setProbability] = useState<RiskLevel>(
    risk?.probability ?? "MEDIUM",
  );
  const [impact, setImpact] = useState<RiskLevel>(risk?.impact ?? "MEDIUM");
  const severity = useMemo(
    () => calculateRiskSeverity(probability, impact),
    [impact, probability],
  );

  return (
    <form action={formAction} className={styles.form}>
      {state.error ? <p className={styles.formError}>{state.error}</p> : null}

      <label className={styles.field}>
        <span>Title</span>
        <input
          name="title"
          type="text"
          defaultValue={risk?.title ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.title)}
        />
        {state.fieldErrors?.title ? (
          <small>{state.fieldErrors.title}</small>
        ) : null}
      </label>

      <label className={styles.field}>
        <span>Description</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={risk?.description ?? ""}
        />
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Probability</span>
          <select
            name="probability"
            value={probability}
            onChange={(event) => setProbability(event.target.value as RiskLevel)}
            aria-invalid={Boolean(state.fieldErrors?.probability)}
          >
            {riskLevels.map((level) => (
              <option key={level} value={level}>
                {levelLabels[level]}
              </option>
            ))}
          </select>
          {state.fieldErrors?.probability ? (
            <small>{state.fieldErrors.probability}</small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Impact</span>
          <select
            name="impact"
            value={impact}
            onChange={(event) => setImpact(event.target.value as RiskLevel)}
            aria-invalid={Boolean(state.fieldErrors?.impact)}
          >
            {riskLevels.map((level) => (
              <option key={level} value={level}>
                {levelLabels[level]}
              </option>
            ))}
          </select>
          {state.fieldErrors?.impact ? (
            <small>{state.fieldErrors.impact}</small>
          ) : null}
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Severity</span>
          <input readOnly type="text" value={severityLabels[severity]} />
        </label>

        <label className={styles.field}>
          <span>Status</span>
          <select
            name="status"
            defaultValue={risk?.status ?? "OPEN"}
            aria-invalid={Boolean(state.fieldErrors?.status)}
          >
            {riskStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          {state.fieldErrors?.status ? (
            <small>{state.fieldErrors.status}</small>
          ) : null}
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Owner</span>
          <input name="owner" type="text" defaultValue={risk?.owner ?? ""} />
        </label>

        <label className={styles.field}>
          <span>Due date</span>
          <input
            name="dueDate"
            type="date"
            defaultValue={risk?.dueDate ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          />
          {state.fieldErrors?.dueDate ? (
            <small>{state.fieldErrors.dueDate}</small>
          ) : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Mitigation</span>
        <textarea
          name="mitigation"
          rows={4}
          defaultValue={risk?.mitigation ?? ""}
        />
      </label>

      <button className={styles.primaryButton} type="submit" disabled={isPending}>
        {isPending ? "Saving..." : risk ? "Save Risk" : "Create Risk"}
      </button>
    </form>
  );
}
