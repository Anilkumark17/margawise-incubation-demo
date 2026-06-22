export const ASSUMPTION_CATEGORIES = ['All', 'Idea', 'Customers', 'Market Lens']

export const RISK_ORDER = { Critical: 3, High: 2, Medium: 1, Low: 0 }

export const DEFAULT_ASSUMPTIONS = [
  {
    id: 'a1',
    number: 1,
    text: 'The AI/NLP translation of vague client feedback will be consistently accurate and actionable enough to significantly reduce PM effort.',
    source: 'AI',
    category: 'Idea',
    interview: 'Solution',
    risk: 'Critical',
    status: 'Untested',
    evidence: '',
    action: 'Add to interview',
  },
  {
    id: 'a2',
    number: 2,
    text: 'SME project managers perceive the cost of project delays and scope creep due to communication issues as high enough to justify a premium-priced solution.',
    source: 'AI',
    category: 'Market Lens',
    interview: 'Solution',
    risk: 'Critical',
    status: 'Untested',
    evidence: 'nnjklm .\nkkkkj',
    action: '—',
  },
  {
    id: 'a3',
    number: 3,
    text: 'SME project managers are actively seeking a dedicated solution for translating vague client feedback.',
    source: 'AI',
    category: 'Customers',
    interview: 'Discovery',
    risk: 'Critical',
    status: 'Untested',
    evidence: '',
    action: '—',
  },
  {
    id: 'a4',
    number: 4,
    text: 'SME project managers believe that a single platform can effectively address both communication translation and architectural visualization needs.',
    source: 'AI',
    category: 'Customers',
    interview: 'Discovery',
    risk: 'High',
    status: 'Untested',
    evidence: '',
    action: '—',
  },
  {
    id: 'a5',
    number: 5,
    text: 'The visualization of product architecture will be intuitive and comprehensive enough to be adopted by all key stakeholders (client, PM, dev).',
    source: 'AI',
    category: 'Idea',
    interview: 'Solution',
    risk: 'High',
    status: 'Untested',
    evidence: '',
    action: 'Add to interview',
  },
  {
    id: 'a6',
    number: 6,
    text: 'SME tech agencies are willing to integrate a new, comprehensive project management platform over existing, potentially entrenched, solutions.',
    source: 'AI',
    category: 'Market Lens',
    interview: 'Discovery',
    risk: 'High',
    status: 'Untested',
    evidence: '',
    action: '—',
  },
  {
    id: 'a7',
    number: 7,
    text: "The platform's features for preventing scope creep will be effective and easily integrated into existing agency workflows.",
    source: 'AI',
    category: 'Idea',
    interview: 'Solution',
    risk: 'Medium',
    status: 'Untested',
    evidence: '',
    action: 'Add to interview',
  },
]

export const INTERVIEW_FRAMEWORKS = [
  {
    id: 'fw-discovery',
    title: 'Customer & Problem Discovery',
    description: 'Validate who has this problem and how acutely they feel it.',
    validates: 'Customer + Problem assumptions',
    assumptionCount: 3,
    assumptionIds: ['a3', 'a4', 'a6'],
    status: 'Active',
    cta: 'Open interview',
  },
  {
    id: 'fw-solution',
    title: 'Solution & Idea Validation',
    description: 'Test whether your proposed solution resonates with the problem.',
    validates: 'Solution + Alternatives assumptions',
    assumptionCount: 4,
    assumptionIds: ['a1', 'a2', 'a5', 'a7'],
    status: 'Active',
    cta: 'Open interview',
  },
  {
    id: 'fw-pricing',
    title: 'Pricing & Commitment Signals',
    description: 'Understand willingness to pay and buying intent.',
    validates: 'Willingness to pay assumptions',
    assumptionCount: 0,
    assumptionIds: [],
    status: 'Active',
    cta: 'Set up interview',
  },
]

export const DEFAULT_INTERVIEW_SESSIONS = [
  {
    id: 'sess-1',
    title: 'interview with anil',
    framework: 'Solution & Idea Validation',
    frameworkId: 'fw-solution',
    sessions: 1,
    lastUpdated: '2d ago',
    assumptionLinks: [
      { assumptionId: 'a7', status: 'untested' },
      { assumptionId: 'a1', status: 'untested' },
      { assumptionId: 'a5', status: 'untested' },
      { assumptionId: 'a2', status: 'experiment designed' },
    ],
  },
  {
    id: 'sess-2',
    title: 'Customer & Problem Discovery Interview',
    framework: 'Customer & Problem Discovery',
    frameworkId: 'fw-discovery',
    sessions: 6,
    lastUpdated: 'Jun 2, 2026',
    assumptionLinks: [
      { assumptionId: 'a4', status: 'evidence collected' },
      { assumptionId: 'a3', status: 'evidence collected' },
      { assumptionId: 'a6', status: 'evidence collected' },
    ],
  },
]

export function getAssumptions(startup) {
  if (!startup.assumptions?.length) return DEFAULT_ASSUMPTIONS
  const hasRich = startup.assumptions.some((a) => a.category)
  if (!hasRich) return DEFAULT_ASSUMPTIONS
  return startup.assumptions
}

export function getInterviewSessions(startup) {
  const stored = startup.validation?.interviewSessions
  if (!stored?.length) return DEFAULT_INTERVIEW_SESSIONS
  return stored
}

export function getInterviewFrameworks(startup) {
  return startup.validation?.interviewFrameworks?.length
    ? startup.validation.interviewFrameworks
    : INTERVIEW_FRAMEWORKS
}

export function isAssumptionTested(status) {
  return !['Untested', 'Not Tested'].includes(status)
}

export function isAssumptionValidated(status) {
  return ['Validated', 'Evidence Collected'].includes(status)
}
