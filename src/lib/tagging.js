const STOPWORDS = new Set(['the', 'is', 'at', 'which', 'and', 'on', 'a', 'an', 'to', 'for', 'with', 'it', 'this', 'that', 'of', 'in', 'have', 'has', 'do', 'does', 'are', 'was', 'were', 'be', 'been', 'my', 'your', 'their', 'our', 'not', 'no', 'what', 'why', 'how', 'when', 'where', 'who']);

export function extractKeywords(text) {
  if (!text) return [];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
  return [...new Set(words)];
}

export function groupProblems(problems) {
  const groups = {}; // tag/keyword -> array of problems
  
  problems.forEach(p => {
    let handled = false;
    if (p.tags && p.tags.length > 0) {
      p.tags.forEach(t => {
        if (!groups[t]) groups[t] = [];
        groups[t].push(p);
      });
      handled = true;
    }
    
    if (!handled) {
      const keywords = extractKeywords(p.problem);
      keywords.forEach(kw => {
        if (!groups[kw]) groups[kw] = [];
        groups[kw].push(p);
      });
    }
  });

  // Convert to array and sort by count descending
  const sortedGroups = Object.keys(groups).map(key => ({
    key,
    problems: [...new Set(groups[key])] // dedup in case a problem has multiple matching tags/keywords that get merged later?
  })).sort((a, b) => b.problems.length - a.problems.length);

  return sortedGroups;
}
