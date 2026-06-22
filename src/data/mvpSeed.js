import { getExploreWizard } from './exploreWizardSeed'

export const DEFAULT_MVP_PLAN = {
  insights: [
    {
      id: 'ins-1',
      source: 'Interview',
      label: 'Customer & Problem Discovery',
      text: 'Agency PMs spend 8+ hours/week clarifying vague client feedback — rework is the hidden cost, not the tool gap.',
    },
    {
      id: 'ins-2',
      source: 'Interview',
      label: 'Solution Validation',
      text: 'PMs will adopt AI translation only if output maps directly to Jira/Asana tasks without manual reformatting.',
    },
    {
      id: 'ins-3',
      source: 'Assumption',
      label: 'Critical assumption flagged',
      text: 'SME agencies perceive delay/scope-creep cost as high enough to justify a premium — needs pricing experiment.',
    },
    {
      id: 'ins-4',
      source: 'Explore',
      label: 'Pain intensity signal',
      text: 'Development teams push back on ambiguous briefs weekly — friction sits between client language and dev tasks.',
    },
    {
      id: 'ins-5',
      source: 'Explore',
      label: 'Switching condition',
      text: 'Beachhead will switch when a tool integrates into existing PM workflow without a massive overhaul.',
    },
  ],
  suggestedFeatures: [
    {
      id: 'sf-1',
      name: 'AI Feedback-to-Task Translator',
      painSolved: 'Vague client feedback → actionable dev tasks',
      priority: 'P0',
      effort: 'L',
      rationale: 'Core JTBD from 4 interviews. Directly addresses the #1 validated pain signal.',
      status: 'In Development',
    },
    {
      id: 'sf-2',
      name: 'Assumption-Linked Interview Framework',
      painSolved: 'Unstructured discovery → evidence-backed decisions',
      priority: 'P0',
      effort: 'M',
      rationale: 'Validated in Phase 3 — founders need questions derived from riskiest assumptions.',
      status: 'Released',
    },
    {
      id: 'sf-3',
      name: 'Scope Creep Early Warning',
      painSolved: 'Budget overruns from creeping requirements',
      priority: 'P1',
      effort: 'M',
      rationale: 'Flagged in economics step — alerts PM when feedback expands beyond original scope.',
      status: 'Testing',
    },
    {
      id: 'sf-4',
      name: 'Client Clarification Request Generator',
      painSolved: 'Endless back-and-forth clarification calls',
      priority: 'P1',
      effort: 'S',
      rationale: 'Auto-generates structured follow-up questions from ambiguous feedback snippets.',
      status: 'Planned',
    },
    {
      id: 'sf-5',
      name: 'Validation Report Export',
      painSolved: 'No shareable evidence for stakeholders',
      priority: 'P2',
      effort: 'S',
      rationale: 'Nice-to-have for agency founders pitching process improvements to clients.',
      status: 'Planned',
    },
  ],
  persona: {
    initials: 'SC',
    name: 'Sarah Chen',
    role: 'Agency Project Lead · 15-person SaaS dev shop',
    summary:
      'Primary beachhead from validation. Owns client communication and dev coordination. Profitability depends on reducing rework from vague feedback.',
    jtbd:
      'When a client gives high-level feedback, quickly translate it into clear dev tasks without endless clarification calls.',
    frustrations: [
      'Long clarification calls to extract technical requirements from general ideas',
      'Dev team pushback on ambiguous task briefs',
      'Projects running over budget due to misunderstood requirements',
    ],
    switchingTriggers: [
      'Clear process that reduces clarification time by 50%+',
      'Integration with existing Jira/Asana workflow',
      'Demonstrable prevention of scope creep',
    ],
  },
  techStack: [
    { layer: 'Frontend', tech: 'React + Vite + Tailwind', reason: 'Fast iteration, matches founder skillset, rich interactive UX for PM dashboards' },
    { layer: 'Backend', tech: 'Node.js + Express or Supabase', reason: 'Rapid API development; Supabase gives auth + DB in one if team is small' },
    { layer: 'AI / ML', tech: 'OpenAI GPT-4o + structured output', reason: 'Feedback translation needs reliable JSON task output; start with API, not custom models' },
    { layer: 'Database', tech: 'PostgreSQL', reason: 'Relational data for projects, assumptions, interview links' },
    { layer: 'Auth', tech: 'Clerk or Supabase Auth', reason: 'B2B SaaS needs team workspaces — don\'t build auth from scratch' },
    { layer: 'Integrations', tech: 'Jira + Asana APIs', reason: 'Critical switching condition — PMs won\'t adopt without workflow fit' },
  ],
  cautions: [
    {
      severity: 'high',
      title: 'Don\'t over-build AI accuracy before user testing',
      detail: 'Start with human-in-the-loop review of AI translations. Ship a "suggest & approve" flow before full automation.',
    },
    {
      severity: 'high',
      title: 'Integration is the moat, not the AI',
      detail: 'Agencies already have Jira/Asana. A standalone tool without export will fail the switching condition from validation.',
    },
    {
      severity: 'medium',
      title: 'Avoid enterprise agencies as first customers',
      detail: 'Beachhead is 10–20 person shops. Enterprise has procurement cycles that kill MVP velocity.',
    },
    {
      severity: 'medium',
      title: 'Scope creep in your own MVP',
      detail: 'Architecture visualization was flagged as out-of-scope in Solution step. Resist adding it until core translator is validated.',
    },
    {
      severity: 'low',
      title: 'Pricing before product-market fit',
      detail: 'Run the ₹2,500/mo experiment from economics step before committing to billing infrastructure.',
    },
  ],
}

export function getMvpPlan(startup) {
  const stored = startup.mvpPlan?.insights?.length ? startup.mvpPlan : null
  const wizard = getExploreWizard(startup)
  const persona = wizard?.customer?.persona

  const dynamicInsights = []
  if (wizard?.problem?.painSignals?.length) {
    wizard.problem.painSignals.slice(0, 2).forEach((sig, i) => {
      dynamicInsights.push({
        id: `dyn-pain-${i}`,
        source: 'Explore',
        label: 'Pain signal',
        text: sig.text,
      })
    })
  }

  const validatedAssumptions = (startup.assumptions || [])
    .filter((a) => ['Validated', 'Evidence Collected'].includes(a.status))
    .slice(0, 2)
    .map((a, i) => ({
      id: `dyn-asm-${i}`,
      source: 'Assumption',
      label: `${a.risk || 'Medium'} risk · ${a.category}`,
      text: a.text,
    }))

  const base = stored || DEFAULT_MVP_PLAN
  const mergedInsights = [
    ...(base.insights || DEFAULT_MVP_PLAN.insights),
    ...dynamicInsights.filter(
      (d) => !(base.insights || DEFAULT_MVP_PLAN.insights).some((b) => b.text === d.text)
    ),
    ...validatedAssumptions,
  ]

  const personaOverride = persona
    ? {
        ...(base.persona || DEFAULT_MVP_PLAN.persona),
        initials: persona.initials || base.persona?.initials || DEFAULT_MVP_PLAN.persona.initials,
        name: persona.name?.split(',')[0] || base.persona?.name || DEFAULT_MVP_PLAN.persona.name,
        summary: persona.whyChosen || base.persona?.summary || DEFAULT_MVP_PLAN.persona.summary,
        jtbd: wizard.customer?.jobToBeDone || base.persona?.jtbd || DEFAULT_MVP_PLAN.persona.jtbd,
        frustrations: wizard.customer?.keyFrustrations?.slice(0, 3) || base.persona?.frustrations || DEFAULT_MVP_PLAN.persona.frustrations,
        switchingTriggers: wizard.customer?.switchingConditions?.slice(0, 3) || base.persona?.switchingTriggers || DEFAULT_MVP_PLAN.persona.switchingTriggers,
      }
    : (base.persona || DEFAULT_MVP_PLAN.persona)

  return {
    ...DEFAULT_MVP_PLAN,
    ...base,
    suggestedFeatures: base.suggestedFeatures || DEFAULT_MVP_PLAN.suggestedFeatures,
    persona: personaOverride,
    techStack: base.techStack || DEFAULT_MVP_PLAN.techStack,
    cautions: base.cautions || DEFAULT_MVP_PLAN.cautions,
    insights: mergedInsights.slice(0, 8),
    stageNote: startup.stageNotes?.mvp || '',
  }
}
