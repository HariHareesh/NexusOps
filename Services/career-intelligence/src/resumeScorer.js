const skillKeywords = {
  Cloud: ["aws", "lambda", "s3", "dynamodb", "eventbridge", "cloudwatch"],
  DevOps: ["docker", "kubernetes", "ci/cd", "github actions", "jenkins"],
  Security: ["jwt", "iam", "cognito", "vulnerability", "cve", "security"],
  Frontend: ["react", "next.js", "typescript", "tailwind", "html", "css"],
  Backend: ["node.js", "express", "api", "microservice", "serverless"],
  Data: ["sql", "dynamodb", "analytics", "etl", "pipeline"],
  AI: ["ai", "machine learning", "nlp", "comprehend", "llm"],
  Networking: ["http", "dns", "tcp", "routing", "load balancer"],
};

function scoreResume(text = "") {
  const lowerText = text.toLowerCase();

  const domains = Object.entries(skillKeywords).map(([domain, skills]) => {
    const matchedSkills = skills.filter((skill) =>
      lowerText.includes(skill.toLowerCase())
    );

    const score = Math.min(
      100,
      Math.round((matchedSkills.length / skills.length) * 100)
    );

    return {
      domain,
      score,
      matchedSkills,
      missingSkills: skills.filter((skill) => !matchedSkills.includes(skill)),
    };
  });

  const overallScore = Math.round(
    domains.reduce((sum, item) => sum + item.score, 0) / domains.length
  );

  return {
    overallScore,
    domains,
  };
}

module.exports = {
  scoreResume,
  skillKeywords,
};