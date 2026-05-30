function calculateCodeMetrics(payload = {}) {
  const repositories = payload.repositories || [
    {
      name: "nexusops-frontend",
      language: "TypeScript",
      commits: 42,
      pullRequests: 12,
      bugs: 4,
      coverage: 78,
      complexity: 62,
    },
    {
      name: "nexusops-backend",
      language: "Node.js",
      commits: 36,
      pullRequests: 9,
      bugs: 3,
      coverage: 72,
      complexity: 68,
    },
    {
      name: "nexusops-services",
      language: "JavaScript",
      commits: 28,
      pullRequests: 7,
      bugs: 6,
      coverage: 61,
      complexity: 74,
    },
  ];

  const totalCommits = repositories.reduce(
    (sum, repo) => sum + repo.commits,
    0
  );

  const totalPRs = repositories.reduce(
    (sum, repo) => sum + repo.pullRequests,
    0
  );

  const totalBugs = repositories.reduce(
    (sum, repo) => sum + repo.bugs,
    0
  );

  const avgCoverage = Math.round(
    repositories.reduce((sum, repo) => sum + repo.coverage, 0) /
      repositories.length
  );

  const avgComplexity = Math.round(
    repositories.reduce((sum, repo) => sum + repo.complexity, 0) /
      repositories.length
  );

  return {
    repositories,
    summary: {
      totalCommits,
      totalPRs,
      totalBugs,
      avgCoverage,
      avgComplexity,
    },
  };
}

module.exports = {
  calculateCodeMetrics,
};