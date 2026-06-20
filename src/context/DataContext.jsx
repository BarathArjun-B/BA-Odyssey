/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { loadData, saveData } from '../lib/storage.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(() => loadData());

  useEffect(() => {
    if (data) {
      saveData(data);
    }
  }, [data]);

  if (!data) return null; // or loading spinner

  const updateSettings = (newSettings) => {
    setData(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
  };

  const addProblem = (problem) => {
    setData(prev => ({
      ...prev,
      problems: [problem, ...prev.problems]
    }));
  };

  const updateProblem = (id, updates) => {
    setData(prev => ({
      ...prev,
      problems: prev.problems.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const addIdea = (idea) => {
    setData(prev => ({
      ...prev,
      ideas: [idea, ...prev.ideas]
    }));
  };

  const updateIdea = (id, updates) => {
    setData(prev => ({
      ...prev,
      ideas: prev.ideas.map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  };

  const addGrowthItem = (category, item) => {
    setData(prev => ({
      ...prev,
      growth: {
        ...prev.growth,
        [category]: [item, ...prev.growth[category]]
      }
    }));
  };

  const toggleOSItem = (dateStr, itemKey, value) => {
    setData(prev => {
      const logs = [...prev.operatingSystem.dailyLogs];
      const existingIdx = logs.findIndex(l => l.date === dateStr);
      if (existingIdx >= 0) {
        logs[existingIdx] = { ...logs[existingIdx], [itemKey]: value };
      } else {
        const newLog = { date: dateStr, dsa: false, building: false, businessReading: false, problemCollection: false, networking: false, reflection: false };
        newLog[itemKey] = value;
        logs.push(newLog);
      }
      return {
        ...prev,
        operatingSystem: { ...prev.operatingSystem, dailyLogs: logs }
      };
    });
  };

  const saveWeeklyReview = (review) => {
    setData(prev => {
      const existing = prev.weeklyReviews.find(r => r.weekOf === review.weekOf);
      if (existing) {
        return {
          ...prev,
          weeklyReviews: prev.weeklyReviews.map(r => r.weekOf === review.weekOf ? { ...r, ...review } : r)
        };
      }
      return {
        ...prev,
        weeklyReviews: [review, ...prev.weeklyReviews]
      };
    });
  };

  const forceReloadData = () => {
    setData(loadData());
  };

  return (
    <DataContext.Provider value={{
      data,
      updateSettings,
      addProblem,
      updateProblem,
      addIdea,
      updateIdea,
      addGrowthItem,
      toggleOSItem,
      saveWeeklyReview,
      forceReloadData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}
