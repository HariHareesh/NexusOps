"use client";

import { useState } from "react";
import NexusShell from "../../../components/NexusShell";
import SkillRadar from "../../../components/career/SkillRadar";
import ScoreDonut from "../../../components/career/ScoreDonut";

type DomainScore = {
  domain: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
};

type CareerResult = {
  scoreData: {
    overallScore: number;
    domains: DomainScore[];
  };
  gapAnalysis: {
    targetRole: string;
    readinessScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    learningPath: {
      skill: string;
      priority: string;
      recommendation: string;
    }[];
  };
};

export default function CareerPage() {
  const [resumeText, setResumeText] = useState(
    "Node.js Express AWS Lambda DynamoDB React TypeScript Docker"
  );
  const [targetRole, setTargetRole] = useState("Backend Developer");
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [result, setResult] = useState<CareerResult | null>(null);

  const analyzeCareer = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/career/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          targetRole,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadedFileName(file.name);

    if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
      return;
    }

    setResumeText(
      `Uploaded file: ${file.name}\n\nPDF parsing will be connected in the backend upload pipeline.`
    );
  };

  const hasLearningPath = Boolean(result?.gapAnalysis.learningPath.length);

  return (
    <NexusShell>
      <header className="nx-header">
        <div>
          <p className="nx-kicker">Career Intelligence</p>
          <h2 className="nx-heading">AI Resume & Skill Intelligence</h2>
          <p className="nx-muted nx-lede">
            MS-07 analyzes resume text, scores skill domains, detects gaps, and
            recommends learning paths.
          </p>
        </div>

        <button
          className="nx-auth-submit nx-fit-btn"
          onClick={analyzeCareer}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </header>

      <section className="nx-data-layout nx-phase-layout">
        <aside className="nx-panel nx-phase-sidebar">
          <div className="nx-panel-head">
            <div>
              <h2>Resume Input</h2>
              <p className="nx-muted">
                Upload a resume or refine the parsed text before analysis.
              </p>
            </div>
          </div>

          <label className="nx-upload-zone">
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleResumeUpload}
              hidden
            />

            <span className="nx-upload-icon">TXT</span>
            <strong>Upload Resume</strong>

            <span className="nx-muted">
              Drop or select TXT/PDF resume file
            </span>

            {uploadedFileName && (
              <p className="nx-muted">Selected: {uploadedFileName}</p>
            )}
          </label>

          <textarea
            className="nx-query-textarea"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={12}
            placeholder="Paste resume text here..."
          />

          <select
            className="nx-select"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          >
            <option>Backend Developer</option>
            <option>Frontend Developer</option>
            <option>Cloud Engineer</option>
            <option>DevOps Engineer</option>
            <option>Security Engineer</option>
          </select>

          <button
            className="nx-auth-submit nx-fit-btn"
            onClick={analyzeCareer}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Run Career Analysis"}
          </button>
        </aside>

        <main className="nx-panel nx-phase-main">
          <div className="nx-panel-head">
            <div>
              <h2>Career Intelligence Results</h2>
              <p className="nx-muted">
                Skill scoring, readiness, and recommended next steps.
              </p>
            </div>
          </div>

          {loading ? (
            <section className="nx-phase-skeleton" aria-label="Loading career analysis">
              <div className="nx-grid">
                {[0, 1, 2, 3].map((item) => (
                  <div className="nx-card nx-metric-card nx-skeleton-card" key={item}>
                    <div className="nx-skeleton-line short" />
                    <div className="nx-skeleton-line" />
                    <div className="nx-skeleton-line mid" />
                  </div>
                ))}
              </div>

              <div className="nx-card nx-chart-card">
                <div className="nx-skeleton-line short" />
                <div className="nx-skeleton-chart" />
              </div>

              <div className="nx-feed">
                {[0, 1, 2].map((item) => (
                  <article className="nx-event skeleton" key={item}>
                    <div className="nx-skeleton-line mid" />
                    <div className="nx-skeleton-line" />
                  </article>
                ))}
              </div>
            </section>
          ) : !result ? (
            <div className="nx-empty-state">
              <strong>No career analysis yet</strong>
              <p className="nx-muted">
                Run analysis to view resume score, skill gaps, and recommendations.
              </p>
            </div>
          ) : (
            <>
              <section className="nx-grid">
                <div className="nx-card nx-metric-card nx-donut-card">
                  <ScoreDonut
                    score={result.scoreData.overallScore}
                    label="Resume Score"
                  />
                </div>

                <div className="nx-card nx-metric-card">
                  <p>Role Readiness</p>
                  <h3 className="green">
                    {result.gapAnalysis.readinessScore}%
                  </h3>
                  <span className="nx-muted">
                    {result.gapAnalysis.targetRole}
                  </span>
                </div>

                <div className="nx-card nx-metric-card">
                  <p>Matched Skills</p>
                  <h3 className="yellow">
                    {result.gapAnalysis.matchedSkills.length}
                  </h3>
                  <span className="nx-muted">Detected in resume</span>
                </div>

                <div className="nx-card nx-metric-card">
                  <p>Missing Skills</p>
                  <h3 className="red">
                    {result.gapAnalysis.missingSkills.length}
                  </h3>
                  <span className="nx-muted">Need improvement</span>
                </div>
              </section>

              <SkillRadar
                data={result.scoreData.domains.map((item) => ({
                  domain: item.domain,
                  score: item.score,
                }))}
              />

              <div className="nx-feed">
                <h3>Skill Domain Scores</h3>

                {result.scoreData.domains.map((domain) => (
                  <article className="nx-event live" key={domain.domain}>
                    <div className="nx-event-top">
                      <div>
                        <strong>{domain.domain}</strong>
                        <p className="nx-muted">
                          Matched:{" "}
                          {domain.matchedSkills.length
                            ? domain.matchedSkills.join(", ")
                            : "None"}
                        </p>
                      </div>

                      <span>{domain.score}%</span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="nx-learning-grid">
                <h3>AI Learning Path</h3>

                {hasLearningPath ? (
                  <div className="nx-learning-cards">
                    {result.gapAnalysis.learningPath.map((item, index) => (
                      <article className="nx-learning-card" key={item.skill}>
                        <div className="nx-learning-rank">{index + 1}</div>

                        <div>
                          <strong>{item.skill}</strong>

                          <p>{item.recommendation}</p>

                          <span className="nx-pill warning">
                            {item.priority}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="nx-empty-state compact">
                    <strong>No gaps detected</strong>
                    <p className="nx-muted">
                      This resume already aligns well with the selected role.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </section>
    </NexusShell>
  );
}
