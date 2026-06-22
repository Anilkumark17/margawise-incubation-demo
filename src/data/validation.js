import { createExploreWizardSeed, EXPLORE_STEPS } from './exploreWizardSeed.js'
import {
  DEFAULT_ASSUMPTIONS,
  INTERVIEW_FRAMEWORKS,
  DEFAULT_INTERVIEW_SESSIONS,
} from './assumptionsSeed.js'

export const VALIDATION_PHASES = [
  {
    id: 'explore',
    number: 1,
    title: 'Explore',
    headline: 'Your Idea',
    steps: [
      { id: 'problem', label: 'Problem' },
      { id: 'customer', label: 'Customer' },
      { id: 'market', label: 'Market' },
      { id: 'channel', label: 'Channel' },
      { id: 'economics', label: 'Economics' },
      { id: 'solution', label: 'Solution' },
    ],
  },
  {
    id: 'assumed',
    number: 2,
    title: 'Assumed',
    steps: [{ id: 'assumptions', label: 'Assumptions' }],
  },
  {
    id: 'validate',
    number: 3,
    title: 'Validate',
    steps: [
      { id: 'interviews', label: 'Interviews' },
      { id: 'surveys', label: 'Surveys' },
      { id: 'experiments', label: 'Experiments' },
    ],
  },
  {
    id: 'next',
    number: 4,
    title: 'Next Steps',
    steps: [{ id: 'decision', label: 'Decision' }],
  },
]

export const DEFAULT_EXPLORE = {
  problem: {
    summary: '',
    complete: false,
    placeholder: 'What problem are you solving? Who feels this pain most acutely?',
  },
  customer: {
    summary: '',
    complete: false,
    placeholder: 'Who is your target customer? Define their persona and segment.',
  },
  market: {
    summary: '',
    complete: false,
    placeholder: 'How big is the market? Who are competitors and alternatives?',
  },
  channel: {
    summary: '',
    complete: false,
    placeholder: 'How will you reach customers? Distribution and acquisition channels.',
  },
  economics: {
    summary: '',
    complete: false,
    placeholder: 'Unit economics, pricing model, and willingness to pay.',
  },
  solution: {
    summary: '',
    complete: false,
    placeholder: 'What is your proposed solution? How does it solve the problem?',
  },
}

export const SAMPLE_VALIDATION = {
  exploreWizard: createExploreWizardSeed(),
  explore: {
    problem: { complete: false },
    customer: { complete: false },
    market: { complete: false },
    channel: { complete: false },
    economics: { complete: false },
    solution: { complete: false },
  },
  surveys: [
    { id: 'sv-1', title: 'Agency PM Pain Points Survey', responses: 45, status: 'Completed', questionCount: 14 },
    { id: 'sv-2', title: 'Willingness to Pay — SME Tech Agencies', responses: 28, status: 'In Progress', questionCount: 10 },
    { id: 'sv-3', title: 'Client Feedback Workflow Assessment', responses: 12, status: 'In Progress', questionCount: 8 },
  ],
  experiments: [
    { id: 'ex-1', name: 'Landing Page — Feedback Translation Tool', hypothesis: 'Agency PMs will sign up for early access if we promise to reduce rework', status: 'Validated', result: '8% conversion, 96 sign-ups from LinkedIn communities' },
    { id: 'ex-2', name: 'Pricing Sensitivity — ₹2,500/mo Team Plan', hypothesis: 'SME agencies will pay ₹2,500/mo for specialized feedback translation', status: 'In Progress', result: 'Testing with 15 agency founders' },
    { id: 'ex-3', name: 'AI Translation Accuracy Prototype', hypothesis: 'AI can convert vague feedback into actionable tasks with 80%+ accuracy', status: 'In Progress', result: 'Internal test with 20 sample feedback snippets' },
  ],
  interviewFrameworks: INTERVIEW_FRAMEWORKS,
  interviewSessions: DEFAULT_INTERVIEW_SESSIONS,
  decision: null,
}

export function getValidation(startup) {
  const v = startup.validation || {}
  const explore = {}
  for (const key of Object.keys(DEFAULT_EXPLORE)) {
    explore[key] = { ...DEFAULT_EXPLORE[key], ...v.explore?.[key] }
  }
  return {
    explore,
    exploreWizard: v.exploreWizard ?? null,
    surveys: v.surveys ?? [],
    experiments: v.experiments ?? [],
    interviewFrameworks: v.interviewFrameworks?.length ? v.interviewFrameworks : INTERVIEW_FRAMEWORKS,
    interviewSessions: v.interviewSessions?.length ? v.interviewSessions : DEFAULT_INTERVIEW_SESSIONS,
    decision: v.decision ?? null,
  }
}

export function getExploreProgress(explore, exploreWizard) {
  if (exploreWizard) {
    const complete = EXPLORE_STEPS.filter((s) => exploreWizard[s.id]?.complete).length
    return { complete, total: EXPLORE_STEPS.length }
  }
  const keys = Object.keys(DEFAULT_EXPLORE)
  const complete = keys.filter((k) => explore[k]?.complete).length
  return { complete, total: keys.length }
}

export function getActivePhase(startup, metrics) {
  const v = getValidation(startup)
  const explore = getExploreProgress(v.explore, v.exploreWizard)
  if (explore.complete < explore.total) return 'explore'
  if (startup.assumptions?.length === 0) return 'assumed'
  const tested = metrics.tested
  if (tested < startup.assumptions?.length || metrics.completed < 2) return 'validate'
  if (!v.decision) return 'next'
  return 'next'
}

export function getPhaseStatus(phaseId, startup, metrics) {
  const v = getValidation(startup)
  const explore = getExploreProgress(v.explore, v.exploreWizard)

  switch (phaseId) {
    case 'explore':
      if (explore.complete === explore.total) return 'done'
      if (explore.complete > 0) return 'active'
      return 'active'
    case 'assumed':
      if (startup.assumptions?.some((a) => a.category)) return metrics.tested > 0 ? 'done' : 'active'
      if (explore.complete < explore.total) return 'locked'
      return 'active'
    case 'validate':
      if (!startup.assumptions?.length) return 'locked'
      if (v.decision) return 'done'
      return 'active'
    case 'next':
      if (metrics.validated >= 1 || metrics.completed >= 2) return 'active'
      return 'locked'
    default:
      return 'locked'
  }
}
