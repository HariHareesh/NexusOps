"use client";

import { useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";
import { socket } from "../../../Lib/socket";

type DoraMetric = {
  value: number;
  unit: string;
  status: string;
};

type Deployment = {
  deploymentId: string;
  service: string;
  status: string;
  environment: string;
  deployedAt: string;
};

export default function CicdPage() {
  const [metrics, setMetrics] = useState<Record<string, DoraMetric>>({});
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCicdMetrics = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/cicd/metrics");
      const data = await res.json();

      setMetrics(data.metrics || {});
      setDeployments(data.deployments || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCicdMetrics();
  }, []);
 useEffect(() => {
  const handleRealtimeEvent = (event: any) => {
    if (event.type === "CICD_METRICS_UPDATED") {
      console.log("CI/CD realtime update:", event);

      if (event.data?.metrics) {
        setMetrics(event.data.metrics);
      }

      if (event.data?.deployments) {
        setDeployments(event.data.deployments);
      }
    }
  };

  socket.on("nexus:event", handleRealtimeEvent);

  return () => {
    socket.off("nexus:event", handleRealtimeEvent);
  };
}, []);

  const metricCards = [
    ["Deployment Frequency", metrics.deploymentFrequency],
    ["Lead Time", metrics.leadTimeForChanges],
    ["Change Failure Rate", metrics.changeFailureRate],
    ["MTTR", metrics.meanTimeToRecovery],
  ];

  const riskScore =
    deployments.filter((item) => item.status !== "SUCCESS").length * 35;

  return (
    <NexusShell>
      <header className="nx-header">
        <div>
          <p className="nx-kicker">CI/CD Intelligence</p>
          <h2 className="nx-heading">Deployment Intelligence</h2>
          <p className="nx-muted nx-lede">
            MS-05 tracks DORA metrics, deployment health, rollback readiness,
            and release risk posture.
          </p>
        </div>

        <button className="nx-auth-submit nx-fit-btn" onClick={loadCicdMetrics}>
          Refresh Metrics
        </button>
      </header>

      <section className="nx-grid">
        {metricCards.map(([label, metric]: any) => (
          <div className="nx-card nx-metric-card" key={label}>
            <p>{label}</p>
            <h3 className={metric?.status === "ELITE" ? "green" : "cyan"}>
              {metric ? `${metric.value}` : "-"}
            </h3>
            <span className="nx-muted">
              {metric ? `${metric.unit} · ${metric.status}` : "Loading"}
            </span>
          </div>
        ))}
      </section>

      <section className="nx-content-grid">
        <div className="nx-panel">
          <div className="nx-panel-head">
            <div>
              <h2>Pipeline Activity</h2>
              <p className="nx-muted">
                Deployment stream from CI/CD Intelligence Lambda.
              </p>
            </div>

            <div className="nx-pill neutral">
              {loading ? "Loading" : `${deployments.length} deployments`}
            </div>
          </div>

          <div className="nx-feed">
            {deployments.map((deployment) => (
              <article
                className={
                  deployment.status === "SUCCESS"
                    ? "nx-event live"
                    : "nx-event warning"
                }
                key={deployment.deploymentId}
              >
                <div className="nx-event-top">
                  <div>
                    <strong>{deployment.service}</strong>
                    <p className="nx-muted">
                      {deployment.deploymentId} · {deployment.environment}
                    </p>
                  </div>

                  <span>{deployment.status}</span>
                </div>

                <p className="nx-muted">{deployment.deployedAt}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="nx-panel">
          <h2>Deployment Risk</h2>

          <div className="nx-risk-gauge">
            <div className="nx-risk-number">{riskScore}</div>
            <p className="nx-muted">Calculated deployment risk</p>
          </div>

          <div className="nx-posture">
            <div className="nx-posture-row">
              <div>
                <strong>Pipeline Engine</strong>
                <p className="nx-muted">nexus-cicd-intelligence</p>
              </div>
              <span className="nx-dot" style={{ background: "#22d3ee" }} />
            </div>

            <div className="nx-posture-row">
              <div>
                <strong>DORA Metrics</strong>
                <p className="nx-muted">Generated</p>
              </div>
              <span className="nx-dot" style={{ background: "#34d399" }} />
            </div>

            <div className="nx-posture-row">
              <div>
                <strong>Rollback Watch</strong>
                <p className="nx-muted">
                  {
                    deployments.filter(
                      (deployment) => deployment.status !== "SUCCESS"
                    ).length
                  }{" "}
                  flagged
                </p>
              </div>
              <span className="nx-dot" style={{ background: "#facc15" }} />
            </div>
          </div>
        </aside>
      </section>
    </NexusShell>
  );
}