// contextSelector.js
// Maps intent to required context sections

const intentToContext = {
  ask_advice: ["profile", "contest_history", "submission_patterns", "weak_areas", "strong_areas", "learning_goals"],
  explain: ["profile", "strong_areas"],
  debug: ["submission_patterns", "contest_history"],
  suggest_problems: ["weak_areas", "strong_areas", "contest_history"],
  review_performance: ["contest_history", "performance_metrics"],
  general_advice: ["profile", "strong_areas", "weak_areas", "learning_goals"],
  unknown: ["profile"]
};

function selectContext(intent) {
  return intentToContext[intent] || intentToContext.unknown;
}

module.exports = selectContext;
