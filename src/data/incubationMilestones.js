import { calcValidationMetrics } from './seed'

export function getMilestoneTemplate(stage) {
  if (stage === 'Validation') {
    return {
      name: 'Validation Evidence Sprint',
      tasks: [
        'Run customer interviews and capture evidence',
        'Update assumption board with interview outcomes',
        'Submit build/pivot/kill review packet',
      ],
      mentorFeedback:
        'Founder should tighten problem framing and gather stronger evidence before scaling build effort.',
    }
  }
  if (stage === 'MVP') {
    return {
      name: 'MVP Build Sprint',
      tasks: [
        'Ship core feature slice to pilot users',
        'Track feature usage and issue log weekly',
        'Review mentor notes and prioritize backlog',
      ],
      mentorFeedback:
        'Good execution pace. Focus on reducing onboarding friction before adding new feature modules.',
    }
  }
  return {
    name: 'GTM Traction Sprint',
    tasks: [
      'Finalize ICP and messaging narrative',
      'Run outbound + inbound experiments in one channel',
      'Track conversion from meeting to paid pilot',
    ],
    mentorFeedback:
      'Strong market pull. Double down on highest-performing channel and tighten founder-led sales motion.',
  }
}

export function getRecommendation(metrics, startup) {
  if (metrics.validated >= 3 && metrics.completed >= 3) {
    return {
      decision: 'Double Down',
      status: 'Validated',
      reason: 'Multiple assumptions validated and interview evidence is strong. Expand execution on the winning path.',
    }
  }
  if (metrics.validated === 0 && metrics.completed >= 2) {
    return {
      decision: 'Pivot',
      status: 'At Risk',
      reason: 'Evidence is collected but core assumptions are not validated. Adjust customer segment or value proposition.',
    }
  }
  if (startup.stage === 'Validation' && metrics.completed === 0) {
    return {
      decision: 'Kill',
      status: 'Blocked',
      reason: 'No evidence velocity in validation stage. Pause this thesis unless team can restart discovery immediately.',
    }
  }
  return {
    decision: 'Pivot',
    status: 'In Progress',
    reason: 'Signal quality is mixed. Keep testing but pivot positioning and tighten milestone accountability.',
  }
}

export function getStartupIncubationSnapshot(startup) {
  const metrics = calcValidationMetrics(startup)
  const milestone = getMilestoneTemplate(startup.stage)
  const completedSubtasks = Math.min(
    milestone.tasks.length,
    Math.max(
      1,
      Math.round((metrics.tested / Math.max(1, startup.assumptions?.length || 1)) * milestone.tasks.length)
    )
  )
  const recommendation = getRecommendation(metrics, startup)

  return {
    metrics,
    milestone,
    completedSubtasks,
    recommendation,
  }
}

