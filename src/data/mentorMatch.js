import { getMvpPlan } from './mvpSeed'

const STAGE_CONFIG = {
  Validation: {
    label: 'Validation mentor',
    subtitle: 'Product leader in your domain',
    expertisePriority: ['Startup Validation', 'Product Management', 'SaaS'],
  },
  MVP: {
    label: 'MVP mentor',
    subtitle: 'Built with similar tech stack',
    expertisePriority: ['AI', 'Product Management', 'SaaS'],
  },
  GTM: {
    label: 'GTM mentor',
    subtitle: 'Marketing & growth specialist',
    expertisePriority: ['Marketing', 'GTM', 'B2B Sales', 'Sales'],
  },
}

function industryMatch(mentor, industry) {
  const ind = (industry || '').toLowerCase()
  const exp = (mentor.industryExpertise || '').toLowerCase()
  if (!ind) return false
  const tokens = ['saas', 'ai', 'edtech', 'fintech', 'health', 'tech', 'b2b']
  return tokens.some((t) => ind.includes(t) && (exp.includes(t) || mentor.expertise.some((e) => e.toLowerCase().includes(t))))
}

function techMatch(mentor, startup) {
  const plan = getMvpPlan(startup)
  const stackText = (plan.techStack || [])
    .map((t) => `${t.tech} ${t.layer}`)
    .join(' ')
    .toLowerCase()
  let score = 0
  const mentorTech = (mentor.techStack || []).map((t) => t.toLowerCase())

  mentorTech.forEach((t) => {
    if (stackText.includes(t)) score += 2
  })

  if (stackText.includes('ai') || stackText.includes('openai')) {
    if (mentor.expertise.includes('AI') || mentorTech.some((t) => t.includes('ai'))) score += 3
  }
  if (stackText.includes('react') || stackText.includes('node')) {
    if (mentor.expertise.includes('SaaS') || mentorTech.some((t) => t.includes('react') || t.includes('node'))) score += 2
  }
  if (mentor.expertise.includes('AI') && (startup.industry || '').toLowerCase().includes('ai')) score += 2
  return score
}

function scoreForStage(mentor, startup, stage) {
  if (mentor.status !== 'Approved') return 0
  let score = mentor.rating * 2 + mentor.yearsExperience * 0.1
  const cfg = STAGE_CONFIG[stage]
  if (!cfg) return 0

  cfg.expertisePriority.forEach((tag, i) => {
    if (mentor.expertise.includes(tag)) score += 4 - i * 0.5
  })

  if (stage === 'Validation') {
    if (mentor.expertise.includes('Product Management')) score += 2
    if (industryMatch(mentor, startup.industry)) score += 3
    if (mentor.expertise.includes('Startup Validation')) score += 2
  }

  if (stage === 'MVP') {
    score += techMatch(mentor, startup)
    if (mentor.industryExpertise?.toLowerCase().includes('ai')) score += 1.5
  }

  if (stage === 'GTM') {
    if (mentor.expertise.includes('Marketing')) score += 2
    if (mentor.expertise.includes('GTM')) score += 1.5
  }

  return Math.round(score * 10) / 10
}

function getReasonForStage(mentor, startup, stage) {
  const ind = startup.industry || 'your space'
  if (stage === 'Validation') {
    if (mentor.expertise.includes('Product Management') && industryMatch(mentor, startup.industry)) {
      return `PM with ${mentor.yearsExperience}+ years in ${mentor.industryExpertise} — aligned with ${ind}`
    }
    if (mentor.expertise.includes('Startup Validation')) {
      return 'Specialist in customer discovery and assumption testing for early-stage founders'
    }
    return `Product mentor experienced in ${mentor.industryExpertise}`
  }
  if (stage === 'MVP') {
    if (mentor.expertise.includes('AI')) {
      return 'Built and shipped AI products — matches your proposed AI/ML stack'
    }
    return `Shipped SaaS MVPs in ${mentor.industryExpertise} — familiar with your tech choices`
  }
  if (stage === 'GTM') {
    if (mentor.expertise.includes('Marketing') && mentor.expertise.includes('GTM')) {
      return 'Growth leader who scaled PLG and marketing channels for B2B SaaS'
    }
    if (mentor.expertise.includes('Marketing')) {
      return 'Marketing mentor to pressure-test channels and messaging before scale'
    }
    return 'Go-to-market expert for early customer acquisition'
  }
  return 'Recommended for your current stage'
}

export function getStageMentorSuggestions(startup, mentors = [], stage) {
  const cfg = STAGE_CONFIG[stage]
  if (!cfg) return []

  return mentors
    .filter((m) => m.status === 'Approved')
    .map((mentor) => ({
      mentor,
      score: scoreForStage(mentor, startup, stage),
      reason: getReasonForStage(mentor, startup, stage),
      stageLabel: cfg.label,
      stageSubtitle: cfg.subtitle,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function getStageMentorSuggestion(startup, mentors, stage, pickIndex = 0) {
  const list = getStageMentorSuggestions(startup, mentors, stage)
  if (!list.length) return null
  const idx = pickIndex % Math.min(3, list.length)
  return list[idx]
}
