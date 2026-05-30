"use client";

import { useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";
import { socket } from "../../../Lib/socket";
import LineageGraph from "../../../components/datanexus/LineageGraph";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";

type Schema = {
  tableName: string;
  itemCount: number;
  attributes: { AttributeName: string; AttributeType: string }[];
  keySchema: { AttributeName: string; KeyType: string }[];
};

type LineageNode = { id: string; type: string };
type LineageEdge = { source: string; target: string };
type Anomaly = { severity: string; table: string; issue: string };

type QueryResult = {
  id: number;
  column: string;
  type: string;
  table: string;
  sample: string;
};

type QueryActivity = {
  id: string;
  query: string;
  table: string;
  status: string;
  time: string;
};

type PipelineEvent = {
  id: number;
  status: string;
  service: string;
  message: string;
  time: string;
};

export default function DataNexusPage() {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [lineageNodes, setLineageNodes] = useState<LineageNode[]>([]);
  const [lineageEdges, setLineageEdges] = useState<LineageEdge[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedTable, setSelectedTable] = useState<Schema | null>(null);
  const [activeTab, setActiveTab] = useState("query");
  const [query, setQuery] = useState("SELECT * FROM NexusEvents LIMIT 25;");
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryRan, setQueryRan] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [queryStatus, setQueryStatus] =
    useState<"IDLE" | "RUNNING" | "SUCCESS" | "ERROR">("IDLE");

  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [savedQueries, setSavedQueries] = useState<string[]>([]);
  const [queryActivity, setQueryActivity] = useState<QueryActivity[]>([]);
  const [totalQueries, setTotalQueries] = useState(0);
  const [successfulQueries, setSuccessfulQueries] = useState(0);
  const [failedQueries, setFailedQueries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryProgress, setQueryProgress] = useState(0);
  const [executionStage, setExecutionStage] = useState("");
  const [queryPlan, setQueryPlan] = useState<string[]>([]);
  const [averageExecution, setAverageExecution] = useState(0);
  const [mostQueriedTable, setMostQueriedTable] = useState("");
  const [estimatedScan, setEstimatedScan] = useState("0 MB");
  const [queryComplexity, setQueryComplexity] = useState("LOW");
  const [queryRisks, setQueryRisks] = useState<string[]>([]);
  const [anomalySpike, setAnomalySpike] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [fullscreenEditor, setFullscreenEditor] = useState(false);

  const [pipelineEvents, setPipelineEvents] = useState<PipelineEvent[]>([
    {
      id: 1,
      status: "ACTIVE",
      service: "NexusEvents",
      message: "Realtime ingestion pipeline active",
      time: "2s ago",
    },
    {
      id: 2,
      status: "WARNING",
      service: "NexusDeploymentRisk",
      message: "Replication latency increased",
      time: "8s ago",
    },
    {
      id: 3,
      status: "SUCCESS",
      service: "NexusAuditLedger",
      message: "Audit synchronization completed",
      time: "14s ago",
    },
  ]);

  const rowsPerPage = 3;

  const lineageFlows = [
    {
      source: "NexusEvents",
      target: "NexusAuditLedger",
      relation: "Streams audit events",
      health: "HEALTHY",
      latency: "24ms",
      throughput: "1.2k/min",
      sync: "ACTIVE",
    },
    {
      source: "NexusCVERegistry",
      target: "NexusDeploymentRisk",
      relation: "Feeds risk scoring",
      health: "WARNING",
      latency: "78ms",
      throughput: "420/min",
      sync: "DEGRADED",
    },
    {
      source: "NexusIncidentLog",
      target: "NexusHealerState",
      relation: "Triggers remediation",
      health: "HEALTHY",
      latency: "31ms",
      throughput: "890/min",
      sync: "ACTIVE",
    },
    {
      source: "NexusPipelineLog",
      target: "NexusDeploymentRisk",
      relation: "Deployment telemetry",
      health: "CRITICAL",
      latency: "210ms",
      throughput: "120/min",
      sync: "LAGGING",
    },
  ];

  const loadDataNexus = async () => {
    try {
      setLoading(true);

      const [schemaRes, lineageRes, anomalyRes] = await Promise.all([
        fetch("http://localhost:5000/api/datanexus/schemas"),
        fetch("http://localhost:5000/api/datanexus/lineage"),
        fetch("http://localhost:5000/api/datanexus/anomalies"),
      ]);

      const schemaData = await schemaRes.json();
      const lineageData = await lineageRes.json();
      const anomalyData = await anomalyRes.json();

      setSchemas(schemaData.schemas || []);
      setSelectedTable(schemaData.schemas?.[0] || null);
      setLineageNodes(lineageData.nodes || []);
      setLineageEdges(lineageData.edges || []);
      setAnomalies(anomalyData.anomalies || []);
    } finally {
      setLoading(false);
    }
  };

  const runQuery = () => {
    if (!selectedTable || isRunning) return;

    setIsRunning(true);
    setQueryStatus("RUNNING");
    setQueryProgress(25);
    setExecutionStage("Parsing query...");

    if (!query.trim()) {
      setTimeout(() => {
        setQueryProgress(0);
        setExecutionStage("Execution failed");
        setIsRunning(false);
        setQueryStatus("ERROR");
        toast.error("Query failed. Please enter a valid SELECT query.");
        setQueryRan(false);
        setExecutionTime(0);
        setTotalQueries((count) => count + 1);
        setFailedQueries((count) => count + 1);
      }, 400);

      return;
    }

    const startTime = performance.now();

    setTimeout(() => {
      setQueryProgress(55);
      setExecutionStage("Validating schema...");
    }, 350);

    setTimeout(() => {
      setQueryProgress(80);
      setExecutionStage("Executing query engine...");
    }, 700);

    setTimeout(() => {
      if (!query.toLowerCase().includes("select")) {
        setQueryProgress(0);
        setExecutionStage("Execution failed");
        setIsRunning(false);
        setQueryStatus("ERROR");
        toast.error("Query failed. Please enter a valid SELECT query.");
        setQueryRan(false);
        setExecutionTime(Math.round(performance.now() - startTime));
        setTotalQueries((count) => count + 1);
        setFailedQueries((count) => count + 1);
        return;
      }

      const rows = selectedTable.attributes.map((attribute, index) => ({
        id: index + 1,
        column: attribute.AttributeName,
        type: attribute.AttributeType,
        table: selectedTable.tableName,
        sample: `query-result-${index + 1}`,
      }));

      const runtime = Math.round(performance.now() - startTime);

      setQueryProgress(100);
      setExecutionStage("Returning results...");
      setQueryResults(rows);
      setQueryRan(true);
      setExecutionTime(runtime);
      setQueryStatus("SUCCESS");
      toast.success("Query executed successfully");

      const risks: string[] = [];

      if (query.includes("*")) {
        risks.push("Full table scan detected");
      }

      if (!query.toLowerCase().includes("limit")) {
        risks.push("No LIMIT clause detected");
      }

      if (!query.toLowerCase().includes("where")) {
        risks.push("Broad query without WHERE filter");
      }

      if (query.toLowerCase().includes("join")) {
        risks.push("High complexity JOIN operation");
      }

      setQueryRisks(risks);

      setQueryPlan([
        "Parse SQL statement",
        `Validate schema for ${selectedTable.tableName}`,
        `Scan ${selectedTable.tableName} attributes`,
        "Return simulated query results",
      ]);

      setTotalQueries((count) => count + 1);
      setSuccessfulQueries((count) => count + 1);

      setAverageExecution((prev) =>
        prev === 0 ? runtime : Math.round((prev + runtime) / 2)
      );

      setMostQueriedTable(selectedTable.tableName);
      setEstimatedScan(`${selectedTable.attributes.length * 4} MB`);

      if (query.toLowerCase().includes("join")) {
        setQueryComplexity("HIGH");
      } else if (query.toLowerCase().includes("where")) {
        setQueryComplexity("MEDIUM");
      } else {
        setQueryComplexity("LOW");
      }

      setCurrentPage(1);

      setQueryActivity((prev) =>
        [
          {
            id: `Q-${Date.now()}`,
            query,
            table: selectedTable.tableName,
            status: "SUCCESS",
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ].slice(0, 6)
      );

      setQueryHistory((prev) => {
        const updated = [query, ...prev.filter((q) => q !== query)];
        return updated.slice(0, 5);
      });

      setTimeout(() => {
        setIsRunning(false);
      }, 500);
    }, 1100);
  };

  useEffect(() => {
  loadDataNexus();

  const stored = localStorage.getItem(
    "nexus-saved-queries"
  );

  if (stored) {
    setSavedQueries(JSON.parse(stored));
  }
}, []);

useEffect(() => {
  const handleKeyDown = (
    event: KeyboardEvent
  ) => {
    if (
      event.ctrlKey &&
      event.key === "Enter"
    ) {
      event.preventDefault();
      runQuery();
    }

    if (
      event.ctrlKey &&
      event.key.toLowerCase() === "s"
    ) {
      event.preventDefault();
      saveQuery();
      toast.success(
        "Query saved with shortcut"
      );
    }

    if (
      event.key === "Escape" &&
      fullscreenEditor
    ) {
      setFullscreenEditor(false);
    }
  };

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  return () => {
    window.removeEventListener(
      "keydown",
      handleKeyDown
    );
  };
}, [
  fullscreenEditor,
  query,
  selectedTable,
  isRunning,
]);
  useEffect(() => {
    const handleRealtimeEvent = (event: any) => {
      if (event.type === "DATA_ANOMALY_DETECTED" && event.data?.anomalies) {
        setAnomalies(event.data.anomalies);
      }
    };

    socket.on("nexus:event", handleRealtimeEvent);

    return () => {
      socket.off("nexus:event", handleRealtimeEvent);
    };
  }, []);

  useEffect(() => {
    const eventTemplates = [
      {
        status: "ACTIVE",
        service: "NexusEvents",
        message: "Ingestion batch processed",
      },
      {
        status: "WARNING",
        service: "NexusDeploymentRisk",
        message: "Risk scoring latency increased",
      },
      {
        status: "SUCCESS",
        service: "NexusAuditLedger",
        message: "Audit stream checkpoint completed",
      },
      {
        status: "ACTIVE",
        service: "NexusHealerState",
        message: "Remediation state synchronized",
      },
    ];

    const interval = setInterval(() => {
      const event =
        eventTemplates[Math.floor(Math.random() * eventTemplates.length)];

      setPipelineEvents((prev) => [
        {
          id: Date.now(),
          status: event.status,
          service: event.service,
          message: event.message,
          time: "just now",
        },
        ...prev.slice(0, 5),
      ]);

      if (event.status === "WARNING") {
        toast.error("Pipeline warning detected");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const riskyEvents = pipelineEvents.filter(
      (item) => item.status === "WARNING" || item.status === "CRITICAL"
    );

    setAnomalySpike(riskyEvents.length >= 3);
  }, [pipelineEvents]);

  const mockResults = selectedTable
    ? selectedTable.attributes.map((attribute, index) => ({
        id: index + 1,
        column: attribute.AttributeName,
        type: attribute.AttributeType,
        table: selectedTable.tableName,
        sample: index === 0 ? selectedTable.tableName : "sample-value",
      }))
    : [];

  const visibleResults = queryResults.length > 0 ? queryResults : mockResults;
  const totalPages = Math.ceil(visibleResults.length / rowsPerPage);

  const paginatedResults = visibleResults.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const successRate =
    totalQueries === 0 ? 0 : Math.round((successfulQueries / totalQueries) * 100);

  const saveQuery = () => {
    if (!query.trim()) return;

    const updated = [query, ...savedQueries.filter((item) => item !== query)].slice(0, 5);

    setSavedQueries(updated);
    localStorage.setItem("nexus-saved-queries", JSON.stringify(updated));
    toast.success("Query saved");
  };

  const exportCsv = () => {
    if (!visibleResults.length) return;

    const headers = ["Column", "Type", "Table", "Sample"];
    const rows = visibleResults.map((row) => [
      row.column,
      row.type,
      row.table,
      row.sample,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${selectedTable?.tableName || "nexus-query-results"}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const exportJson = () => {
    if (!visibleResults.length) return;

    const jsonContent = JSON.stringify(
      {
        table: selectedTable?.tableName || "unknown",
        exportedAt: new Date().toISOString(),
        rows: visibleResults,
      },
      null,
      2
    );

    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${selectedTable?.tableName || "nexus-query-results"}.json`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("JSON exported successfully");
  };

  const clearWorkspace = () => {
    setQueryResults([]);
    setQueryRan(false);
    setQueryStatus("IDLE");
    setExecutionTime(null);
    setCurrentPage(1);
    setQueryProgress(0);
    setExecutionStage("");
    setQueryPlan([]);
    setQueryRisks([]);
    setQueryActivity([]);
    setIsRunning(false);
    toast.success("Workspace cleared");
  };

  const renderSkeletonCards = () => {
    return Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="nx-card nx-metric-card nx-skeleton-card">
        <div className="nx-skeleton-line large" />
        <div className="nx-skeleton-line medium" />
        <div className="nx-skeleton-line small" />
      </div>
    ));
  };

  return (
    <NexusShell>
      <header className="nx-header">
        <div>
          <p className="nx-kicker">Data Nexus</p>
          <h2 className="nx-heading">Interactive Data Intelligence</h2>
          <p className="nx-muted nx-lede">
            MS-06 discovers DynamoDB schemas, maps lineage, runs query-style
            inspection, and detects data anomalies.
          </p>
        </div>

        <button className="nx-auth-submit nx-fit-btn" onClick={loadDataNexus} aria-label="Refresh Data Nexus">
          Refresh Data Nexus
        </button>
      </header>

      <section className="nx-grid nx-datanexus-metrics">
        {loading ? (
          renderSkeletonCards()
        ) : (
          <>
            <div className="nx-card nx-metric-card">
              <p>Tables</p>
              <h3 className="cyan">{schemas.length}</h3>
              <span className="nx-muted">Schema registry entries</span>
            </div>

            <div className="nx-card nx-metric-card">
              <p>Lineage Nodes</p>
              <h3 className="green">{lineageNodes.length}</h3>
              <span className="nx-muted">Services and tables</span>
            </div>

            <div className="nx-card nx-metric-card">
              <p>Lineage Edges</p>
              <h3 className="yellow">{lineageEdges.length}</h3>
              <span className="nx-muted">Dependency links</span>
            </div>

            <div className="nx-card nx-metric-card">
              <p>Anomalies</p>
              <h3 className="red">{anomalies.length}</h3>
              <span className="nx-muted">Detected data patterns</span>
            </div>
          </>
        )}
      </section>

      <section className="nx-data-layout nx-datanexus-layout">
        <aside className="nx-panel nx-datanexus-sidebar">
          <div className="nx-panel-head">
            <div>
              <h2>Schema Browser</h2>
              <p className="nx-muted">DynamoDB tables discovered by Data Nexus.</p>
            </div>
          </div>

          <div className="nx-schema-list">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="nx-schema-item nx-skeleton-card">
                  <div className="nx-skeleton-line medium" />
                  <div className="nx-skeleton-line small" />
                </div>
              ))
            ) : schemas.length > 0 ? (
              schemas.map((schema) => (
                <button
                  className={`nx-schema-item ${
                    selectedTable?.tableName === schema.tableName ? "active" : ""
                  }`}
                  key={schema.tableName}
                  onClick={() => {
                    setSelectedTable(schema);
                    setQueryResults([]);
                    setQueryRan(false);
                    setQueryStatus("IDLE");
                    setExecutionTime(null);
                    setCurrentPage(1);
                    setQueryPlan([]);
                    setQuery(`SELECT * FROM ${schema.tableName} LIMIT 25;`);
                  }}
                >
                  <strong>{schema.tableName}</strong>
                  <span>{schema.attributes.length} attributes</span>
                </button>
              ))
            ) : (
              <div className="nx-empty-state compact">
                <strong>No schemas discovered</strong>
                <p className="nx-muted">
                  Refresh Data Nexus to load DynamoDB schema metadata.
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="nx-panel nx-datanexus-main">
          <div className="nx-tabs">
            {["query", "lineage", "anomalies"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === "query" && (
            <>
              <div
                className={`nx-query-editor ${
                  fullscreenEditor ? "fullscreen" : ""
                }`}
              >
                <div className="nx-query-editor-head">
                  <div>
                    <h3>Query Workspace</h3>
                    <p className="nx-muted">
                      Explore selected table attributes with SQL-style inspection.
                    </p>
                  </div>

                  <span className="nx-pill neutral">
                    {fullscreenEditor ? "Fullscreen" : "Editor"}
                  </span>
                </div>

                <div className="nx-monaco-frame rounded-2xl border border-cyan-500/20 overflow-hidden">
                  <Editor
                    height={fullscreenEditor ? "70vh" : "220px"}
                    defaultLanguage="sql"
                    theme="vs-dark"
                    value={query}
                    onChange={(value) => setQuery(value || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                <div className="nx-query-select-row">
                  <select
                    className="nx-select"
                    onChange={(e) => e.target.value && setQuery(e.target.value)}
                  >
                    <option value="">Query History</option>
                    {queryHistory.map((historyItem, index) => (
                      <option key={index} value={historyItem}>
                        {historyItem}
                      </option>
                    ))}
                  </select>

                  <select
                    className="nx-select"
                    onChange={(e) => e.target.value && setQuery(e.target.value)}
                  >
                    <option value="">Saved Queries</option>
                    {savedQueries.map((savedItem, index) => (
                      <option key={index} value={savedItem}>
                        {savedItem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="nx-query-actions">
                  <button
                    className="nx-auth-submit nx-fit-btn"
                    onClick={runQuery}
                    disabled={isRunning}
                    aria-label="Run SQL query"
                  >
                    {isRunning ? "Running..." : "Run Query"}
                  </button>

                  <button
                    className="nx-auth-submit nx-fit-btn"
                    onClick={exportCsv}
                    aria-label="Export results as CSV"
                  >
                    Export CSV
                  </button>

                  <button
                    className="nx-auth-submit nx-fit-btn"
                    onClick={exportJson}
                    aria-label="Export results as JSON"
                  >
                    Export JSON
                  </button>

                  <button
                    className="nx-auth-submit nx-fit-btn"
                    onClick={saveQuery}
                    aria-label="Save query"
                  >
                    Save Query
                  </button>

                  <button
                    className="nx-auth-submit nx-fit-btn"
                    onClick={() => setFullscreenEditor((prev) => !prev)}
                    aria-label="Toggle fullscreen editor"
                  >
                    {fullscreenEditor ? "Exit Fullscreen" : "Fullscreen Editor"}
                  </button>

                  <button
                    className="nx-auth-submit nx-fit-btn"
                    onClick={clearWorkspace}
                    aria-label="Clear query workspace"
                  >
                    Clear Workspace
                  </button>
                </div>
              </div>

              {isRunning && (
                <div className="nx-query-progress">
                  <div
                    className="nx-query-progress-bar"
                    style={{ width: `${queryProgress}%` }}
                  />
                  <span>{queryProgress}%</span>
                </div>
              )}

              {isRunning && <p className="nx-query-stage">{executionStage}</p>}

              {queryRan && (
                <p className="nx-auth-message">
                  Query executed successfully for {selectedTable?.tableName}
                </p>
              )}

              {queryStatus === "ERROR" && (
                <p className="nx-auth-message">
                  Query failed. Please enter a valid SELECT query.
                </p>
              )}

              <div
                className="nx-query-analytics nx-query-analytics-primary"
                style={{
                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                }}
              >
                <div className="nx-card nx-compact-card">
                  <p>Status</p>
                  <h3
                    className={
                      queryStatus === "SUCCESS"
                        ? "green"
                        : queryStatus === "ERROR"
                        ? "red"
                        : queryStatus === "RUNNING"
                        ? "cyan"
                        : "yellow"
                    }
                  >
                    {queryStatus}
                  </h3>
                  <span className="nx-muted">Query engine state</span>
                </div>

                <div className="nx-card nx-compact-card">
                  <p>Total Queries</p>
                  <h3 className="cyan">{totalQueries}</h3>
                  <span className="nx-muted">Executed this session</span>
                </div>

                <div className="nx-card nx-compact-card">
                  <p>Successful</p>
                  <h3 className="green">{successfulQueries}</h3>
                  <span className="nx-muted">Completed queries</span>
                </div>

                <div className="nx-card nx-compact-card">
                  <p>Failed</p>
                  <h3 className="red">{failedQueries}</h3>
                  <span className="nx-muted">Validation errors</span>
                </div>

                <div className="nx-card nx-compact-card">
                  <p>Success Rate</p>
                  <h3 className="green">{successRate}%</h3>
                  <span className="nx-muted">Query reliability</span>
                </div>

                <div className="nx-card nx-compact-card">
                  <p>Rows</p>
                  <h3 className="cyan">{visibleResults.length}</h3>
                  <span className="nx-muted">Returned records</span>
                </div>

                <div className="nx-card nx-compact-card">
                  <p>Execution Time</p>
                  <h3 className="yellow">{executionTime ?? 0}ms</h3>
                  <span className="nx-muted">Simulated runtime</span>
                </div>
              </div>

              <div
                className="nx-query-analytics nx-query-analytics-secondary"
                style={{
                  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                  marginTop: "20px",
                }}
              >
                <div className="nx-card nx-compact-card">
                  <p>Most Queried Table</p>
                  <h3 className="cyan">{mostQueriedTable || "N/A"}</h3>
                  <span className="nx-muted">Highest activity target</span>
                </div>

                <div className="nx-card nx-compact-card">
                  <p>Avg Execution</p>
                  <h3 className="yellow">{averageExecution}ms</h3>
                  <span className="nx-muted">Average runtime</span>
                </div>

                <div className="nx-card nx-compact-card">
                  <p>Query Complexity</p>
                  <h3
                    className={
                      queryComplexity === "HIGH"
                        ? "red"
                        : queryComplexity === "MEDIUM"
                        ? "yellow"
                        : "green"
                    }
                  >
                    {queryComplexity}
                  </h3>
                  <span className="nx-muted">Query analysis score</span>
                </div>

                <div className="nx-card nx-compact-card">
                  <p>Estimated Scan</p>
                  <h3 className="cyan">{estimatedScan}</h3>
                  <span className="nx-muted">Simulated scan size</span>
                </div>
              </div>

              {queryPlan.length > 0 && (
                <div className="nx-feed nx-query-plan-feed">
                  <h3>Query Plan Preview</h3>

                  {queryPlan.map((step, index) => (
                    <article className="nx-event live" key={step}>
                      <div className="nx-event-top">
                        <div>
                          <strong>Step {index + 1}</strong>
                          <p className="nx-muted">{step}</p>
                        </div>

                        <span>OK</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {queryRisks.length > 0 && (
                <div className="nx-feed nx-query-risk-feed">
                  <h3>Query Risk Flags</h3>

                  {queryRisks.map((risk) => (
                    <article className="nx-event warning" key={risk}>
                      <div className="nx-event-top">
                        <div>
                          <strong>Risk Detected</strong>
                          <p>{risk}</p>
                        </div>

                        <span>WARN</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="nx-result-table nx-datanexus-result-table">
                <table>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Type</th>
                      <th>Table</th>
                      <th>Sample</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isRunning ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr key={index}>
                          <td>
                            <div className="nx-skeleton-line small" />
                          </td>
                          <td>
                            <div className="nx-skeleton-line small" />
                          </td>
                          <td>
                            <div className="nx-skeleton-line medium" />
                          </td>
                          <td>
                            <div className="nx-skeleton-line medium" />
                          </td>
                        </tr>
                      ))
                    ) : paginatedResults.length > 0 ? (
                      paginatedResults.map((row) => (
                        <tr key={`${row.table}-${row.column}`}>
                          <td onClick={() => navigator.clipboard.writeText(row.column)}>
                            {row.column}
                          </td>
                          <td onClick={() => navigator.clipboard.writeText(row.type)}>
                            {row.type}
                          </td>
                          <td onClick={() => navigator.clipboard.writeText(row.table)}>
                            {row.table}
                          </td>
                          <td onClick={() => navigator.clipboard.writeText(row.sample)}>
                            {row.sample}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <div className="nx-table-empty">
                            <strong>No rows available</strong>
                            <p className="nx-muted">
                              Select a table or run a query to inspect results.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="nx-pagination">
                  <button
                    className="nx-auth-submit nx-fit-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                  >
                    Previous
                  </button>

                  <span className="nx-muted">
                    Page {currentPage} of {totalPages || 1}
                  </span>

                  <button
                    className="nx-auth-submit nx-fit-btn"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="nx-feed nx-query-activity-feed">
                <h3>Query Activity Feed</h3>

                {queryActivity.length > 0 ? (
                  queryActivity.map((activity) => (
                    <article className="nx-event live" key={activity.id}>
                      <div className="nx-event-top">
                        <div>
                          <strong>{activity.status}</strong>
                          <p className="nx-muted">{activity.query}</p>
                        </div>

                        <span>{activity.time}</span>
                      </div>

                      <p className="nx-muted">Table: {activity.table}</p>
                    </article>
                  ))
                ) : (
                  <div className="nx-empty-state compact">
                    <strong>No query activity yet</strong>
                    <p className="nx-muted">
                      Executed queries will appear here with table and status context.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "lineage" && (
            <div className="nx-lineage-container">
              {anomalySpike && (
                <div className="nx-spike-alert">
                  <strong>Pipeline Instability Detected</strong>

                  <p>
                    Multiple WARNING/CRITICAL dependency events detected across
                    realtime flows.
                  </p>
                </div>
              )}

              <LineageGraph nodes={lineageNodes} edges={lineageEdges} />

              {lineageFlows.map((node, index) => (
                <div className="nx-lineage-card" key={index}>
                  <div className="nx-lineage-node">
                    <div className="nx-lineage-source">
                      <span className="nx-lineage-label">SOURCE</span>
                      <h3>{node.source}</h3>
                    </div>

                    <div className="nx-lineage-arrow nx-flow-arrow">→</div>

                    <div className="nx-lineage-target">
                      <span className="nx-lineage-label">TARGET</span>
                      <h3>{node.target}</h3>
                    </div>
                  </div>

                  <div className="nx-lineage-footer">
                    <span>{node.relation}</span>

                    <span
                      className={`nx-lineage-health ${
                        node.health === "HEALTHY"
                          ? "healthy"
                          : node.health === "WARNING"
                          ? "warning"
                          : "critical"
                      }`}
                    >
                      {node.health}
                    </span>
                  </div>

                  <div className="nx-lineage-metrics">
                    <span>Latency: {node.latency}</span>
                    <span>Throughput: {node.throughput}</span>
                    <span>Sync: {node.sync}</span>
                  </div>
                </div>
              ))}

              <div className="nx-feed nx-pipeline-feed">
                <h3>Pipeline Activity Monitor</h3>

                {pipelineEvents.map((event) => (
                  <article
                    key={event.id}
                    className={
                      event.status === "WARNING"
                        ? "nx-event warning"
                        : event.status === "SUCCESS"
                        ? "nx-event live"
                        : "nx-event"
                    }
                  >
                    <div className="nx-event-top">
                      <div>
                        <strong>{event.service}</strong>
                        <p>{event.message}</p>
                      </div>

                      <span>{event.status}</span>
                    </div>

                    <p className="nx-muted">{event.time}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === "anomalies" && (
            <div className="nx-feed nx-anomaly-feed">
              {anomalies.length > 0 ? (
                anomalies.map((anomaly, index) => (
                  <article
                    className={
                      anomaly.severity === "HIGH" ? "nx-event danger" : "nx-event warning"
                    }
                    key={index}
                  >
                    <div className="nx-event-top">
                      <div>
                        <strong>{anomaly.table}</strong>
                        <p>{anomaly.issue}</p>
                      </div>

                      <span>{anomaly.severity}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="nx-empty-state">
                  <strong>No anomalies detected</strong>
                  <p className="nx-muted">
                    Data Nexus has no anomaly records for the current scan.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        <aside className="nx-panel nx-datanexus-sidebar">
          <div className="nx-panel-head">
            <div>
              <h2>Table Details</h2>
              <p className="nx-muted">Selected table attributes and insert shortcuts.</p>
            </div>
          </div>

          {selectedTable ? (
            <div className="nx-posture">
              <div className="nx-card nx-compact-card">
                <p>Selected Table</p>
                <h3 className="cyan">{selectedTable.tableName}</h3>
                <span className="nx-muted">{selectedTable.itemCount} items</span>
              </div>

              <h3>Attributes</h3>

              {selectedTable.attributes.map((attr) => (
                <button
                  className="nx-posture-row nx-attribute-button"
                  key={attr.AttributeName}
                  onClick={() => {
                    setQuery((current) =>
                      current.includes(attr.AttributeName)
                        ? current
                        : current.replace("SELECT", `SELECT ${attr.AttributeName},`)
                    );
                    setActiveTab("query");
                  }}
                >
                  <div>
                    <strong>{attr.AttributeName}</strong>
                    <p className="nx-muted">Click to insert into query</p>
                  </div>

                  <span className="nx-pill neutral">{attr.AttributeType}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="nx-empty-state compact">
              <strong>{loading ? "Loading schema" : "No table selected"}</strong>
              <p className="nx-muted">
                {loading
                  ? "Schema details are being discovered."
                  : "Select a table to inspect attributes."}
              </p>
            </div>
          )}
        </aside>
      </section>
    </NexusShell>
  );
}
