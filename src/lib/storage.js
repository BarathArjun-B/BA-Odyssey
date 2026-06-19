export const STORAGE_KEY = "ba_data_v1";

export const DEFAULT_DATA = {
  settings: {
    founderName: "",
    theme: "system",
    problemGoal: 1000,
    createdAt: new Date().toISOString()
  },
  problems: [],
  ideas: [],
  growth: {
    books: [],
    concepts: [],
    networking: [],
    skillsExperiments: []
  },
  operatingSystem: {
    dailyLogs: []
  },
  weeklyReviews: []
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load data", e);
    return DEFAULT_DATA;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
}

export function exportData() {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ba_export_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.settings || !parsed.problems) throw new Error("Invalid schema");
    saveData(parsed);
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
}

export function resetData() {
  saveData(DEFAULT_DATA);
}
