"use client";

import { useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";
import Leaderboard from "../../../components/engineering/Leaderboard";
import DebtHeatmap from "../../../components/engineering/DebtHeatmap";
import EngineeringCharts from "../../../components/engineering/EngineeringCharts";

type RepoMetric = {
  name: string;
  language: string;
  commits: number;
  pullRequests: number;
  bugs: number;
  coverage: number;
  complexity: number;
};

type PullRequest = {
  id: string;
  title: string;
  author: string;
  status: string;
  reviewTimeHours: number;
  risk: string;
  filesChanged: number;
};

type DebtItem = {
  area: string;
  severity: string;
  score: number;
  reason: string;
};

type EngineeringResult = {
  codeMetrics: {
    repositories: RepoMetric[];
    summary: {
      totalCommits: number;
      totalPRs: number;
      totalBugs: number;
      avgCoverage: number;
      avgComplexity: number;
    };
  };
  prAnalysis: {
    pullRequests: PullRequest[];
    summary: {
      merged: number;
      open: number;
      review: number;
      avgReviewTime: number;
      highRiskCount: number;
    };
  };
  debtAnalysis: {
    debtItems: DebtItem[];
    summary: {
      criticalDebt: number;
      averageDebtScore: number;
      totalDebtAreas: number;
    };
  };
};

export default function EngineeringPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EngineeringResult | null>(null);

  const loadEngineeringIntel = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/engineering/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngineeringIntel();
  }, []);

  const leaderboardUsers = [
    {
      rank: 1,
      name: "Hari",
      score: 98,
      commits: 42,
      prs: 12,
    },
    {
      rank: 2,
      name: "OpsBot",
      score: 91,
      commits: 36,
      prs: 9,
    },
    {
      rank: 3,
      name: "DevCore",
      score: 84,
      commits: 28,
      prs: 7,
    },
  ];

  return (
    <NexusShell>
      <header className="nx-header">
        <div>
          <p className="nx-kicker">Engineering Intelligence</p>
          <h2 className="nx-heading">AI Engineering Analytics</h2>
          <p className="nx-muted nx-lede">
            MS-08 analyzes repositories, pull requests, engineering risk, and
            technical debt across NexusOps X.
          </p>
        </div>

        <button
          className="nx-auth-submit nx-fit-btn"
          onClick={loadEngineeringIntel}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Refresh Engineering Intel"}
        </button>
      </header>

      {!result ? (
        <section className="nx-panel nx-phase-main">
          {loading ? (
            <div className="nx-phase-skeleton" aria-label="Loading engineering intelligence">
              <div className="nx-grid">
                {[0, 1, 2, 3].map((item) => (
                  <div className="nx-card nx-metric-card nx-skeleton-card" key={item}>
                    <div className="nx-skeleton-line short" />
                    <div className="nx-skeleton-line" />
                    <div className="nx-skeleton-line mid" />
                  </div>
                ))}
              </div>

              <div className="nx-engineering-charts">
                {[0, 1].map((item) => (
                  <div className="nx-card nx-chart-card" key={item}>
                    <div className="nx-skeleton-line short" />
                    <div className="nx-skeleton-chart" />
                  </div>
                ))}
              </div>

              <div className="nx-feed">
                {[0, 1, 2].map((item) => (
                  <article className="nx-event skeleton" key={item}>
                    <div className="nx-skeleton-line mid" />
                    <div className="nx-skeleton-line" />
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="nx-empty-state">
              <strong>No engineering data loaded</strong>
              <p className="nx-muted">
                Refresh engineering intelligence to populate repository, PR, and debt insights.
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="nx-grid">
            <div className="nx-card nx-metric-card">
              <p>Total Commits</p>
              <h3 className="cyan">{result.codeMetrics.summary.totalCommits}</h3>
              <span className="nx-muted">Repository activity</span>
            </div>

            <div className="nx-card nx-metric-card">
              <p>Total PRs</p>
              <h3 className="green">{result.codeMetrics.summary.totalPRs}</h3>
              <span className="nx-muted">Engineering throughput</span>
            </div>

            <div className="nx-card nx-metric-card">
              <p>Avg Coverage</p>
              <h3 className="yellow">
                {result.codeMetrics.summary.avgCoverage}%
              </h3>
              <span className="nx-muted">Testing health</span>
            </div>

            <div className="nx-card nx-metric-card">
              <p>Critical Debt</p>
              <h3 className="red">
                {result.debtAnalysis.summary.criticalDebt}
              </h3>
              <span className="nx-muted">High severity debt areas</span>
            </div>
          </section>

          <Leaderboard users={leaderboardUsers} />
          <DebtHeatmap items={result.debtAnalysis.debtItems} />
          <EngineeringCharts repositories={result.codeMetrics.repositories} />

          <section className="nx-data-layout nx-phase-layout">
            <main className="nx-panel nx-phase-main">
              <div className="nx-panel-head">
                <div>
                  <h2>Repository Intelligence</h2>
                  <p className="nx-muted">
                    Repository activity, health indicators, and PR risk context.
                  </p>
                </div>
              </div>

              <div className="nx-result-table">
                <table>
                  <thead>
                    <tr>
                      <th>Repository</th>
                      <th>Language</th>
                      <th>Commits</th>
                      <th>PRs</th>
                      <th>Bugs</th>
                      <th>Coverage</th>
                      <th>Complexity</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.codeMetrics.repositories.map((repo) => (
                      <tr key={repo.name}>
                        <td>{repo.name}</td>
                        <td>{repo.language}</td>
                        <td>{repo.commits}</td>
                        <td>{repo.pullRequests}</td>
                        <td>{repo.bugs}</td>
                        <td>{repo.coverage}%</td>
                        <td>{repo.complexity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="nx-feed">
                <h3>Pull Request Intelligence</h3>

                {result.prAnalysis.pullRequests.map((pr) => (
                  <article
                    className={
                      pr.risk === "HIGH"
                        ? "nx-event danger"
                        : pr.risk === "MEDIUM"
                        ? "nx-event warning"
                        : "nx-event live"
                    }
                    key={pr.id}
                  >
                    <div className="nx-event-top">
                      <div>
                        <strong>
                          {pr.id} - {pr.title}
                        </strong>
                        <p className="nx-muted">
                          Author: {pr.author} - Files changed: {pr.filesChanged}
                        </p>
                      </div>

                      <span>{pr.risk}</span>
                    </div>

                    <p className="nx-muted">
                      Status: {pr.status} - Review time: {pr.reviewTimeHours}h
                    </p>
                  </article>
                ))}
              </div>
            </main>

            <aside className="nx-panel nx-phase-sidebar">
              <div className="nx-panel-head">
                <div>
                  <h2>Tech Debt Heatmap</h2>
                  <p className="nx-muted">
                    Prioritized debt areas by severity and score.
                  </p>
                </div>
              </div>

              <div className="nx-feed">
                {result.debtAnalysis.debtItems.map((debt) => (
                  <article
                    className={
                      debt.severity === "HIGH"
                        ? "nx-event danger"
                        : debt.severity === "MEDIUM"
                        ? "nx-event warning"
                        : "nx-event live"
                    }
                    key={debt.area}
                  >
                    <div className="nx-event-top">
                      <div>
                        <strong>{debt.area}</strong>
                        <p>{debt.reason}</p>
                      </div>

                      <span>{debt.score}</span>
                    </div>

                    <p className="nx-muted">Severity: {debt.severity}</p>
                  </article>
                ))}
              </div>
            </aside>
          </section>
        </>
      )}
    </NexusShell>
  );
}
