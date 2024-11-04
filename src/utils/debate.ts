// Add to utils/debate.ts

import { ITrendingDebate, IDebateStats, IDebateEngagement } from '@/types';

export function calculateTrendingScore(debate: ITrendingDebate): number {
  const now = Date.now();
  const debateAge = now - new Date(debate.metadata.startedAt).getTime();
  const decayFactor = Math.exp(-debateAge / (1000 * 60 * 60 * 24)); // 24-hour decay

  const engagementScore =
    debate.stats.views * 1 +
    debate.comments * 2 +
    debate.participants * 3 +
    debate.stats.shares * 4;

  const qualityScore = debate.topArguments.reduce(
    (acc, arg) => acc + arg.quality,
    0
  ) / debate.topArguments.length;

  return engagementScore * qualityScore * decayFactor;
}

export function getDebateActivityLevel(
  debate: ITrendingDebate
): 'low' | 'medium' | 'high' | 'viral' {
  const score = calculateTrendingScore(debate);
  
  if (score > 1000) return 'viral';
  if (score > 500) return 'high';
  if (score > 100) return 'medium';
  return 'low';
}

export function formatDebateTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

export function categorizeDebate(debate: ITrendingDebate) {
  return {
    isHot: calculateTrendingScore(debate) > 500,
    isFeatured: debate.stats.quality > 0.8,
    isControversial: debate.stats.controversyScore > 0.7,
    trending: debate.trend > 50,
  };
}

export function getDebateInsights(stats: IDebateStats) {
  return {
    peakHours: getPeakActivityHours(stats),
    participantDemographics: getParticipantDemographics(stats),
    qualityMetrics: getQualityMetrics(stats),
    trendPrediction: predictTrend(stats),
  };
}

export function validateDebateRules(debate: ITrendingDebate): string[] {
  const violations = [];
  
  if (!debate.metadata.rules?.length) {
    violations.push('Missing debate rules');
  }
  
  if (debate.topArguments.some(arg => arg.quality < 0.5)) {
    violations.push('Low quality arguments detected');
  }
  
  return violations;
}

export function generateDebateReport(debate: ITrendingDebate) {
  const stats = debate.stats;
  const quality = calculateDebateQuality(debate);
  const insights = getDebateInsights(stats);
  
  return {
    summary: {
      title: debate.title,
      category: debate.category,
      duration: formatDebateDuration(debate),
      participantCount: debate.participants,
      argumentCount: debate.topArguments.length,
    },
    metrics: {
      engagement: calculateEngagementScore(stats),
      quality,
      trend: debate.trend,
      controversyLevel: stats.controversyScore,
    },
    insights,
    recommendations: generateRecommendations(debate),
  };
}