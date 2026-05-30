const { skillKeywords } = require("./resumeScorer");

const roleTargets = {
  "Backend Developer": [
    "node.js",
    "express",
    "api",
    "microservice",
    "dynamodb",
    "aws",
    "lambda",
  ],
  "Frontend Developer": [
    "react",
    "next.js",
    "typescript",
    "tailwind",
    "html",
    "css",
  ],
  "Cloud Engineer": [
    "aws",
    "lambda",
    "s3",
    "dynamodb",
    "cloudwatch",
    "eventbridge",
  ],
  "DevOps Engineer": [
    "docker",
    "kubernetes",
    "ci/cd",
    "github actions",
    "jenkins",
  ],
  "Security Engineer": [
    "iam",
    "jwt",
    "cognito",
    "vulnerability",
    "cve",
    "security",
  ],
};

function analyzeSkillGap(text = "", targetRole = "Backend Developer") {
  const lowerText = text.toLowerCase();
  const requiredSkills = roleTargets[targetRole] || roleTargets["Backend Developer"];

  const matchedSkills = requiredSkills.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !matchedSkills.includes(skill)
  );

  const readinessScore = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100
  );

  const learningPath = missingSkills.map((skill) => ({
    skill,
    priority: "HIGH",
    recommendation: `Build one small project using ${skill}`,
  }));

  return {
    targetRole,
    readinessScore,
    matchedSkills,
    missingSkills,
    learningPath,
    roleTargets,
    skillDomains: Object.keys(skillKeywords),
  };
}

module.exports = {
  analyzeSkillGap,
  roleTargets,
};