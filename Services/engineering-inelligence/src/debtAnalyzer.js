function analyzeTechDebt(payload = {}) {
  const debtItems = payload.debtItems || [
    {
      area: "Frontend State Management",
      severity: "MEDIUM",
      score: 62,
      reason: "Several dashboard states can be grouped into reusable hooks",
    },
    {
      area: "Backend Route Layer",
      severity: "LOW",
      score: 34,
      reason: "Express routes are clean but can use shared validation middleware",
    },
    {
      area: "Lambda Service Boundaries",
      severity: "HIGH",
      score: 81,
      reason: "Multiple intelligence services need stronger event contracts",
    },
    {
      area: "Testing Coverage",
      severity: "HIGH",
      score: 76,
      reason: "Core orchestration APIs need integration tests",
    },
  ];

  const criticalDebt = debtItems.filter(
    (item) => item.severity === "HIGH"
  ).length;

  const averageDebtScore = Math.round(
    debtItems.reduce((sum, item) => sum + item.score, 0) / debtItems.length
  );

  return {
    debtItems,
    summary: {
      criticalDebt,
      averageDebtScore,
      totalDebtAreas: debtItems.length,
    },
  };
}

module.exports = {
  analyzeTechDebt,
};