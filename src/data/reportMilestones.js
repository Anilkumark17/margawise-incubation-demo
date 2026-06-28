export const STAGE_TEMPLATES = [
  {
    stage: 'Validation',
    deliverables: [
      'Customer interview count',
      'Interview summaries',
      'Problem statements',
      'Market research findings',
    ],
    deadlines: ['2026-07-05', '2026-07-12', '2026-07-19', '2026-07-26'],
    commitments: [
      { deliverable: 'Customer Interviews', target: 10, actual: 8 },
      { deliverable: 'Interview Summaries', target: 5, actual: 4 },
      { deliverable: 'Problem Statements', target: 3, actual: 3 },
    ],
  },
  {
    stage: 'MVP',
    deliverables: ['Wireframes', 'Product demos', 'Feature completion', 'User feedback'],
    deadlines: ['2026-08-02', '2026-08-09', '2026-08-16', '2026-08-23'],
    commitments: [
      { deliverable: 'Wireframes', target: 8, actual: 5 },
      { deliverable: 'Product Demos', target: 2, actual: 1 },
      { deliverable: 'Features Completed', target: 6, actual: 3 },
    ],
  },
  {
    stage: 'Pilot',
    deliverables: ['Number of pilot users', 'Usage metrics', 'Customer testimonials', 'Bugs and improvements'],
    deadlines: ['2026-09-01', '2026-09-08', '2026-09-15', '2026-09-22'],
    commitments: [
      { deliverable: 'Pilot Users', target: 5, actual: 2 },
      { deliverable: 'Usage Reviews', target: 5, actual: 2 },
      { deliverable: 'Testimonials', target: 3, actual: 1 },
    ],
  },
  {
    stage: 'Revenue',
    deliverables: ['Leads generated', 'Paying customers', 'Revenue', 'Conversion rates'],
    deadlines: ['2026-10-01', '2026-10-08', '2026-10-15', '2026-10-22'],
    commitments: [
      { deliverable: 'Leads Generated', target: 80, actual: 30 },
      { deliverable: 'Paying Customers', target: 15, actual: 5 },
      { deliverable: 'Revenue (USD)', target: 8000, actual: 2400 },
    ],
  },
  {
    stage: 'Fundraising',
    deliverables: ['Pitch deck', 'Financial model', 'Investor meetings', 'Due diligence documents'],
    deadlines: ['2026-11-01', '2026-11-08', '2026-11-15', '2026-11-22'],
    commitments: [
      { deliverable: 'Pitch Deck Revisions', target: 1, actual: 0 },
      { deliverable: 'Investor Meetings', target: 8, actual: 2 },
      { deliverable: 'DD Documents', target: 10, actual: 3 },
    ],
  },
]

const SAMPLE_REVIEWS = {
  'validation-deliverable-1': {
    managerReview: 'Approved',
    managerComment: 'Interview volume is strong. Keep logging summaries in the shared folder.',
    mentorReview: 'Approved',
    mentorComment: 'Good discovery pace. Push for more diverse customer segments in the next batch.',
    reviewedAtManager: '2026-06-20',
    reviewedAtMentor: '2026-06-21',
  },
  'validation-deliverable-2': {
    managerReview: 'Needs Rework',
    managerComment: 'Summaries need clearer problem statements tied to each interview.',
    mentorReview: 'Needs Rework',
    mentorComment: 'Add a one-line insight per interview before resubmitting.',
    reviewedAtManager: '2026-06-22',
    reviewedAtMentor: '2026-06-23',
  },
}

export function getStatus(target, actual) {
  if (actual >= target) return 'Complete'
  if (actual >= Math.ceil(target * 0.7)) return 'At Risk'
  return 'Delayed'
}

export function buildDefaultMilestones(startupId) {
  return STAGE_TEMPLATES.map((template, index) => ({
    id: `milestone-${template.stage.toLowerCase()}`,
    stage: template.stage,
    unlocked: index === 0,
    managerUnlocked: false,
    gateDecision: index === 0 ? 'Pending Review' : 'Pending Review',
    managerSummary: index === 0 ? 'Validation sprint is on track. Submit remaining deliverables before the July gate.' : '',
    mentorSummary: index === 0 ? 'Focus on interview quality over volume this week.' : '',
    interventionPlan: '',
    tasks: [],
    deliverables: template.deliverables.map((item, itemIndex) => {
      const id = `${template.stage.toLowerCase()}-deliverable-${itemIndex + 1}`
      const sample = startupId === 'startup-1' ? SAMPLE_REVIEWS[id] : null
      const hasSubmission = index === 0 && itemIndex < 2
      return {
        id,
        title: item,
        deadline: template.deadlines[itemIndex] || '',
        progressStatus: hasSubmission ? 'In Progress' : 'Pending',
        attachments: hasSubmission ? [`${item.toLowerCase().replace(/\s+/g, '-')}-week24.pdf`] : [],
        link: hasSubmission ? `https://docs.example.com/${startupId}/${template.stage.toLowerCase()}/${itemIndex + 1}` : '',
        evidenceUploaded: hasSubmission,
        submittedAt: hasSubmission ? '2026-06-22' : 'Not submitted',
        managerReview: sample?.managerReview || 'Pending Review',
        managerComment: sample?.managerComment || '',
        mentorReview: sample?.mentorReview || 'Pending Review',
        mentorComment: sample?.mentorComment || '',
        reviewedAtManager: sample?.reviewedAtManager || '',
        reviewedAtMentor: sample?.reviewedAtMentor || '',
      }
    }),
    commitments: template.commitments.map((row, rowIndex) => ({
      id: `${template.stage.toLowerCase()}-commit-${rowIndex + 1}`,
      ...row,
    })),
  }))
}

export function ensureReportMilestones(startup) {
  if (startup.reportMilestones?.length) return startup.reportMilestones
  return buildDefaultMilestones(startup.id)
}

export function collectStartupReviews(milestones) {
  const reviews = []

  milestones.forEach((milestone) => {
    if (milestone.managerSummary?.trim()) {
      reviews.push({
        id: `${milestone.id}-manager-summary`,
        kind: 'Milestone summary',
        milestone: milestone.stage,
        deliverable: 'Overall milestone',
        role: 'Incubation Manager',
        decision: milestone.gateDecision,
        comment: milestone.managerSummary,
        date: milestone.reviewedAtManager || '',
      })
    }
    if (milestone.mentorSummary?.trim()) {
      reviews.push({
        id: `${milestone.id}-mentor-summary`,
        kind: 'Milestone summary',
        milestone: milestone.stage,
        deliverable: 'Overall milestone',
        role: 'Mentor',
        decision: milestone.gateDecision,
        comment: milestone.mentorSummary,
        date: milestone.reviewedAtMentor || '',
      })
    }

    milestone.deliverables.forEach((item) => {
      const hasManagerReview =
        item.managerReview !== 'Pending Review' || (item.managerComment || '').trim()
      const hasMentorReview =
        item.mentorReview !== 'Pending Review' || (item.mentorComment || '').trim()

      if (hasManagerReview) {
        reviews.push({
          id: `${item.id}-manager`,
          kind: 'Deliverable review',
          milestone: milestone.stage,
          deliverable: item.title,
          role: 'Incubation Manager',
          decision: item.managerReview,
          comment: item.managerComment,
          date: item.reviewedAtManager || item.submittedAt,
        })
      }
      if (hasMentorReview) {
        reviews.push({
          id: `${item.id}-mentor`,
          kind: 'Deliverable review',
          milestone: milestone.stage,
          deliverable: item.title,
          role: 'Mentor',
          decision: item.mentorReview,
          comment: item.mentorComment,
          date: item.reviewedAtMentor || item.submittedAt,
        })
      }
    })
  })

  return reviews.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export function getDeadlineStatus(deadline) {
  if (!deadline) return 'No deadline'
  const today = '2026-06-28'
  if (deadline < today) return 'Overdue'
  const diff = (new Date(`${deadline}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000
  if (diff <= 7) return 'Due soon'
  return 'On track'
}
