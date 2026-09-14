import type { RiskLevel, RiskSeverity } from "@/db/schema";

export const calculateRiskSeverity = (
  probability: RiskLevel,
  impact: RiskLevel,
): RiskSeverity => {
  if (
    (probability === "HIGH" && impact !== "LOW") ||
    (impact === "HIGH" && probability !== "LOW")
  ) {
    return "HIGH";
  }

  if (
    (probability === "MEDIUM" && impact === "MEDIUM") ||
    probability === "HIGH" ||
    impact === "HIGH"
  ) {
    return "MEDIUM";
  }

  return "LOW";
};
