import { groupProblems } from './tagging.js';

export function getWeekRange(dateString) {
  const d = new Date(dateString + 'T12:00:00Z');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function computeReview(problems, ideas, targetDateString) {
  const { start, end } = getWeekRange(targetDateString);
  
  // Filter for this week
  const thisWeekProblems = problems.filter(p => {
    const d = new Date(p.createdAt || p.date);
    return d >= start && d <= end;
  });
  
  const thisWeekIdeas = ideas.filter(i => {
    const d = new Date(i.createdAt);
    return d >= start && d <= end;
  });

  // Previous week
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevEnd = new Date(end);
  prevEnd.setDate(prevEnd.getDate() - 7);
  
  const lastWeekProblems = problems.filter(p => {
    const d = new Date(p.createdAt || p.date);
    return d >= prevStart && d <= prevEnd;
  });
  
  const lastWeekIdeas = ideas.filter(i => {
    const d = new Date(i.createdAt);
    return d >= prevStart && d <= prevEnd;
  });

  // Top Recurring Problems
  const grouped = groupProblems(thisWeekProblems);
  const topRecurring = grouped.slice(0, 3);

  // Highest Pain Problems
  const highestPain = [...thisWeekProblems].sort((a, b) => {
    if (b.painLevel !== a.painLevel) return b.painLevel - a.painLevel;
    return b.peopleAffected - a.peopleAffected;
  }).slice(0, 5);

  // Most Valuable Opportunities
  const mostValuable = [...thisWeekIdeas].sort((a, b) => b.startupPotentialScore - a.startupPotentialScore).slice(0, 5);

  // Trends & Patterns
  const trends = [];
  
  // Tag pain trends
  const thisWeekTags = {};
  thisWeekProblems.forEach(p => {
    if(p.tags) p.tags.forEach(t => {
      if(!thisWeekTags[t]) thisWeekTags[t] = { sum: 0, count: 0 };
      thisWeekTags[t].sum += p.painLevel;
      thisWeekTags[t].count++;
    });
  });
  
  const lastWeekTags = {};
  lastWeekProblems.forEach(p => {
    if(p.tags) p.tags.forEach(t => {
      if(!lastWeekTags[t]) lastWeekTags[t] = { sum: 0, count: 0 };
      lastWeekTags[t].sum += p.painLevel;
      lastWeekTags[t].count++;
    });
  });

  Object.keys(thisWeekTags).forEach(tag => {
    if (lastWeekTags[tag]) {
      const thisAvg = thisWeekTags[tag].sum / thisWeekTags[tag].count;
      const lastAvg = lastWeekTags[tag].sum / lastWeekTags[tag].count;
      if (thisAvg - lastAvg >= 1.5) {
        trends.push(`Pain levels trending up in '${tag}' tagged problems.`);
      } else if (lastAvg - thisAvg >= 1.5) {
        trends.push(`Pain levels cooling down in '${tag}' tagged problems.`);
      }
      
      // Volume trends
      if (thisWeekTags[tag].count >= lastWeekTags[tag].count * 2 && thisWeekTags[tag].count > 1) {
        trends.push(`Problems tagged '${tag}' grew from ${lastWeekTags[tag].count} to ${thisWeekTags[tag].count} this week — an emerging cluster.`);
      }
    } else if (thisWeekTags[tag].count >= 3) {
      trends.push(`New strong cluster: ${thisWeekTags[tag].count} problems tagged '${tag}' this week.`);
    }
  });

  // Ideas trend
  const thisWeekHighQualityIdeas = thisWeekIdeas.filter(i => i.startupPotentialScore >= 70).length;
  const lastWeekHighQualityIdeas = lastWeekIdeas.filter(i => i.startupPotentialScore >= 70).length;
  
  if (thisWeekHighQualityIdeas > lastWeekHighQualityIdeas && thisWeekHighQualityIdeas > 0) {
    trends.push(`Quality up: You generated ${thisWeekHighQualityIdeas} high-potential ideas this week compared to ${lastWeekHighQualityIdeas} last week.`);
  }

  return {
    weekOf: start.toISOString().split('T')[0],
    topRecurring,
    highestPain,
    mostValuable,
    trends
  };
}
