function analyzePullRequests(payload = {}) {
  const pullRequests = payload.pullRequests || [
    {
      id: "PR-101",
      title: "Add Data Nexus query analytics",
      author: "Hari",
      status: "MERGED",
      reviewTimeHours: 4,
      risk: "LOW",
      filesChanged: 8,
    },
    {
      id: "PR-102",
      title: "Refactor backend API routes",
      author: "Hari",
      status: "OPEN",
      reviewTimeHours: 11,
      risk: "MEDIUM",
      filesChanged: 17,
    },
    {
      id: "PR-103",
      title: "Update Lambda deployment config",
      author: "OpsBot",
      status: "REVIEW",
      reviewTimeHours: 18,
      risk: "HIGH",
      filesChanged: 24,
    },
  ];

  const merged = pullRequests.filter((pr) => pr.status === "MERGED").length;
  const open = pullRequests.filter((pr) => pr.status === "OPEN").length;
  const review = pullRequests.filter((pr) => pr.status === "REVIEW").length;

  const avgReviewTime = Math.round(
    pullRequests.reduce((sum, pr) => sum + pr.reviewTimeHours, 0) /
      pullRequests.length
  );

  const highRiskPRs = pullRequests.filter((pr) => pr.risk === "HIGH");

  return {
    pullRequests,
    summary: {
      merged,
      open,
      review,
      avgReviewTime,
      highRiskCount: highRiskPRs.length,
    },
  };
}

module.exports = {
  analyzePullRequests,
};