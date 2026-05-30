"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type SkillRadarProps = {
  data: {
    domain: string;
    score: number;
  }[];
};

export default function SkillRadar({ data }: SkillRadarProps) {
  return (
    <div className="nx-card nx-chart-card nx-skill-radar">
      <div className="nx-chart-head">
        <div>
          <h3>Skill Gap Radar</h3>
          <p className="nx-muted">Domain strength against the selected role.</p>
        </div>
      </div>

      <div className="nx-radar-wrap">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="domain" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />

            <Radar
              name="Skill Score"
              dataKey="score"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
