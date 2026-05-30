const analyzeEventSeverity = (eventType) => {
  const criticalEvents = [
    "SERVICE_DOWN",
    "SECURITY_BREACH",
    "DATABASE_FAILURE"
  ];

  const warningEvents = [
    "HIGH_CPU_USAGE",
    "HIGH_MEMORY_USAGE",
    "API_LATENCY"
  ];

  if (criticalEvents.includes(eventType)) {
    return "CRITICAL";
  }

  if (warningEvents.includes(eventType)) {
    return "WARNING";
  }

  return "INFO";
};

module.exports = {
  analyzeEventSeverity
};