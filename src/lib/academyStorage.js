const ACADEMY_NAMESPACE = 'ba_academy_v1';

export function saveAcademyData(key, value) {
  const data = JSON.parse(localStorage.getItem(ACADEMY_NAMESPACE) || '{}');
  data[key] = value;
  localStorage.setItem(ACADEMY_NAMESPACE, JSON.stringify(data));
}

export function getAcademyData(key, defaultValue) {
  const data = JSON.parse(localStorage.getItem(ACADEMY_NAMESPACE) || '{}');
  return data[key] ?? defaultValue;
}

export function clearAcademyData() {
  localStorage.removeItem(ACADEMY_NAMESPACE);
}

// Initial state initialization if needed
export function initializeAcademyData() {
  const existing = localStorage.getItem(ACADEMY_NAMESPACE);
  if (!existing) {
    const defaultData = {
      modules: {
        startupFundamentals: { completed: [], currentTopic: 'problemFirstThinking', progress: 0, readingHistory: [] },
        founderThinking: { completed: [], currentTopic: 'customerObsession', progress: 0, readingHistory: [] },
        productThinking: { completed: [], currentTopic: 'jtbd', progress: 0, readingHistory: [] },
        leadership: { completed: [], currentTopic: 'communication', progress: 0, readingHistory: [] },
        decisionSimulator: { scenariosCompleted: 0, currentScenario: 1, performance: {}, decisions: [] },
        dailyMissions: { todaysMission: null, completedThisWeek: 0, history: [] },
        mentorConversations: []
      },
      founderIQ: {
        observation: 0.0,
        consistency: 0.0,
        customerUnderstanding: 0.0,
        execution: 0.0,
        validation: 0.0,
        leadership: 0.0,
        learning: 0.0,
        decisionMaking: 0.0,
        productThinking: 0.0,
        overallScore: 0.0,
        lastUpdated: new Date().toISOString()
      },
      knowledgeGraph: {
        nodes: [],
        edges: []
      },
      missionDebriefs: []
    };
    localStorage.setItem(ACADEMY_NAMESPACE, JSON.stringify(defaultData));
  }
}
