export const FEED_PRIORITY = ['culture', 'heritage', 'tourism', 'music', 'news', 'comedy', 'cinema', 'announcement'];

export function buildBlendedFeedOrder(categoryIds = ['all']) {
  const requested = Array.isArray(categoryIds)
    ? categoryIds.filter(Boolean)
    : [categoryIds].filter(Boolean);

  const hasAll = requested.includes('all');
  const ordered = [];
  const seen = new Set();

  for (const category of FEED_PRIORITY) {
    if ((hasAll || requested.includes(category)) && !seen.has(category)) {
      seen.add(category);
      ordered.push(category);
    }
  }

  for (const category of requested) {
    if (category !== 'all' && !seen.has(category)) {
      seen.add(category);
      ordered.push(category);
    }
  }

  if (hasAll && !ordered.includes('all')) {
    ordered.push('all');
  }

  return ordered;
}

export function mergeCategoryVideoResults(videoEntries = []) {
  const uniqueById = new Map();

  for (const item of videoEntries) {
    if (!item || !item.id) continue;
    if (!uniqueById.has(item.id)) {
      uniqueById.set(item.id, item);
    }
  }

  const rankMap = new Map(buildBlendedFeedOrder().map((category, index) => [category, index]));

  return [...uniqueById.values()].sort((a, b) => {
    const aPriority = rankMap.get(a.category || 'all') ?? 999;
    const bPriority = rankMap.get(b.category || 'all') ?? 999;
    return aPriority - bPriority;
  });
}
