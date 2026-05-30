"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type RepoMetric = {
  name: string;
  commits: number;
  pullRequests: number;
  coverage: number;
  complexity: number;
};

type EngineeringChartsProps = {
  repositories: RepoMetric[];
};

export default function EngineeringCharts({
  repositories,
}: EngineeringChartsProps) {
  return (
    <div className="nx-panel nx-charts-panel">
      <div className="nx-panel-head">
        <div>
          <h2>Engineering Activity Trends</h2>
          <p className="nx-muted">Repository delivery and quality signals over current data.</p>
        </div>
      </div>

      <div className="nx-engineering-charts">
        <div className="nx-card nx-chart-card">
          <h3>Commits vs Pull Requests</h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={repositories}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148, 163, 184, 0.24)", borderRadius: 12 }} />
              <Bar dataKey="commits" fill="#22d3ee" />
              <Bar dataKey="pullRequests" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="nx-card nx-chart-card">
          <h3>Coverage vs Complexity</h3>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={repositories}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148, 163, 184, 0.24)", borderRadius: 12 }} />
              <Line
                type="monotone"
                dataKey="coverage"
                stroke="#facc15"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="complexity"
                stroke="#fb7185"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
