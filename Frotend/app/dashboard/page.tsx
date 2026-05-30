"use client";

import { useEffect, useState } from "react";
import NexusShell from "../../components/NexusShell";
import { socket } from "../../Lib/socket";

function formatEventData(data: any) {
  if (!data) return "No payload attached";
  if (typeof data === "string") return data;
  return JSON.stringify(data, null, 2);
}

function eventClass(type?: string) {
  const normalized = String(type || "").toUpperCase();

  if (
    normalized.includes("DOWN") ||
    normalized.includes("ERROR") ||
    normalized.includes("CRITICAL")
  ) {
    return "danger";
  }

  if (
    normalized.includes("CPU") ||
    normalized.includes("WARN") ||
    normalized.includes("HIGH")
  ) {
    return "warning";
  }

  return "live";
}

export default function DashboardPage() {
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [threatScore, setThreatScore] = useState(0);
  const [activeThreats, setActiveThreats] = useState(0);
  const [activeIncidents, setActiveIncidents] = useState(0);
  const [healerActions, setHealerActions] = useState(0);
  const [kpiLoading, setKpiLoading] = useState(true);

  useEffect(() => {
    const loadPhase2Kpis = async () => {
      try {
        setKpiLoading(true);
        const threatRes = await fetch("http://localhost:5000/api/threats/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const threatData = await threatRes.json();
        const threats = threatData.threats || [];

        setActiveThreats(threats.length);
        setThreatScore(
          threats.length > 0
            ? Math.max(...threats.map((item: any) => item.riskScore || 0))
            : 0
        );

        const healerRes = await fetch(
          "http://localhost:5000/api/healer/recommend",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ triggerType: "LAMBDA_ERRORS" }),
          }
        );

        const healerData = await healerRes.json();
        setHealerActions(healerData.recommendation?.actions?.length || 0);
        setActiveIncidents(2);
      } catch (error) {
        console.error("Phase 2 KPI load failed:", error);
      } finally {
        setKpiLoading(false);
      }
    };

    loadPhase2Kpis();
  }, []);

  useEffect(() => {
    const handleRealtimeEvent = (event: any) => {
      console.log("Realtime event received:", event);
      setLiveEvents((prev) => [event, ...prev]);
    };

    socket.on("nexus:event", handleRealtimeEvent);

    return () => {
      socket.off("nexus:event", handleRealtimeEvent);
    };
  }, []);

  return (
    <NexusShell>
      <header className="nx-header">
        <div>
          <p className="nx-kicker">Phase 2 Mission Control</p>
          <h2 className="nx-heading">NexusOps Command Center</h2>
          <p className="nx-muted nx-lede">
            Threat Sentinel and Infra Healer are now connected with live threat
            scoring, CVE enrichment, and remediation readiness.
          </p>
        </div>

        <div className="nx-header-actions">
          <div className="nx-pill success">System Healthy</div>
          <div className="nx-pill neutral">MS-02 + MS-03 Online</div>
        </div>
      </header>

      <section className="nx-grid">
        {[
          ["Threat Score", String(threatScore), "red", "Highest CVE risk score"],
          [
            "Active Threats",
            String(activeThreats),
            "yellow",
            "From Threat Sentinel scan",
          ],
          [
            "Active Incidents",
            String(activeIncidents + liveEvents.length),
            "cyan",
            "Baseline + realtime events",
          ],
          [
            "Healer Actions",
            String(healerActions),
            "green",
            "Playbook steps available",
          ],
        ].map(([label, value, color, detail]) => (
          <div className="nx-card nx-metric-card" key={label}>
            <div className="nx-card-icon" />
            <p>{label}</p>
            <h3 className={color}>{kpiLoading ? "..." : value}</h3>
            <span className="nx-muted">
              {kpiLoading ? "Synchronizing Phase 2 telemetry" : detail}
            </span>
          </div>
        ))}
      </section>

      <section className="nx-content-grid">
        <div className="nx-panel">
          <div className="nx-panel-head">
            <div>
              <h2>Phase 2 Intelligence Feed</h2>
              <p className="nx-muted">
                Realtime Event Intelligence plus Threat Sentinel and Infra
                Healer operational signals.
              </p>
            </div>

            <div className="nx-pill neutral">{liveEvents.length} live</div>
          </div>

          <div className="nx-feed">
            <article className="nx-event live">
              <div className="nx-event-top">
                <div>
                  <strong>THREAT_SENTINEL_ONLINE</strong>
                  <p className="nx-muted">
                    CVE enrichment and risk scoring are connected to DynamoDB.
                  </p>
                </div>
                <span>MS-02</span>
              </div>
            </article>

            <article className="nx-event live">
              <div className="nx-event-top">
                <div>
                  <strong>INFRA_HEALER_READY</strong>
                  <p className="nx-muted">
                    Remediation playbooks are available for operator review.
                  </p>
                </div>
                <span>MS-03</span>
              </div>
            </article>

            {liveEvents.map((event, index) => (
              <article
                className={`nx-event ${eventClass(event.type)}`}
                key={index}
              >
                <div className="nx-event-top">
                  <div>
                    <strong>{event.type || "NEXUS_EVENT"}</strong>
                    <p className="nx-muted">
                      Realtime event received from NexusOps socket channel.
                    </p>
                  </div>

                  <span>Live</span>
                </div>

                <pre>{formatEventData(event.data)}</pre>
              </article>
            ))}

            <article className="nx-event danger">
              <div className="nx-event-top">
                <div>
                  <strong>CRITICAL_CVE_DETECTED</strong>
                  <p>Remote code execution vulnerability detected in EC2 agent.</p>
                </div>

                <span>SEV-1</span>
              </div>

              <p className="nx-muted">
                Threat Sentinel recommends immediate isolation and agent update.
              </p>
            </article>

            <article className="nx-event warning">
              <div className="nx-event-top">
                <div>
                  <strong>LAMBDA_ERROR_PLAYBOOK_READY</strong>
                  <p>Infra Healer generated a Lambda error remediation plan.</p>
                </div>

                <span>Review</span>
              </div>

              <p className="nx-muted">
                Inspect logs, check deployment version, rollback if needed, and
                create incident record.
              </p>
            </article>
          </div>
        </div>

        <aside className="nx-panel">
          <h2>Phase 2 Service Posture</h2>

          <div className="nx-posture">
            {[
              ["Threat Sentinel", "Scanning CVEs", "#22d3ee"],
              ["Infra Healer", "Ready", "#34d399"],
              ["CloudWatch Alarms", "Enabled", "#facc15"],
              ["SNS Alerts", "Confirmed", "#34d399"],
            ].map(([name, status, color]) => (
              <div className="nx-posture-row" key={name}>
                <div>
                  <strong>{name}</strong>
                  <p className="nx-muted">{status}</p>
                </div>

                <span
                  className="nx-dot"
                  style={{ background: color, color }}
                />
              </div>
            ))}

            <div className="nx-card nx-compact-card">
              <p>Security Score</p>
              <h3 className="red">{threatScore}</h3>
              <span className="nx-muted">
                Higher score means higher immediate risk.
              </span>
            </div>

            <div className="nx-card nx-compact-card">
              <p>Response Queue</p>
              <h3 className="cyan">{healerActions}</h3>
              <span className="nx-muted">
                Suggested actions awaiting operator confirmation.
              </span>
            </div>
          </div>
        </aside>
      </section>
    </NexusShell>
  );
}
