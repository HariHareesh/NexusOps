"use client";

type ScoreDonutProps = {
  score: number;
  label: string;
};

export default function ScoreDonut({ score, label }: ScoreDonutProps) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="nx-score-donut">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r={radius}
          className="nx-score-bg"
        />

        <circle
          cx="75"
          cy="75"
          r={radius}
          className="nx-score-progress"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="nx-score-center">
        <strong>{score}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}