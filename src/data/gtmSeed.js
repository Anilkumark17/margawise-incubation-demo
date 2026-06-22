const GTM_EXPERTISE_WEIGHTS = {
  GTM: 3,
  Marketing: 2.5,
  'B2B Sales': 2.5,
  Sales: 2,
  'Product Management': 1.5,
  SaaS: 1,
  'Startup Validation': 0.5,
}

export function scoreMentorForGtm(mentor, startup) {
  if (mentor.status !== 'Approved') return 0
  let score = mentor.rating * 2
  mentor.expertise.forEach((tag) => {
    score += GTM_EXPERTISE_WEIGHTS[tag] || 0.5
  })
  if (startup.industry?.toLowerCase().includes('saas') && mentor.expertise.includes('SaaS')) score += 1
  if (startup.stage === 'GTM') score += 0.5
  return Math.round(score * 10) / 10
}

export function getGtmRecommendations(startup, mentors = []) {
  const approved = mentors.filter((m) => m.status === 'Approved')
  const scored = approved
    .map((m) => ({
      mentor: m,
      score: scoreMentorForGtm(m, startup),
      matchReason: getMatchReason(m, startup),
      talkingPoints: getTalkingPoints(m, startup),
    }))
    .sort((a, b) => b.score - a.score)

  const best = scored[0]
  const rest = scored.slice(1, 4)

  return {
    bestMentor: best
      ? {
          ...best,
          headline: `Best match for ${startup.name}'s GTM stage`,
          whyBest: buildWhyBest(best, startup),
        }
      : null,
    recommendations: rest.map((r, i) => ({
      ...r,
      rank: i + 2,
    })),
    gtmPlaybook: DEFAULT_GTM_PLAYBOOK,
    stageNote: startup.stageNotes?.gtm || '',
  }
}

function getMatchReason(mentor, startup) {
  const tags = mentor.expertise.filter((e) =>
    ['GTM', 'Marketing', 'B2B Sales', 'Sales', 'SaaS'].includes(e)
  )
  if (tags.includes('GTM') && tags.includes('Marketing')) {
    return 'Strong GTM + marketing track record for B2B SaaS launches'
  }
  if (tags.includes('GTM')) return 'Deep go-to-market expertise for early-stage startups'
  if (tags.includes('Marketing')) return 'Growth and channel strategy specialist'
  return 'Relevant industry experience for your stage'
}

function getTalkingPoints(mentor, startup) {
  const points = []
  if (mentor.expertise.includes('GTM')) {
    points.push(`Review your ICP definition against ${startup.industry} buyers`)
    points.push('Pressure-test pricing and packaging before scaling outreach')
  }
  if (mentor.expertise.includes('Marketing')) {
    points.push('Validate your primary channel hypothesis from validation phase')
    points.push('Plan a 2-week demand-gen experiment with clear success metrics')
  }
  if (mentor.expertise.includes('B2B Sales') || mentor.expertise.includes('Sales')) {
    points.push('Build an outbound playbook for beachhead customer profile')
  }
  if (points.length === 0) {
    points.push('Walk through your validation evidence and MVP learnings')
    points.push('Identify the single metric that proves GTM traction')
  }
  return points.slice(0, 3)
}

function buildWhyBest(best, startup) {
  const m = best.mentor
  return `${m.name} scores highest for ${startup.name} based on GTM expertise (${m.expertise.filter((e) => ['GTM', 'Marketing', 'Sales', 'B2B Sales'].includes(e)).join(', ')}), ${m.yearsExperience} years experience, and a ${m.rating}★ rating across ${m.totalSessions} sessions.`
}

const DEFAULT_GTM_PLAYBOOK = {
  icpReminder:
    'Your beachhead from validation: agency project leads at 10–20 person dev shops who own client-to-dev translation.',
  channelFocus:
    'Primary channel from Explore: LinkedIn communities + agency founder networks. Run one channel for 2 weeks before expanding.',
  pricingNote:
    'Economics step suggested ₹2,500/mo team plan — validate willingness-to-pay before heavy outbound.',
  firstWeek: [
    'Book mentor session to review ICP and positioning',
    'Launch LinkedIn content series targeting agency PM pain points',
    'Run 10 outbound conversations with validated beachhead profile',
    'Set success metric: 3 paid pilots or 15 qualified demos in 30 days',
  ],
}
