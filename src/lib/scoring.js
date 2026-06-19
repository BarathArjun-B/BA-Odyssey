export function calculateStreak(problems) {
  if (!problems || problems.length === 0) return 0;
  
  const dates = [...new Set(problems.map(p => p.date))].sort().reverse();
  if (dates.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecent = new Date(dates[0] + 'T12:00:00Z');
  mostRecent.setHours(0, 0, 0, 0);
  
  const diffFromToday = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
  
  if (diffFromToday > 1) return 0;
  
  let streak = 1;
  let currentDate = mostRecent;
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i] + 'T12:00:00Z');
    prevDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  
  return streak;
}

export function getFounderScore(data) {
  let score = 0;
  let lastProblemDate = null;
  
  data.problems.forEach(p => {
    score += 2;
    const hasOptional = p.currentSolution && p.whyBad && p.marketSizeEstimate && p.notes && p.myIdea && p.tags && p.tags.length > 0;
    if (hasOptional) score += 3;

    if (!lastProblemDate || new Date(p.date) > new Date(lastProblemDate)) {
      lastProblemDate = p.date;
    }
  });

  data.ideas.forEach(i => {
    score += 5;
    if (i.startupPotentialScore >= 70) score += 5;
  });

  data.operatingSystem.dailyLogs.forEach(log => {
    let checkedCount = 0;
    const items = ['dsa', 'building', 'businessReading', 'problemCollection', 'networking', 'reflection'];
    items.forEach(item => {
      if (log[item]) checkedCount++;
    });
    score += checkedCount;
    if (checkedCount === 6) score += 3;
  });

  score += data.weeklyReviews.length * 10;

  score += data.growth.books.length * 3;
  score += data.growth.concepts.length * 3;
  score += data.growth.networking.length * 3;
  score += data.growth.skillsExperiments.length * 3;

  const streak = calculateStreak(data.problems);
  let streakBonus = streak * 0.5;
  if (streakBonus > 30) streakBonus = 30;
  score += Math.floor(streakBonus);

  if (lastProblemDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = new Date(lastProblemDate + 'T12:00:00Z');
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 3) {
      const decayDays = diffDays - 3;
      const decayFactor = 1 - (decayDays * 0.01);
      score = Math.floor(score * Math.max(decayFactor, 0));
    }
  }

  return Math.min(Math.max(score, 0), 9999);
}

export function computeDemandScore(willingnessToPay, peopleAffected, marketSizeEstimate) {
  let marketSizeWeight = 3; // Niche
  if (marketSizeEstimate === "Medium") marketSizeWeight = 6;
  if (marketSizeEstimate === "Large") marketSizeWeight = 8;
  if (marketSizeEstimate === "Massive") marketSizeWeight = 10;

  const score = (willingnessToPay * 0.5) + (peopleAffected * 0.3) + (marketSizeWeight * 0.2);
  return Math.min(Math.max(score, 0), 10);
}

export function computeStartupPotentialScore(painLevel, demandScore, canIBuild, frequency) {
  let frequencyWeight = 5; // One-off
  if (frequency === "Daily") frequencyWeight = 100;
  if (frequency === "Weekly") frequencyWeight = 70;
  if (frequency === "Monthly") frequencyWeight = 40;
  if (frequency === "Rarely") frequencyWeight = 15;

  const score = (painLevel * 10 * 0.30) + 
                (demandScore * 10 * 0.30) + 
                (canIBuild * 10 * 0.20) + 
                (frequencyWeight * 0.20);
                
  return Math.floor(Math.min(Math.max(score, 0), 100));
}

export function getStatusStamp(startupPotentialScore) {
  if (startupPotentialScore >= 75) return "HIGH POTENTIAL";
  if (startupPotentialScore >= 50) return "VALIDATED";
  if (startupPotentialScore >= 30) return "NEEDS DATA";
  return "ARCHIVED";
}

export function getDifficulty(canIBuildAverage) {
  if (canIBuildAverage >= 8) return "Low";
  if (canIBuildAverage >= 4) return "Medium";
  return "High";
}
