export const EXPLORE_STEPS = [
  { id: 'problem', step: 1, title: 'Problem', question: 'What problem are you solving?' },
  { id: 'customer', step: 2, title: 'Customer', question: 'Who has this problem?' },
  { id: 'market', step: 3, title: 'Market', question: 'How big is the opportunity?' },
  { id: 'channel', step: 4, title: 'Channel', question: 'How do you reach your customer?' },
  { id: 'economics', step: 5, title: 'Economics', question: 'Do the numbers work?' },
  { id: 'solution', step: 6, title: 'Solution', question: 'What are you actually building?' },
]

export function createExploreWizardSeed() {
  return {
    activeStep: 'problem',
    problem: {
      complete: false,
      intro:
        "We've built a starting point from your idea. Read through each section, click to edit anything that feels off, and move on when it feels true.",
      problemStatement: {
        content:
          'Tech agencies frequently experience project delays and budget overruns because client feedback is often vague and difficult to translate into concrete technical tasks. This forces project managers and agency founders to spend excessive time interpreting requirements and bridging communication gaps between clients and development teams, leading to rework and missed deadlines.',
      },
      whoFeelsPain: {
        label: 'Beachhead customer',
        content:
          "This pain is primarily felt by project managers and agency founders within small to medium-sized tech agencies. These individuals are typically responsible for client communication, project planning, and team coordination. They often juggle multiple roles, including sales, account management, and technical oversight, making the burden of unclear feedback particularly impactful on their time and project profitability.",
      },
      painSignals: [
        { id: 'sig-1', text: 'Project managers frequently work extended hours to clarify requirements or resolve misunderstandings.' },
        { id: 'sig-2', text: 'Agencies report a high percentage of projects going over budget or past their original deadline.' },
        { id: 'sig-3', text: 'Development teams express frustration over ambiguous task descriptions or frequent changes in project scope.' },
        { id: 'sig-4', text: 'Client satisfaction surveys reveal complaints about slow progress or deliverables not matching expectations.' },
        { id: 'sig-5', text: 'Agencies struggle to accurately estimate project timelines and costs due to unpredictable client input.' },
      ],
      diagnostic: {
        intro:
          'Four questions that reveal how strong this problem really is. A good problem to build on scores high on at least three. Edit any answer that doesn\'t feel accurate — these feed directly into your assumption list.',
        summary:
          "The problem of vague client feedback leading to project issues appears to be frequent and intense, causing significant pain for agencies. However, its root cause might not always be immediately visible, and agencies already employ various methods to cope, even if imperfectly. This suggests that while the pain is real, agencies might not explicitly articulate 'vague feedback' as the primary problem, and they have existing, albeit inefficient, ways of dealing with it.",
        dimensions: [
          {
            id: 'frequency',
            label: 'Frequency',
            score: 'Happens often',
            question: 'How often do project managers encounter vague client feedback that leads to rework or delays?',
            answer:
              'Client feedback is an ongoing part of project delivery, and if a significant portion of it is vague, then the problem would manifest frequently across many projects.',
          },
          {
            id: 'intensity',
            label: 'Intensity',
            score: 'Significant impact',
            question: 'How severe are the consequences of vague client feedback for tech agencies?',
            answer:
              "The consequences described are project delays, scope creep, budget overruns, and increased workload for founders/managers. These are significant impacts that directly affect an agency's profitability, reputation, and employee morale.",
          },
          {
            id: 'visibility',
            label: 'Visibility',
            score: 'Somewhat visible',
            question: "How easily do agencies recognize that 'vague client feedback' is the root cause of their project issues?",
            answer:
              "While delays and budget overruns are visible, attributing them specifically to 'vague client feedback' rather than other factors might require some analysis.",
          },
          {
            id: 'replaceability',
            label: 'Replaceability',
            score: 'Many existing workarounds',
            question: 'What existing methods or tools do agencies currently use to manage vague client feedback and prevent delays?',
            answer:
              'Agencies likely use detailed requirement gathering sessions, written specifications, wireframes, prototypes, project management tools, and direct communication. While these might not solve the problem perfectly, they are existing habits and tools.',
          },
        ],
      },
      whyNow: {
        content:
          'The increasing complexity of digital products and the rapid pace of technological change mean that client expectations are evolving faster than ever. Remote work post-2020 has amplified communication challenges, making clear, unambiguous feedback even more critical for project success.',
        assumptionsFlagged: [
          'The complexity of digital products is increasing significantly enough to make current feedback translation methods obsolete.',
          'Remote work has universally amplified communication challenges related to client feedback.',
        ],
      },
    },
    customer: {
      complete: false,
      intro:
        'A beachhead customer is one specific person you could find on LinkedIn and invite for a 45-minute conversation this week. Make this concrete — the sharper the customer, the sharper every step that follows.',
      persona: {
        initials: 'SC',
        name: 'Sarah Chen, Agency Project Lead',
        subtitle: 'Beachhead customer · the sharpest single target',
        whyChosen:
          "Sarah experiences the pain of vague client feedback most acutely because her agency's profitability directly depends on efficient project delivery. Her role as the primary translator and coordinator means she personally bears the burden of clarifying requirements and preventing scope creep.",
      },
      whoTheyAre:
        "Sarah is a Project Lead at a 15-person web development agency specializing in custom SaaS platforms. She spends her days coordinating between clients, who often have a strong vision but lack technical specifics, and her team of developers, who need clear, detailed instructions to build.",
      jobToBeDone:
        'When a client gives me high-level feedback on a new feature or change, I want to quickly and accurately translate that into a clear, actionable set of tasks for my development team, so that we can build exactly what the client wants without endless back-and-forth or costly rework.',
      supportingIntentions: [
        'I need to ensure all stakeholders understand the current state and future direction of the project architecture.',
        'I want to proactively identify potential misunderstandings or scope creep early in the project lifecycle.',
        'I need to keep projects on track and within budget, demonstrating clear progress and value to the client.',
      ],
      keyFrustrations: [
        'She frequently finds herself in long clarification calls with clients, trying to extract specific technical requirements from their general ideas.',
        'Her development team often pushes back on tasks, asking for more detail or pointing out ambiguities in the brief.',
        'She spends hours manually updating project documentation and creating visual aids to explain concepts.',
        'Projects frequently run over their estimated time or budget because initial requirements weren\'t fully understood.',
        'She feels like she\'s constantly playing telephone between non-technical clients and highly technical developers.',
      ],
      alternatives: [
        'She uses detailed written specifications, often created after multiple client meetings and internal discussions.',
        'She relies on standard project management tools (like Jira or Asana) to track tasks.',
        'She creates manual diagrams, mockups, or prototypes using tools like Figma or Miro.',
        'She schedules frequent check-ins and review sessions with both clients and developers.',
        'She often resorts to best guess interpretations of client feedback, knowing there\'s a risk of rework later.',
      ],
      switchingConditions: [
        'They will switch when they see a clear, repeatable process that significantly reduces the time spent clarifying requirements.',
        'They will switch when they realize that the invisible costs of rework and delays are far greater than estimated.',
        'They will switch when a tool can demonstrate how it directly prevents scope creep and budget overruns.',
        'They will switch when they can easily integrate a new solution into their existing workflow without a massive overhaul.',
      ],
    },
    market: {
      complete: false,
      currency: 'USD ($)',
      activeTab: 'sizing',
      sizing: {
        som: {
          label: 'SOM',
          title: 'Serviceable Obtainable Market',
          subtitle: 'Year 1 realistic capture — your actual target',
          value: '$3M',
          description:
            'The SOM for Year 1 is estimated at 100 SME tech agencies, generating $3 million in annual revenue. Derived from reaching 10% of the SAM via targeted LinkedIn outreach and converting 1% of those reached.',
          filters: [
            { label: 'GTM channel reach', value: '−10%', note: '10% of SAM reachable via LinkedIn, events, and partnerships in Tier 1-3 cities in India.' },
            { label: 'Conversion rate', value: '−1%', note: 'Conservative 1% conversion for early B2B SaaS adopters.' },
          ],
          source: 'Bottom-up: 10% of SAM reachable via LinkedIn × 1% conversion × $30,000 ARPU',
        },
        sam: {
          label: 'SAM',
          title: 'Serviceable Addressable Market',
          subtitle: 'Reachable segment you can serve',
          value: '$30M',
          description: '1,000 SME tech agencies in India, representing $30 million in annual revenue.',
          filters: [
            { label: 'Geography match', value: '−20%' },
            { label: 'Problem frequency', value: '−50%' },
            { label: 'Digital tool willingness', value: '−50%' },
          ],
          source: 'Derived from TAM by filtering for Indian Tier 1-3 cities, high problem frequency, and digital tool willingness.',
        },
        tam: {
          label: 'TAM',
          title: 'Total Addressable Market',
          subtitle: 'Theoretical ceiling — context, not target',
          value: '$300M',
          description: '10,000 SME tech agencies in India, generating $300 million in annual revenue.',
          source: 'NASSCOM India Startup Report 2023 × $30,000 ARPU',
        },
        dataGaps: [
          'Precise number of SME tech agencies in Tier 1-3 Indian cities.',
          'Specific data on percentage of agencies experiencing high problem frequency.',
          'Data on willingness of Indian SME tech agencies to adopt new specialized digital tools.',
        ],
      },
      competitors: {
        direct: [
          { id: 'c1', initials: 'US', name: 'Usersnap', summary: 'Visual feedback tool and UX platform for client collaboration.', doesWell: 'Captures visual feedback directly on websites, reducing ambiguity in design-related feedback.', fallsShort: "Doesn't translate vague conceptual feedback into actionable technical tasks or visualize product architecture.", switching: 'medium switching' },
          { id: 'c2', initials: 'BU', name: 'BugHerd', summary: 'Point, click, and website feedback becomes an actionable task.', doesWell: 'Clients click on elements and leave comments converted into tasks.', fallsShort: 'Focused on visual feedback for existing pages, not abstract client ideas.', switching: 'medium switching' },
          { id: 'c3', initials: 'WE', name: 'Webvizio', summary: 'Sticky note comments on websites converted into tasks with technical metadata.', doesWell: 'Bridges client input and developer needs for specific details.', fallsShort: "Doesn't assist translating vague non-visual concepts into structured architecture.", switching: 'medium switching' },
        ],
        indirect: [
          { id: 'c4', initials: 'JI', name: 'Jira', summary: 'Structured tool for complex dev team processes.', doesWell: 'Excellent workflow management and issue tracking.', fallsShort: 'Requires tasks to be clearly defined before entry — no feedback translation.', switching: 'high switching' },
          { id: 'c5', initials: 'MI', name: 'Miro', summary: 'Visual canvas connecting feedback to product decisions.', doesWell: 'Great for diagramming and collaborative whiteboarding.', fallsShort: "Blank canvas — doesn't auto-translate vague feedback into tasks.", switching: 'medium switching' },
          { id: 'c6', initials: 'FI', name: 'Figma', summary: 'Collaborative design tool for wireframes and prototypes.', doesWell: 'Industry-standard for visualizing UI and getting client sign-off.', fallsShort: "Design tool only — doesn't translate conceptual feedback into architecture.", switching: 'high switching' },
        ],
        alternative: [
          { id: 'c7', initials: 'DE', name: 'Detailed written specifications', summary: 'Formal documentation after multiple client meetings.', doesWell: 'Comprehensive record that can serve as contractual document.', fallsShort: 'Extremely time-consuming and labor-intensive.', switching: 'high switching' },
          { id: 'c8', initials: 'MA', name: 'Manual diagrams & prototypes', summary: 'Figma or Miro visuals to get client sign-off.', doesWell: 'Highly effective for communicating complex ideas.', fallsShort: 'Manual creation is very time-consuming.', switching: 'medium switching' },
          { id: 'c9', initials: 'FR', name: 'Frequent check-ins', summary: 'Review sessions hoping to catch misunderstandings early.', doesWell: 'Immediate clarification and collaboration.', fallsShort: 'Extremely time-consuming and reactive.', switching: 'medium switching' },
        ],
      },
      trends: {
        tailwinds: [
          { title: "Rise of Tech Hubs in India's Tier 2 and Tier 3 Cities", type: 'social', stat: 'Over 45% of DPIIT-recognized startups are in Tier 2/3 cities.', impact: 'Growing market beyond major metros with larger pool of potential SME tech agencies.' },
          { title: 'Increased Digital Transformation by Indian SMEs', type: 'technological', stat: '65%+ of Indian SMEs plan to increase digital tool spending in 18 months.', impact: 'Strong trend supports receptiveness to efficiency-focused SaaS solutions.' },
          { title: "AI as a 'Great Equalizer' for Indian Startups", type: 'technological', stat: '₹1,500/month AI tools can replace a ₹3 lakh/month team (2020 equivalent).', impact: "Supports 'why now' — founders more likely to adopt AI-powered solutions." },
          { title: 'PM Tools Integrating AI, but with Gaps', type: 'technological', stat: 'All major PM platforms added AI features in the last year.', impact: 'Market validation for AI in PM, but gap in feedback translation remains.' },
          { title: 'Challenges in Project Management for Indian SMEs', type: 'social', stat: 'Serious lack of PM skills leading to delay & loss in many SME units.', impact: 'Clear need for platforms that simplify scope definition and clarity.' },
        ],
        headwinds: [
          { title: 'Tightening Early-Stage Startup Funding in India', type: 'economic', stat: 'Early-stage funding declined 23% in H1 2025 vs H2 2024.', impact: 'Need clear path to profitability to attract investment.' },
          { title: 'Evolving AI Regulatory Landscape in India', type: 'legal', stat: 'Digital India Act (2025) addressing AI usage and accountability.', impact: 'Increased compliance costs and need for robust legal counsel.' },
          { title: 'Remote PM Challenges for Indian Tech Agencies', type: 'social', stat: 'Information scattering across multiple communication platforms.', impact: 'Platform must integrate seamlessly with existing channels.' },
        ],
        wildcards: [
          { title: "Growing Trust in AI Among Indian Startups", type: 'technological', stat: '95% of Indian employees believe AI can improve quality of life.', impact: 'Could accelerate adoption but sets high bar for performance.' },
        ],
        overallRead:
          'The problem space appears to be growing, driven by digital transformation in Indian SMEs. However, tightening funding and evolving AI regulation present headwinds. Widespread AI optimism could accelerate adoption.',
      },
    },
    channel: {
      complete: false,
      intro:
        "A channel is not a place — it's a repeatable path from you to your customer. We've suggested channels based on where your user spends time and what's reachable at zero budget.",
      primaryNote:
        'One primary channel only. Focus beats spread at this stage. Pick the channel you can run for 2 weeks without breaking — set it as primary below.',
      hypothesis:
        'SME tech agency project managers and founders in India are actively seeking solutions to streamline client feedback translation and reduce project delays. By engaging in their professional communities and sharing practical insights, we can attract early adopters who are frustrated with current manual methods and are open to a specialized tool like Master Manager.',
      primaryChannelId: 'ch-1',
      channels: [
        {
          id: 'ch-1',
          name: 'Indian Tech & PM Community Forums (e.g., LinkedIn Groups, NASSCOM forums, local meetups)',
          type: 'Community',
          timing: 'Start now',
          description:
            "Sarah (and others like her) are part of professional networks where they discuss challenges and seek advice. These forums are where they'd naturally look for solutions to common project management pain points, especially those related to client communication in the Indian context.",
          thisWeek: [
            'Identify 3-5 active LinkedIn groups for Indian tech agency founders/PMs.',
            'Participate genuinely in discussions, offering insights on client communication.',
            "Share a 'problem-solution' post describing the pain of vague feedback and a potential new approach (without directly pitching the product).",
          ],
          scores: { reach: 7, effort: 6, conversion: 7 },
          scoreNote: 'Directly engaging with decision-makers facing the problem.',
        },
        {
          id: 'ch-2',
          name: 'Problem-Solution Focused Blog/Newsletter',
          type: 'Content',
          timing: 'Start now',
          description:
            "Sarah actively seeks ways to improve her processes. A blog post or newsletter addressing the 'vague client feedback' problem and offering actionable strategies would establish the founder as a thought leader and attract her attention.",
          thisWeek: [
            "Write a detailed blog post: '5 Ways Vague Client Feedback Kills Your Project Profitability'.",
            "Include a call-to-action for a waitlist or a 'beta tester' program.",
            'Share the blog post in relevant community forums (where allowed) and personal network.',
          ],
          scores: { reach: 6, effort: 7, conversion: 6 },
          scoreNote: 'Attracting customers through valuable insights and establishing authority.',
        },
        {
          id: 'ch-3',
          name: 'LinkedIn Direct Outreach to Agency Founders/PMs',
          type: 'Outreach',
          timing: 'Start now',
          description:
            "Sarah and her peers are easily identifiable on LinkedIn. A personalized, non-salesy message that acknowledges their specific pain points can open doors for conversation and feedback.",
          thisWeek: [
            'Identify 20-30 Indian tech agency founders/PMs on LinkedIn.',
            'Send personalized connection requests referencing a shared industry pain point.',
            'Follow up with a message offering to share insights or gather feedback on the problem, not the product.',
          ],
          scores: { reach: 5, effort: 8, conversion: 5 },
          scoreNote: 'Getting direct feedback and early user conversations.',
        },
        {
          id: 'ch-4',
          name: 'Partnership with Indian Tech/SaaS Industry Associations',
          type: 'Partnership',
          timing: 'After traction',
          description:
            'Once Master Manager has initial traction and testimonials, partnering with associations like NASSCOM or local startup hubs can provide access to a concentrated audience of tech agencies and project managers.',
          thisWeek: [
            'Research key industry associations for tech agencies in India.',
            'Identify potential contact persons for partnership or member benefits programs.',
            'Prepare a proposal outlining how Master Manager can benefit their members (after securing initial users).',
          ],
          scores: { reach: 9, effort: 8, conversion: 8 },
          scoreNote: 'Scaling acquisition and building brand trust after initial validation.',
        },
      ],
      assumptionsFlagged: [
        'Founders/PMs in Indian tech agencies are actively seeking and discussing solutions for client feedback challenges in online communities.',
        'The solo founder has the time and expertise to consistently create high-quality, problem-solving content.',
        'LinkedIn outreach will be perceived as helpful rather than spammy, leading to genuine conversations.',
      ],
    },
    economics: {
      complete: false,
      intro: 'AI infers your business model and estimates the unit economics. Every value is editable — derived metrics update live.',
      businessModel: {
        icon: '☁️',
        label: 'B2B SaaS',
        confidence: 'high confidence',
        description:
          'Master Manager is a software platform sold to businesses (tech agencies) to solve an internal operational problem. This is a classic B2B SaaS model.',
      },
      verdict: {
        title: 'Tight Margins, High Potential',
        summary:
          "With a monthly price of 2500 INR and a CAC of 7500 INR, the payback period is 3 months. This is excellent. However, a 4% monthly churn rate means the average customer lifetime is 25 months, leading to an LTV of 62,500 INR. The LTV:CAC ratio is 8.33, which is strong, but the monthly fixed costs of 50,000 INR mean you'll need 20 paying customers just to break even on fixed costs.",
      },
      recommendations: [
        'Implement robust onboarding, proactive customer success, and gather feedback for continuous product improvement to reduce churn from 4% to 2-3%.',
        'Explore tiered pricing with premium features or higher user counts at a higher price point (e.g., 3500-5000 INR/month for larger teams).',
        'Double down on organic growth strategies, leverage referral programs within the tech agency community, and create highly shareable content to lower the effective CAC.',
      ],
      inputs: {
        cac: { label: 'cac', value: 7500, source: 'Based on solo founder, zero paid budget and organic/community-led acquisition. B2B SaaS in India often ranges 5,000-15,000 INR per customer.' },
        priceMonthly: { label: 'price monthly', value: 2500, source: 'Benchmark against Indian B2B SaaS pricing for similar PM tools. Team plan for ~5 users at ~500 INR/user/month.' },
        churnMonthly: { label: 'churn monthly', value: 4, unit: '%', source: 'B2B SaaS churn for SMEs in India. 4% is reasonable for a new specialized tool.' },
        monthlyFixedCosts: { label: 'monthly fixed costs', value: 50000, source: 'Lean estimate for solo founder: servers, APIs, accounting, basic tools.' },
        freeToPaidConversion: { label: 'free to paid conversion', value: 10, unit: '%', source: 'Typical mid-range for B2B SaaS with clear value proposition (5-20% range).' },
      },
      assumptionsFlagged: [
        { text: 'The estimated price of 2500 INR/month is acceptable to SME tech agencies in India for a specialized PM tool.', severity: 'medium' },
        { text: "The '6 effort score' for CAC translates effectively into a 7500 INR cost via efficient organic conversion.", severity: 'medium' },
        { text: "The product's unique value proposition is strong enough to justify 10% free-to-paid conversion and 4% monthly churn.", severity: 'high' },
        { text: "Monthly fixed costs remain at 50,000 INR and do not account for future scaling or founder's full salary.", severity: 'medium' },
      ],
    },
    solution: {
      complete: false,
      intro:
        "AI synthesises your Explore phase into a value proposition, scope, and 'why now'. The solution must follow logically from what you discovered — not from your original idea.",
      valueProposition: {
        sentence:
          'For project leads at web development agencies, Master Manager translates vague client feedback into clear, actionable tasks, preventing project delays and rework.',
        customer: 'Project Leads at 15-person web development agencies specializing in custom SaaS platforms',
        outcome: 'quickly and accurately translate high-level client feedback into clear, actionable tasks, avoiding rework and missed deadlines',
        mechanism: 'by translating vague client feedback into actionable tasks and visualizing product architecture',
        unlike: 'standard project management tools or manual documentation and diagramming',
      },
      whyNow:
        'The increasing complexity of digital products and the rise of remote work post-2020 have amplified communication challenges, making clear feedback critical. Agencies are under pressure to deliver faster and more cost-effectively, while existing PM tools integrating AI still have gaps in translating vague client feedback.',
      whyYou: '',
      scopeIn: [
        'Translating high-level client feedback into structured technical tasks',
        'Visualizing product architecture from abstract concepts',
        'Facilitating clear communication between non-technical clients and technical developers',
        'Reducing project delays and budget overruns due to unclear requirements',
        'Integration with existing project management tools for task tracking',
        'Providing a repeatable process for requirements gathering and definition',
      ],
      scopeOut: [
        'Bug tracking and quality assurance for existing products',
        'General team collaboration and chat functionalities',
        'Time tracking and invoicing features',
        'Detailed financial project accounting',
        'Comprehensive HR or resource management',
        'Automated code generation from specifications',
      ],
      assumptionsFlagged: [
        { text: 'SME tech agency project managers in India are actively seeking and willing to pay for a specialized tool to translate client feedback.', severity: 'high' },
        { text: "The 'invisible' costs of rework and delays are significant enough to justify switching from current manual methods.", severity: 'medium' },
        { text: 'Master Manager can effectively integrate into existing workflows without a massive overhaul.', severity: 'medium' },
      ],
      phaseNote:
        'This is what we\'ll validate in the next phase — not the spec to build. Each item here becomes an assumption to test through Assumptions, Interviews, Surveys, and Experiments.',
    },
  }
}

function isLegacyPlaceholder(step) {
  return step?.comingSoon === true && !step?.intro && !step?.hypothesis && !step?.businessModel
}

function mergeEconomicsInputs(seedInputs, storedInputs) {
  if (!seedInputs) return storedInputs || {}
  const merged = {}
  for (const key of Object.keys(seedInputs)) {
    merged[key] = { ...seedInputs[key], ...storedInputs?.[key] }
  }
  return merged
}

export function getExploreWizard(startup) {
  const seed = createExploreWizardSeed()
  const wizard = startup.validation?.exploreWizard
  if (!wizard) return seed

  const economicsStored = isLegacyPlaceholder(wizard.economics) ? {} : wizard.economics || {}
  const solutionStored = isLegacyPlaceholder(wizard.solution) ? {} : wizard.solution || {}
  const channelStored = isLegacyPlaceholder(wizard.channel) ? {} : wizard.channel || {}

  return {
    ...seed,
    activeStep: wizard.activeStep || seed.activeStep,
    problem: { ...seed.problem, ...wizard.problem },
    customer: { ...seed.customer, ...wizard.customer },
    market: {
      ...seed.market,
      ...wizard.market,
      sizing: { ...seed.market.sizing, ...wizard.market?.sizing },
      competitors: { ...seed.market.competitors, ...wizard.market?.competitors },
      trends: { ...seed.market.trends, ...wizard.market?.trends },
    },
    channel: {
      ...seed.channel,
      ...channelStored,
      channels: channelStored.channels?.length ? channelStored.channels : seed.channel.channels,
    },
    economics: {
      ...seed.economics,
      ...economicsStored,
      complete: economicsStored.complete ?? wizard.economics?.complete ?? false,
      businessModel: { ...seed.economics.businessModel, ...economicsStored.businessModel },
      verdict: { ...seed.economics.verdict, ...economicsStored.verdict },
      inputs: mergeEconomicsInputs(seed.economics.inputs, economicsStored.inputs),
      recommendations: economicsStored.recommendations?.length
        ? economicsStored.recommendations
        : seed.economics.recommendations,
      assumptionsFlagged: economicsStored.assumptionsFlagged?.length
        ? economicsStored.assumptionsFlagged
        : seed.economics.assumptionsFlagged,
    },
    solution: {
      ...seed.solution,
      ...solutionStored,
      complete: solutionStored.complete ?? wizard.solution?.complete ?? false,
      valueProposition: {
        ...seed.solution.valueProposition,
        ...solutionStored.valueProposition,
      },
      scopeIn: solutionStored.scopeIn?.length ? solutionStored.scopeIn : seed.solution.scopeIn,
      scopeOut: solutionStored.scopeOut?.length ? solutionStored.scopeOut : seed.solution.scopeOut,
      assumptionsFlagged: solutionStored.assumptionsFlagged?.length
        ? solutionStored.assumptionsFlagged
        : seed.solution.assumptionsFlagged,
    },
  }
}
