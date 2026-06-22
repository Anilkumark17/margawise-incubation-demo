export const INCUBATION_LIFECYCLE = [
  {
    id: 'cohort-setup',
    title: 'Cohort Setup',
    summary:
      'Set intake targets, build in-platform application form, and publish program page with fit-score widget.',
  },
  {
    id: 'applications-open',
    title: 'Applications Open',
    summary:
      'Monitor live funnel, auto-score with AI screener, and assign qualified applications to reviewers.',
  },
  {
    id: 'selection',
    title: 'Selection',
    summary:
      'Committee scores in-platform, sees consensus divergence, and sends rationale-backed accept/reject letters.',
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    summary:
      'Auto-capture baseline metrics, run mentor matching, and set 90-day milestones for each startup.',
  },
  {
    id: 'active-program',
    title: 'Active Program',
    summary:
      'Weekly check-ins, adaptive workshop routing, shared mentor logs, and automatic early-warning triggers.',
  },
  {
    id: 'validation',
    title: 'Validation Phase',
    summary:
      'Founders submit evidence scorecards; center reviews build/pivot/kill decisions with attached paper trail.',
  },
  {
    id: 'demo-day',
    title: 'Demo Day',
    summary:
      'Investor matchmaking by sector x thesis with live metrics dashboard and post-event follow-up CRM.',
  },
  {
    id: 'graduation',
    title: 'Graduation',
    summary:
      'Auto-compare final outcomes against baseline and generate sponsor/grant impact reports.',
  },
  {
    id: 'alumni',
    title: 'Alumni',
    summary:
      'Quarterly check-in prompts feed a living portfolio dashboard and surface success stories for marketing.',
  },
]

export const IC_FEATURE_PAIN_MAP = [
  {
    feature: 'AI Application Pre-Screener',
    pain: 'Volume of low-quality apps and manual review slowness.',
  },
  {
    feature: 'Application Quality Score + Auto-Triage',
    pain: 'Reviewer inconsistency and evaluator bias.',
  },
  {
    feature: 'Live Application Funnel Dashboard',
    pain: 'No drop-off visibility and poor volume-vs-target tracking.',
  },
  {
    feature: 'Structured Selection Scorecard Builder',
    pain: 'Inconsistent scoring across committee members.',
  },
  {
    feature: 'Mentor Recruitment & Profile Portal',
    pain: 'Time-consuming mentor sourcing and poor matching quality.',
  },
  {
    feature: 'Cohort Milestone Tracker (per startup)',
    pain: 'Early attrition signals missed without structured tracking.',
  },
  {
    feature: 'Early-Warning / At-Risk Flag System',
    pain: 'No proactive intervention when teams stall.',
  },
  {
    feature: 'Adaptive Workshop Routing',
    pain: 'One workshop format does not fit all startup stages.',
  },
  {
    feature: 'Mentor Session Log (visible to center)',
    pain: 'Session quality and advisor drift are invisible.',
  },
  {
    feature: 'Automated Baseline + End Metrics Capture',
    pain: 'Manual graduation data collection and missing evidence.',
  },
  {
    feature: 'Cohort Impact Report Generator',
    pain: 'Hard to prove causal impact for sponsors and grants.',
  },
  {
    feature: 'Alumni CRM with Quarterly Check-ins',
    pain: 'Alumni go quiet and long-term tracking becomes chaotic.',
  },
]

export const MOCK_APPLICATIONS = [
  {
    id: 'app-1',
    founderName: 'Aarav Mehta',
    founderEmail: 'aarav@voltgrid.ai',
    teamEmails: ['priya@voltgrid.ai', 'ops@voltgrid.ai'],
    startupName: 'VoltGrid AI',
    oneLiner: 'AI optimization engine for industrial energy efficiency.',
    website: 'https://voltgrid.ai',
    sector: 'ClimateTech',
    startupStage: 'MVP',
    location: 'Bengaluru, India',
    stage: 'Under Review',
    fitScore: 88,
    validationEvidence: 82,
    validatedIdeaSignals: ['7 paid pilots', 'LOI from 2 enterprise buyers', 'Retention > 70%'],
    summary: 'Strong technical team, strong enterprise demand, needs sharper GTM wedge.',
    scorecard: { team: 9, market: 8, traction: 7, coachability: 8 },
    application: {
      problemStatement:
        'Industrial plants waste 12-18% energy due to static control systems and poor real-time optimization.',
      solution:
        'AI layer integrates with existing plant control systems and continuously optimizes energy consumption.',
      targetCustomer: 'Mid-to-large manufacturing plants with annual energy spend > $2M.',
      marketSize: 'TAM $8.1B, SAM $1.2B, SOM $120M (India + SEA initial wedge).',
      businessModel: 'Annual SaaS license + implementation fee.',
      traction: '7 paid pilot sites, $210k annual contracted value, 2 enterprise LOIs.',
      askFromIncubator: 'Mentor access for enterprise sales + support for demo day investor intros.',
    },
  },
  {
    id: 'app-2',
    founderName: 'Neha Kapoor',
    founderEmail: 'neha@mediscribe.health',
    teamEmails: ['dr.rao@mediscribe.health'],
    startupName: 'MediScribe',
    oneLiner: 'Clinical AI assistant reducing documentation time for doctors.',
    website: 'https://mediscribe.health',
    sector: 'HealthTech',
    startupStage: 'Idea',
    location: 'Hyderabad, India',
    stage: 'New',
    fitScore: 81,
    validationEvidence: 73,
    validatedIdeaSignals: ['12 doctor interviews', '2 hospital pilots', 'Problem urgency validated'],
    summary: 'Strong team and urgent problem, competitive landscape is crowded.',
    scorecard: { team: 8, market: 7, traction: 6, coachability: 9 },
    application: {
      problemStatement:
        'Doctors spend significant time on manual clinical documentation, reducing patient throughput.',
      solution:
        'Voice-to-structured-note assistant integrated with OPD workflows and EMR exports.',
      targetCustomer: 'Private hospitals and high-volume clinics (50+ consultations/day).',
      marketSize: 'TAM $4.3B, SAM $760M, SOM $72M (India outpatient segment).',
      businessModel: 'Per-doctor monthly subscription + enterprise onboarding package.',
      traction: '2 pilot hospitals signed, 12 detailed customer interviews completed.',
      askFromIncubator: 'Healthcare compliance mentorship + pilot customer introductions.',
    },
  },
  {
    id: 'app-3',
    founderName: 'Rohan Iyer',
    founderEmail: 'rohan@skillforge.in',
    teamEmails: ['tanvi@skillforge.in', 'ops@skillforge.in'],
    startupName: 'SkillForge',
    oneLiner: 'Adaptive skilling platform for frontline manufacturing workers.',
    website: 'https://skillforge.in',
    sector: 'EdTech',
    startupStage: 'Validation',
    location: 'Pune, India',
    stage: 'Shortlisted',
    fitScore: 74,
    validationEvidence: 64,
    validatedIdeaSignals: ['One paid pilot', '3 partner conversations'],
    summary: 'Good pilot signals, weaker unit economics assumptions, highly coachable founders.',
    scorecard: { team: 7, market: 7, traction: 6, coachability: 9 },
    application: {
      problemStatement:
        'Manufacturing firms struggle to rapidly upskill frontline workers for changing SOPs and machinery.',
      solution:
        'Mobile-first microlearning with vernacular adaptive pathways and practical skill checkpoints.',
      targetCustomer: 'Manufacturing companies with 200+ frontline workers.',
      marketSize: 'TAM $2.9B, SAM $410M, SOM $38M initial B2B segment.',
      businessModel: 'Per-seat annual subscription sold to HR/L&D teams.',
      traction: '1 paid pilot, 3 design partners, 68% completion rate in pilot cohort.',
      askFromIncubator: 'Help with enterprise GTM and pricing model refinement.',
    },
  },
  {
    id: 'app-4',
    founderName: 'Isha Nambiar',
    founderEmail: 'isha@ledgerlane.co',
    teamEmails: ['finance@ledgerlane.co'],
    startupName: 'LedgerLane',
    oneLiner: 'SMB treasury copilot with automated cash forecasting.',
    website: 'https://ledgerlane.co',
    sector: 'FinTech',
    startupStage: 'Idea',
    location: 'Mumbai, India',
    stage: 'Under Review',
    fitScore: 67,
    validationEvidence: 49,
    validatedIdeaSignals: ['5 founder calls', 'No active pilot yet'],
    summary: 'Solid product direction, still pre-traction, needs stronger founder-market fit narrative.',
    scorecard: { team: 6, market: 7, traction: 4, coachability: 8 },
    application: {
      problemStatement:
        'SMBs frequently face cash crunches due to poor forecasting and fragmented financial tools.',
      solution:
        'Cashflow forecasting assistant that syncs accounting, receivables, and payables to predict runway.',
      targetCustomer: 'Service-led SMBs with monthly revenue between $25k-$250k.',
      marketSize: 'TAM $3.2B, SAM $500M, SOM $45M in India + GCC expansion.',
      businessModel: 'Tiered monthly SaaS plan with add-on analytics modules.',
      traction: '5 customer discovery calls, 2 waitlist signups, pre-product stage.',
      askFromIncubator: 'Validation sprint support and pilot acquisition strategy.',
    },
  },
  {
    id: 'app-5',
    founderName: 'Kabir Singh',
    founderEmail: 'kabir@farmpulse.in',
    teamEmails: ['cofounder@farmpulse.in'],
    startupName: 'FarmPulse',
    oneLiner: 'IoT + AI crop diagnostics for small and medium farms.',
    website: 'https://farmpulse.in',
    sector: 'AgriTech',
    startupStage: 'Idea',
    location: 'Jaipur, India',
    stage: 'Rejected',
    fitScore: 52,
    validationEvidence: 42,
    validatedIdeaSignals: ['Problem still hypothesis-heavy'],
    summary: 'Interesting problem, but current readiness below this cohort threshold.',
    scorecard: { team: 5, market: 6, traction: 4, coachability: 6 },
    application: {
      problemStatement:
        'Farmers lack affordable early diagnostics for crop disease and nutrient deficiencies.',
      solution:
        'Low-cost sensor kit with AI crop health recommendations via WhatsApp bot.',
      targetCustomer: 'Farmer producer organizations and agri-input distributors.',
      marketSize: 'TAM $1.8B, SAM $240M, SOM $20M in selected states.',
      businessModel: 'Hardware + annual insights subscription.',
      traction: '3 exploratory conversations, no pilot yet.',
      askFromIncubator: 'Pilot design support and agri network intros.',
    },
  },
]

export const MOCK_MILESTONES = [
  {
    id: 'ms-1',
    title: 'Complete 25 customer interviews',
    owner: 'Founder',
    dueDate: '2026-07-02',
    status: 'To Do',
  },
  {
    id: 'ms-2',
    title: 'Run pricing willingness survey',
    owner: 'Growth Lead',
    dueDate: '2026-06-30',
    status: 'In Progress',
  },
  {
    id: 'ms-3',
    title: 'Validate onboarding conversion >20%',
    owner: 'Product',
    dueDate: '2026-06-25',
    status: 'Validated',
  },
  {
    id: 'ms-4',
    title: 'Secure 3 pilot LOIs',
    owner: 'Founder',
    dueDate: '2026-06-20',
    status: 'Blocked',
  },
]

export const MILESTONE_COLUMNS = ['To Do', 'In Progress', 'Validated', 'Blocked']

