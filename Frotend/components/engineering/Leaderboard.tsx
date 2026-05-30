"use client";

type LeaderboardUser = {
  rank: number;
  name: string;
  score: number;
  commits: number;
  prs: number;
};

type LeaderboardProps = {
  users: LeaderboardUser[];
};

export default function Leaderboard({ users }: LeaderboardProps) {
  return (
    <div className="nx-panel nx-leaderboard-panel">
      <div className="nx-panel-head">
        <div>
          <h2>Developer Leaderboard</h2>
          <p className="nx-muted">Contribution score, commits, and PR throughput.</p>
        </div>
      </div>

      <div className="nx-leaderboard">
        {users.map((user) => (
          <article key={user.rank} className="nx-leader-card">
            <div className="nx-rank-badge">#{user.rank}</div>

            <div className="nx-leader-info">
              <strong>{user.name}</strong>

              <p>
                Commits: {user.commits} - PRs: {user.prs}
              </p>
            </div>

            <div className="nx-leader-score">
              <span>Score</span>
              {user.score}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
