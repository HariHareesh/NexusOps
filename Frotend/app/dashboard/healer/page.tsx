"use client";

import { useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";

type Recommendation = {
  recommendationId: string;
  triggerType: string;
  service: string;
  severity: string;
  title: string;
  actions: string[];
  generatedAt: string;
};

export default function HealerPage() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const [triggerType, setTriggerType] = useState("LAMBDA_ERRORS");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getRecommendation = async () => {
    try {
      console.log("Generate Fix clicked");

      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/healer/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ triggerType }),
      });

      const data = await res.json();

      console.log("Healer fix response:", data);

      if (!res.ok) {
        setMessage(data.message || "Recommendation failed");
        return;
      }

      setRecommendation(data.recommendation);
    } catch (error: any) {
      console.log("Healer fix error:", error.message);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getRecommendation();
  }, []);

  return (
    <NexusShell>
      <header className="nx-header">
        <div>
          <p className="nx-kicker">Infra Healer</p>
          <h2 className="nx-heading">Autonomous Remediation</h2>
          <p className="nx-muted nx-lede">
            MS-03 recommends playbook-based recovery steps using the
            NexusRemediationPlaybook table.
          </p>
        </div>

        <button
          className="nx-auth-submit nx-fit-btn"
          onClick={getRecommendation}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Fix"}
        </button>
      </header>

      <section className="nx-grid nx-phase3-metrics">
        <div className="nx-card nx-metric-card">
          <p>Healer Engine</p>
          <h3 className="green">READY</h3>
          <span className="nx-muted">MS-03 Infra Healer online</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Trigger Type</p>
          <h3 className="cyan">{triggerType}</h3>
          <span className="nx-muted">Current remediation input</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Severity</p>
          <h3 className="red">{recommendation?.severity || "-"}</h3>
          <span className="nx-muted">From selected playbook</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Actions</p>
          <h3 className="yellow">{recommendation?.actions?.length || 0}</h3>
          <span className="nx-muted">Operator review steps</span>
        </div>
      </section>

      <section className="nx-content-grid nx-phase3-content">
        <div className="nx-panel nx-phase3-panel">
          <div className="nx-panel-head">
            <div>
              <h2>Recommendation Engine</h2>
              <p className="nx-muted">
                Select an incident trigger and generate recovery actions.
              </p>
            </div>

            <div className="nx-pill neutral">
              {loading ? "Generating" : "Playbook"}
            </div>
          </div>

          <div className="nx-control-stack">
            <label className="nx-muted" htmlFor="healer-trigger">
              Trigger Type
            </label>
          <select
            id="healer-trigger"
            className="nx-select"
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value)}
          >
            <option value="LAMBDA_ERRORS">LAMBDA_ERRORS</option>
            <option value="LAMBDA_THROTTLE">LAMBDA_THROTTLE</option>
            <option value="HIGH_CPU">HIGH_CPU</option>
          </select>
          </div>

          {loading && (
            <div className="nx-loading-row" aria-label="Generating recommendation">
              <article className="nx-event skeleton">
                <span className="nx-skeleton-line short" />
                <span className="nx-skeleton-line mid" />
                <span className="nx-skeleton-line" />
              </article>
            </div>
          )}

          {message && (
            <div className="nx-state-card nx-state-danger">
              <strong>Recommendation unavailable</strong>
              <p className="nx-muted">{message}</p>
            </div>
          )}

          {!loading && !message && !recommendation && (
            <div className="nx-state-card">
              <strong>No playbook loaded yet</strong>
              <p className="nx-muted">
                Choose a trigger and generate a remediation plan for operator
                review.
              </p>
            </div>
          )}

          {recommendation && (
            <article className="nx-event live nx-recommendation-card">
              <div className="nx-event-top">
                <div>
                  <strong>{recommendation.title}</strong>
                  <div className="nx-step-meta">
                    <span className="nx-mini-pill">{recommendation.service}</span>
                    <span className="nx-mini-pill">{recommendation.severity}</span>
                    <span className="nx-mini-pill">
                      {recommendation.triggerType}
                    </span>
                  </div>
                </div>

                <span>{recommendation.recommendationId}</span>
              </div>

              <div className="nx-feed">
                {recommendation.actions.map((action, index) => (
                  <div className="nx-event warning nx-step-card" key={action}>
                    <span className="nx-step-index">{index + 1}</span>
                    <div>
                      <strong>Operator Step</strong>
                      <p>{action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>

        <aside className="nx-panel nx-phase3-panel nx-phase3-sidebar">
          <div className="nx-panel-head">
            <div>
              <h2>Playbook Status</h2>
              <p className="nx-muted">Available remediation catalogs.</p>
            </div>
          </div>

          <div className="nx-posture">
            <div className="nx-posture-row">
              <div>
                <strong>Lambda Errors</strong>
                <p className="nx-muted">Available</p>
              </div>
              <span
                className="nx-dot"
                style={{ background: "#34d399", color: "#34d399" }}
              />
            </div>

            <div className="nx-posture-row">
              <div>
                <strong>Lambda Throttle</strong>
                <p className="nx-muted">Available</p>
              </div>
              <span
                className="nx-dot"
                style={{ background: "#22d3ee", color: "#22d3ee" }}
              />
            </div>

            <div className="nx-posture-row">
              <div>
                <strong>High CPU</strong>
                <p className="nx-muted">Available</p>
              </div>
              <span
                className="nx-dot"
                style={{ background: "#facc15", color: "#facc15" }}
              />
            </div>
          </div>
        </aside>
      </section>
    </NexusShell>
  );
}
