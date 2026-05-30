"use client";

import { useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";

type Threat = {
  cveId: string;
  service: string;
  severity: string;
  threatLevel: string;
  riskScore: number;
  description: string;
  remediation: string;
  detectedAt: string;
};

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const scanThreats = async () => {
    try {
      console.log("Run Threat Scan clicked");

      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/threats/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      console.log("Threat scan response:", data);

      if (!res.ok) {
        setMessage(data.message || "Threat scan failed");
        return;
      }

      setThreats(data.threats || []);
    } catch (error: any) {
      console.log("Threat scan error:", error.message);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    scanThreats();
  }, []);

  const highestRisk =
    threats.length > 0 ? Math.max(...threats.map((item) => item.riskScore)) : 0;

  return (
    <NexusShell>
      <header className="nx-header">
        <div>
          <p className="nx-kicker">Threat Sentinel</p>
          <h2 className="nx-heading">Threat Intelligence</h2>
          <p className="nx-muted nx-lede">
            AI-assisted CVE enrichment, severity scoring, and remediation
            readiness from NexusCVERegistry.
          </p>
        </div>

        <button
          className="nx-auth-submit nx-fit-btn"
          onClick={scanThreats}
          disabled={loading}
        >
          {loading ? "Scanning..." : "Run Threat Scan"}
        </button>
      </header>

      <section className="nx-grid nx-phase3-metrics">
        <div className="nx-card nx-metric-card">
          <p>Total Threats</p>
          <h3 className="cyan">{threats.length}</h3>
          <span className="nx-muted">Detected from CVE registry</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Highest Risk</p>
          <h3 className="red">{highestRisk}</h3>
          <span className="nx-muted">Calculated risk score</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Critical</p>
          <h3 className="yellow">
            {threats.filter((item) => item.severity === "CRITICAL").length}
          </h3>
          <span className="nx-muted">Requires immediate review</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Engine</p>
          <h3 className="green">ACTIVE</h3>
          <span className="nx-muted">MS-02 Threat Sentinel</span>
        </div>
      </section>

      <section className="nx-panel nx-phase3-panel">
        <div className="nx-panel-head">
          <div>
            <h2>Threat Feed</h2>
            <p className="nx-muted">
              Live scan results returned by backend Express route and Threat
              Sentinel Lambda.
            </p>
          </div>

          <div className="nx-pill neutral">
            {loading ? "Scanning" : `${threats.length} Findings`}
          </div>
        </div>

        {loading && (
          <div className="nx-loading-row" aria-label="Scanning threat registry">
            {[0, 1, 2].map((item) => (
              <article className="nx-event skeleton" key={item}>
                <span className="nx-skeleton-line short" />
                <span className="nx-skeleton-line mid" />
                <span className="nx-skeleton-line" />
              </article>
            ))}
          </div>
        )}

        {message && (
          <div className="nx-state-card nx-state-danger">
            <strong>Threat scan unavailable</strong>
            <p className="nx-muted">{message}</p>
          </div>
        )}

        {!loading && !message && threats.length === 0 && (
          <div className="nx-state-card nx-state-success">
            <strong>No active threats detected</strong>
            <p className="nx-muted">
              Threat Sentinel completed the scan and did not return CVE records
              for operator review.
            </p>
          </div>
        )}

        <div className="nx-feed nx-threat-feed">
          {threats.map((threat) => (
            <article className="nx-event danger" key={threat.cveId}>
              <div className="nx-event-top">
                <div>
                  <strong>{threat.cveId}</strong>
                  <div className="nx-threat-meta">
                    <span className="nx-mini-pill">{threat.service}</span>
                    <span className="nx-mini-pill">{threat.severity}</span>
                    <span className="nx-mini-pill">{threat.threatLevel}</span>
                  </div>
                </div>

                <span>Risk {threat.riskScore}</span>
              </div>

              <p>{threat.description}</p>

              <p className="nx-muted">
                Recommended action: {threat.remediation}
              </p>
            </article>
          ))}
        </div>
      </section>
    </NexusShell>
  );
}
