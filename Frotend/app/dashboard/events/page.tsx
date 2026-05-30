"use client";

import { useEffect, useMemo, useState } from "react";
import NexusShell from "../../../components/NexusShell";

type EventItem = {
  id: string;
  type: string;
  source: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  time: string;
};

const initialEvents: EventItem[] = [
  {
    id: "EVT-101",
    type: "CareerAnalysisCompleted",
    source: "nexus.career",
    severity: "LOW",
    message: "Career Intelligence completed resume scoring and emitted audit event.",
    time: "just now",
  },
  {
    id: "EVT-102",
    type: "EngineeringAnalysisCompleted",
    source: "nexus.engineering",
    severity: "MEDIUM",
    message: "Engineering Intelligence persisted repository metrics and PR logs.",
    time: "1 min ago",
  },
  {
    id: "EVT-103",
    type: "ThreatScanCompleted",
    source: "nexus.threat",
    severity: "HIGH",
    message: "Threat scan detected high-risk CVE pattern.",
    time: "3 min ago",
  },
  {
    id: "EVT-104",
    type: "HealerActionQueued",
    source: "nexus.healer",
    severity: "MEDIUM",
    message: "AI Healer queued remediation guidance for elevated lambda errors.",
    time: "4 min ago",
  },
  {
    id: "EVT-105",
    type: "DataNexusQueryExecuted",
    source: "nexus.datanexus",
    severity: "LOW",
    message: "Data Nexus query completed and emitted execution telemetry.",
    time: "6 min ago",
  },
];

const eventTemplates: EventItem[] = [
  {
    id: "EVT-template-1",
    type: "DataNexusQueryExecuted",
    source: "nexus.datanexus",
    severity: "LOW",
    message: "Query execution completed and telemetry event was recorded.",
    time: "just now",
  },
  {
    id: "EVT-template-2",
    type: "HealerRecommendationGenerated",
    source: "nexus.healer",
    severity: "MEDIUM",
    message: "AI Healer generated remediation steps for lambda error spike.",
    time: "just now",
  },
  {
    id: "EVT-template-3",
    type: "CriticalRiskDetected",
    source: "nexus.threat",
    severity: "CRITICAL",
    message: "Critical operational signal detected from threat intelligence stream.",
    time: "just now",
  },
  {
    id: "EVT-template-4",
    type: "DeploymentRiskUpdated",
    source: "nexus.deployments",
    severity: "HIGH",
    message: "Deployment signal reported elevated rollback probability.",
    time: "just now",
  },
  {
    id: "EVT-template-5",
    type: "EngineeringTelemetrySynced",
    source: "nexus.engineering",
    severity: "LOW",
    message: "Repository throughput and review latency telemetry synchronized.",
    time: "just now",
  },
  {
    id: "EVT-template-6",
    type: "ThreatPatternCorrelated",
    source: "nexus.threat",
    severity: "HIGH",
    message: "Threat Sentinel correlated CVE activity with deployment exposure.",
    time: "just now",
  },
];

const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const sourceLabels: Record<string, string> = {
  "nexus.threat": "Threat",
  "nexus.healer": "Healer",
  "nexus.datanexus": "Data Nexus",
  "nexus.engineering": "Engineering",
  "nexus.deployments": "Deploy",
  "nexus.career": "Career",
};

const typeIcons: Record<string, string> = {
  CareerAnalysisCompleted: "CA",
  EngineeringAnalysisCompleted: "EA",
  ThreatScanCompleted: "TS",
  HealerActionQueued: "HA",
  DataNexusQueryExecuted: "DQ",
  HealerRecommendationGenerated: "HR",
  CriticalRiskDetected: "CR",
  DeploymentRiskUpdated: "DR",
  EngineeringTelemetrySynced: "ET",
  ThreatPatternCorrelated: "TC",
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [streamBooting, setStreamBooting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const bootTimer = setTimeout(() => setStreamBooting(false), 900);

    const interval = setInterval(() => {
      const next = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];

      setEvents((prev) => [
        {
          ...next,
          id: `EVT-${Date.now()}`,
        },
        ...prev.slice(0, 17),
      ]);
    }, 4200);

    return () => {
      clearTimeout(bootTimer);
      clearInterval(interval);
    };
  }, []);

  const criticalCount = events.filter(
    (event) => event.severity === "CRITICAL"
  ).length;

  const highCount = events.filter((event) => event.severity === "HIGH").length;
  const threatCount = events.filter((event) => event.source === "nexus.threat").length;
  const healerCount = events.filter((event) => event.source === "nexus.healer").length;
  const dataNexusCount = events.filter(
    (event) => event.source === "nexus.datanexus"
  ).length;
  const activeSources = new Set(events.map((event) => event.source)).size;

  const severityCounts = useMemo(
    () =>
      severityOrder.map((severity) => ({
        severity,
        count: events.filter((event) => event.severity === severity).length,
      })),
    [events]
  );

  const sourceDistribution = useMemo(() => {
    const sources = Array.from(new Set(events.map((event) => event.source)));

    return sources.map((source) => ({
      source,
      label: sourceLabels[source] || source,
      count: events.filter((event) => event.source === source).length,
    }));
  }, [events]);

  const volumeBars = [36, 58, 44, 72, 61, 88, 66, Math.min(96, events.length * 6)];

  const refreshStream = () => {
    setRefreshing(true);

    setTimeout(() => {
      const next = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];

      setEvents((prev) => [
        {
          ...next,
          id: `EVT-${Date.now()}`,
        },
        ...prev.slice(0, 17),
      ]);

      setRefreshing(false);
    }, 650);
  };

  return (
    <NexusShell>
      <header className="nx-header nx-events-header">
        <div>
          <p className="nx-kicker">Event Console</p>
          <h2 className="nx-heading">Realtime SOC Event Stream</h2>
          <p className="nx-muted nx-lede">
            Realtime audit events, service signals, and operational telemetry
            from NexusOps X intelligence modules.
          </p>
        </div>

        <button
          className="nx-auth-submit nx-fit-btn nx-stream-ready"
          onClick={refreshStream}
          disabled={refreshing}
        >
          <span className="nx-live-dot" />
          {refreshing ? "Refreshing..." : "Stream Ready"}
        </button>
      </header>

      <section className="nx-grid nx-events-metrics">
        <div className="nx-card nx-metric-card">
          <p>Total Events</p>
          <h3 className="cyan">{events.length}</h3>
          <span className="nx-muted">Live telemetry items</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Active Sources</p>
          <h3 className="green">{activeSources}</h3>
          <span className="nx-muted">Streaming Nexus modules</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>High Signals</p>
          <h3 className="yellow">{highCount}</h3>
          <span className="nx-muted">Needs operator review</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Critical Signals</p>
          <h3 className="red">{criticalCount}</h3>
          <span className="nx-muted">Immediate attention</span>
        </div>
      </section>

      <section className="nx-events-console">
        <main className="nx-panel nx-events-stream-panel">
          <div className="nx-panel-head">
            <div>
              <h2>Live Realtime Event Stream</h2>
              <p className="nx-muted">
                Animated event feed with severity, source, and timestamp context.
              </p>
            </div>

            <div className="nx-stream-state">
              <span className="nx-live-dot" />
              LIVE INGEST
            </div>
          </div>

          {streamBooting ? (
            <div className="nx-event-stream nx-event-stream-loading">
              {[0, 1, 2, 3, 4].map((item) => (
                <article className="nx-event-card skeleton" key={item}>
                  <div className="nx-skeleton-line short" />
                  <div className="nx-skeleton-line mid" />
                  <div className="nx-skeleton-line" />
                </article>
              ))}
            </div>
          ) : (
            <div className="nx-event-stream">
              {events.map((event, index) => (
                <article
                  key={event.id}
                  className={`nx-event-card severity-${event.severity.toLowerCase()}`}
                  style={{ animationDelay: `${Math.min(index, 6) * 55}ms` }}
                >
                  <div className="nx-event-icon">
                    {typeIcons[event.type] || "EV"}
                  </div>

                  <div className="nx-event-body">
                    <div className="nx-event-card-top">
                      <div>
                        <strong>{event.type}</strong>
                        <span>{event.id}</span>
                      </div>

                      <span className={`nx-severity-badge ${event.severity.toLowerCase()}`}>
                        {event.severity}
                      </span>
                    </div>

                    <p>{event.message}</p>

                    <div className="nx-event-meta-row">
                      <span className="nx-source-badge">
                        {sourceLabels[event.source] || event.source}
                      </span>
                      <span className="nx-event-time">{event.time}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        <aside className="nx-events-side">
          <section className="nx-panel nx-events-health-panel">
            <div className="nx-panel-head">
              <div>
                <h2>Event Health</h2>
                <p className="nx-muted">Stream status and active signal posture.</p>
              </div>
            </div>

            <div className="nx-events-health-grid">
              <div className="nx-card nx-compact-card">
                <p>Stream Status</p>
                <h3 className="green">LIVE</h3>
                <span className="nx-muted">Realtime simulation active</span>
              </div>

              <div className="nx-card nx-compact-card">
                <p>EventBridge</p>
                <h3 className="cyan">CONNECTED</h3>
                <span className="nx-muted">Audit events emitted</span>
              </div>

              <div className="nx-card nx-compact-card">
                <p>Critical Events</p>
                <h3 className="red">{criticalCount}</h3>
                <span className="nx-muted">Active risk signals</span>
              </div>

              <div className="nx-card nx-compact-card">
                <p>Last Event</p>
                <h3 className="yellow">{events[0]?.id}</h3>
                <span className="nx-muted">{events[0]?.type}</span>
              </div>
            </div>
          </section>

          <section className="nx-panel nx-events-analytics-panel">
            <div className="nx-panel-head">
              <div>
                <h2>Stream Analytics</h2>
                <p className="nx-muted">Signal volume and source distribution.</p>
              </div>
            </div>

            <div className="nx-event-volume-chart" aria-label="Event volume chart">
              {volumeBars.map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>

            <div className="nx-source-distribution">
              {sourceDistribution.map((item) => (
                <div className="nx-source-row" key={item.source}>
                  <span>{item.label}</span>
                  <div>
                    <i style={{ width: `${Math.max(12, item.count * 9)}%` }} />
                  </div>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="nx-panel nx-events-signal-panel">
            <div className="nx-panel-head">
              <div>
                <h2>Signal Metrics</h2>
                <p className="nx-muted">Module-level stream composition.</p>
              </div>
            </div>

            <div className="nx-signal-grid">
              <div className="nx-signal-card">
                <span>Threat</span>
                <strong>{threatCount}</strong>
                <div className="nx-mini-trend">
                  <i style={{ height: "36%" }} />
                  <i style={{ height: "54%" }} />
                  <i style={{ height: "44%" }} />
                  <i style={{ height: "78%" }} />
                </div>
              </div>

              <div className="nx-signal-card">
                <span>Healer</span>
                <strong>{healerCount}</strong>
                <div className="nx-mini-trend">
                  <i style={{ height: "34%" }} />
                  <i style={{ height: "48%" }} />
                  <i style={{ height: "62%" }} />
                  <i style={{ height: "56%" }} />
                </div>
              </div>

              <div className="nx-signal-card">
                <span>Data Nexus</span>
                <strong>{dataNexusCount}</strong>
                <div className="nx-mini-trend">
                  <i style={{ height: "40%" }} />
                  <i style={{ height: "42%" }} />
                  <i style={{ height: "66%" }} />
                  <i style={{ height: "72%" }} />
                </div>
              </div>
            </div>

            <div className="nx-severity-stack">
              {severityCounts.map((item) => (
                <div className="nx-severity-row" key={item.severity}>
                  <span className={`nx-severity-badge ${item.severity.toLowerCase()}`}>
                    {item.severity}
                  </span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </NexusShell>
  );
}
