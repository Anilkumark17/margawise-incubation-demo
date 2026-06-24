import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Button, Card, PageHeader, Avatar } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { calcValidationMetrics } from '../../data/seed'

const STAGE_FLOW = ['Validation', 'MVP', 'Pilot', 'Revenue', 'Fundraising']
const STAGE_ICONS = { Validation: '🔍', MVP: '🧩', Pilot: '🚀', Revenue: '💰', Fundraising: '🏦' }
const STAGE_TEMPLATES = [
  {
    stage: 'Validation',
    deliverables: ['Customer interview count', 'Interview summaries', 'Problem statements', 'Market research findings'],
    commitments: [
      { deliverable: 'Customer Interviews', target: 10 },
      { deliverable: 'Interview Summaries', target: 5 },
      { deliverable: 'Problem Statements', target: 3 },
    ],
  },
  {
    stage: 'MVP',
    deliverables: ['Wireframes', 'Product demos', 'Feature completion', 'User feedback'],
    commitments: [
      { deliverable: 'Wireframes', target: 8 },
      { deliverable: 'Product Demos', target: 2 },
      { deliverable: 'Features Completed', target: 6 },
    ],
  },
  {
    stage: 'Pilot',
    deliverables: ['Number of pilot users', 'Usage metrics', 'Customer testimonials', 'Bugs and improvements'],
    commitments: [
      { deliverable: 'Pilot Users', target: 5 },
      { deliverable: 'Usage Reviews', target: 5 },
      { deliverable: 'Testimonials', target: 3 },
    ],
  },
  {
    stage: 'Revenue',
    deliverables: ['Leads generated', 'Paying customers', 'Revenue', 'Conversion rates'],
    commitments: [
      { deliverable: 'Leads Generated', target: 80 },
      { deliverable: 'Paying Customers', target: 15 },
      { deliverable: 'Revenue (USD)', target: 8000 },
    ],
  },
  {
    stage: 'Fundraising',
    deliverables: ['Pitch deck', 'Financial model', 'Investor meetings', 'Due diligence documents'],
    commitments: [
      { deliverable: 'Pitch Deck Revisions', target: 1 },
      { deliverable: 'Investor Meetings', target: 8 },
      { deliverable: 'DD Documents', target: 10 },
    ],
  },
]

function getFlowIndex(stage) {
  if (stage === 'GTM') return 3
  const idx = STAGE_FLOW.indexOf(stage)
  return idx === -1 ? 0 : idx
}

function getStatus(target, actual) {
  if (actual >= target) return 'Complete'
  if (actual >= Math.ceil(target * 0.7)) return 'At Risk'
  return 'Delayed'
}

function inferActual(startup, stage, deliverable) {
  const validation = calcValidationMetrics(startup)
  const released = (startup.features || []).filter((f) => f.status === 'Released').length
  const feedback = startup.userTesting?.feedbackCollected || 0
  const gtm = startup.gtm || {}

  if (stage === 'Validation') {
    if (deliverable.includes('Interviews')) return validation.completed
    if (deliverable.includes('Summaries')) return Math.max(0, validation.completed - 2)
    return Math.min(3, validation.validated || 0)
  }
  if (stage === 'MVP') {
    if (deliverable.includes('Wireframes')) return released + 2
    if (deliverable.includes('Demos')) return Math.max(1, Math.floor((startup.mentorSessions || 0) / 2))
    return released
  }
  if (stage === 'Pilot') {
    if (deliverable.includes('Users')) return startup.userTesting?.testUsers || 0
    if (deliverable.includes('Usage')) return feedback
    return Math.max(0, Math.floor(feedback / 6))
  }
  if (stage === 'Revenue') {
    if (deliverable.includes('Leads')) return gtm.leads || 0
    if (deliverable.includes('Paying')) return gtm.customers || 0
    if (deliverable.includes('Revenue')) return gtm.revenue || 0
    const leads = gtm.leads || 0
    const customers = gtm.customers || 0
    return leads > 0 ? Math.round((customers / leads) * 100) : 0
  }
  return 0
}

function buildMilestonesForStartup(startup) {
  const startupStageIndex = getFlowIndex(startup.stage)
  return STAGE_TEMPLATES.map((template, index) => {
    const unlocked = index <= startupStageIndex + 1
    const commitments = template.commitments.map((row, i) => {
      const actual = inferActual(startup, template.stage, row.deliverable)
      return {
        id: `${startup.id}-${template.stage}-commit-${i + 1}`,
        deliverable: row.deliverable,
        target: row.target,
        actual,
      }
    })
    const deliverables = template.deliverables.map((name, i) => {
      const actual = commitments[i]?.actual ?? 0
      const target = commitments[i]?.target ?? 1
      const progressStatus = unlocked ? (actual >= target ? 'Complete' : actual > 0 ? 'In Progress' : 'Pending') : 'Pending'
      const hasSubmission = unlocked && actual > 0
      return {
        id: `${startup.id}-${template.stage}-deliverable-${i + 1}`,
        title: name,
        progressStatus,
        submittedAt: hasSubmission ? '2026-06-22' : 'Not submitted',
        attachments: hasSubmission ? [`${name.toLowerCase().replace(/\s+/g, '-')}.pdf`] : [],
        evidenceUploaded: hasSubmission,
        link: hasSubmission ? `https://example.com/${startup.id}/${template.stage.toLowerCase()}/${i + 1}` : '',
        mentorReview: 'Pending Review',
        mentorComment: '',
      }
    })
    return {
      id: `milestone-${startup.id}-${template.stage.toLowerCase()}`,
      stage: template.stage,
      unlocked,
      gateDecision: commitments.every((c) => c.actual >= c.target) ? 'Approved to Progress' : 'Pending Review',
      deliverables,
      commitments,
      tasks: deliverables.slice(0, 3).map((d, tIndex) => ({
        id: `${startup.id}-${template.stage}-task-${tIndex + 1}`,
        text: d.title,
        done: d.progressStatus === 'Complete',
      })),
    }
  })
}

export default function MentorStartupReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCurrentMentor, data } = useApp()
  const mentor = getCurrentMentor()
  if (!mentor) return null

  const mentorBookings = (data.bookings || []).filter((b) => b.mentorId === mentor.id)
  const mentorRequests = (data.sessionRequests || []).filter((r) => r.mentorId === mentor.id)
  const mentorActions = (data.mentorStartupActions || []).filter((action) => action.mentorId === mentor.id)
  const assignedStartupIds = [...new Set([
    ...mentorBookings.map((b) => b.startupId),
    ...mentorRequests.filter((r) => r.status !== 'rejected').map((r) => r.startupId),
    ...mentorActions.map((action) => action.startupId),
  ])]

  const startup = data.startups.find((s) => s.id === id && assignedStartupIds.includes(s.id))

  const [commentModal, setCommentModal] = useState(null)
  const [mentorSummary, setMentorSummary] = useState('')
  const [mentorSuggestionInput, setMentorSuggestionInput] = useState('')
  const [mentorSuggestions, setMentorSuggestions] = useState([])
  const [milestones, setMilestones] = useState(() => (startup ? buildMilestonesForStartup(startup) : []))
  const [activeMilestoneId, setActiveMilestoneId] = useState(() => milestones[0]?.id || null)

  if (!startup) {
    return (
      <DashboardLayout role="mentor">
        <PageHeader title="Startup Report" subtitle="Access restricted" />
        <Card className="section-card">
          <p className="text-muted">You can only access reports of startups assigned to you.</p>
          <div style={{ marginTop: 12 }}>
            <Button variant="secondary" onClick={() => navigate('/mentor/dashboard')}>← Back to Dashboard</Button>
          </div>
        </Card>
      </DashboardLayout>
    )
  }

  const activeMilestone = milestones.find((m) => m.id === activeMilestoneId) || milestones[0]
  const submittedCount = activeMilestone?.deliverables.filter((d) => d.submittedAt !== 'Not submitted').length || 0
  const evidenceCount = activeMilestone?.deliverables.filter((d) => d.evidenceUploaded).length || 0
  const approvedCount = activeMilestone?.deliverables.filter((d) => d.mentorReview === 'Approved').length || 0

  const updateDeliverable = (deliverableId, patch) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id !== activeMilestone.id
          ? m
          : { ...m, deliverables: m.deliverables.map((d) => (d.id === deliverableId ? { ...d, ...patch } : d)) }
      )
    )
  }

  const toggleTask = (taskId) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id !== activeMilestone.id
          ? m
          : { ...m, tasks: (m.tasks || []).map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
      )
    )
  }

  const setGateDecision = (decision) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === activeMilestone.id ? { ...m, gateDecision: decision } : m))
    )
  }

  const addSuggestion = () => {
    const text = mentorSuggestionInput.trim()
    if (!text) return
    setMentorSuggestions((prev) => [...prev, { id: `s-${Date.now()}`, text }])
    setMentorSuggestionInput('')
  }

  const saveCommentModal = () => {
    if (!commentModal) return
    updateDeliverable(commentModal.deliverableId, {
      mentorReview: commentModal.review,
      mentorComment: commentModal.comment,
    })
    setCommentModal(null)
  }

  return (
    <DashboardLayout role="mentor">
      {commentModal && (
        <div className="wr-modal-overlay" onClick={() => setCommentModal(null)}>
          <div className="wr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wr-modal-header">
              <div>
                <p className="wr-modal-eyebrow">Mentor Response</p>
                <h3>{commentModal.title}</h3>
              </div>
              <button type="button" className="wr-modal-close" onClick={() => setCommentModal(null)}>✕</button>
            </div>
            <div className="wr-modal-body">
              <label className="form-label">Review</label>
              <select
                className="form-input form-select"
                value={commentModal.review}
                onChange={(e) => setCommentModal((m) => ({ ...m, review: e.target.value }))}
              >
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Needs Rework">Needs Rework</option>
              </select>
              <label className="form-label">Comment</label>
              <textarea
                className="form-input form-textarea"
                rows={4}
                value={commentModal.comment}
                onChange={(e) => setCommentModal((m) => ({ ...m, comment: e.target.value }))}
                placeholder="Write your response for this deliverable..."
              />
            </div>
            <div className="wr-modal-footer">
              <Button variant="secondary" onClick={() => setCommentModal(null)}>Cancel</Button>
              <Button onClick={saveCommentModal}>Save Response</Button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title={`${startup.name} — Report`}
        subtitle={`${startup.founderName} · Mentor View`}
        action={<Button variant="secondary" onClick={() => navigate('/mentor/dashboard')}>← Back</Button>}
      />

      <div className="wr-page-top">
        <div className="wr-page-top-left">
          <div className="wr-startup-banner">
            <Avatar name={startup.name} size={42} />
            <div>
              <h2 className="wr-startup-name">{startup.name}</h2>
              <p className="wr-startup-meta">
                {startup.founderName} · {startup.stage} Stage · {startup.mentorSessions || 0} mentor sessions
              </p>
            </div>
          </div>
        </div>
        <div className="wr-page-top-right">
          <div className="wr-stat-pill"><span>Submitted</span><strong>{submittedCount}/{activeMilestone?.deliverables.length || 0}</strong></div>
          <div className="wr-stat-pill"><span>Evidence</span><strong>{evidenceCount}/{activeMilestone?.deliverables.length || 0}</strong></div>
          <div className="wr-stat-pill wr-stat-green"><span>Approved</span><strong>{approvedCount}/{activeMilestone?.deliverables.length || 0}</strong></div>
        </div>
      </div>

      <div className="wr-milestone-strip-wrap">
        <div className="wr-milestone-strip">
          {milestones.map((milestone) => {
            const complete = milestone.deliverables.every((d) => d.progressStatus === 'Complete')
            const isActive = milestone.id === activeMilestoneId
            return (
              <div
                key={milestone.id}
                className={`wr-ms-card${isActive ? ' active' : ''}${complete ? ' ms-complete' : ''}${!milestone.unlocked ? ' ms-locked' : ''}`}
              >
                <button type="button" className="wr-ms-body" onClick={() => setActiveMilestoneId(milestone.id)}>
                  <span className="wr-ms-icon">{STAGE_ICONS[milestone.stage] || '🗂️'}</span>
                  <span className="wr-ms-name">{milestone.stage}</span>
                  <span className="wr-ms-status">{complete ? '✅ Done' : milestone.unlocked ? 'In Progress' : '🔒 Locked'}</span>
                  <Badge status={milestone.gateDecision} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {activeMilestone && (
        <div className="wr-workspace">
          <div className="wr-workspace-main">
            <Card className="section-card">
              <div className="section-header">
                <h3>{STAGE_ICONS[activeMilestone.stage] || '🗂️'} {activeMilestone.stage} — Deliverables</h3>
                <div className="wr-deliverable-head-actions">
                  <Badge status={activeMilestone.deliverables.every((d) => d.progressStatus === 'Complete') ? 'Complete' : 'In Progress'} />
                </div>
              </div>
              <div className="wr-deliverable-list">
                {activeMilestone.deliverables.map((item) => {
                  const hasSubmission = item.submittedAt !== 'Not submitted'
                  const hasResponse = (item.mentorComment || '').trim() || item.mentorReview !== 'Pending Review'
                  return (
                    <div key={item.id} className="wr-deliverable-row">
                      <div className="wr-del-header">
                        <span className="wr-del-title">{item.title}</span>
                        <div className="wr-del-header-right">
                          <Badge status={item.progressStatus} />
                          {hasResponse ? <Badge status={item.mentorReview} /> : null}
                        </div>
                      </div>
                      <div className="wr-del-submission">
                        <span className="wr-del-section-label">Submitted by Startup</span>
                        {hasSubmission ? (
                          <div className="wr-del-sub-row">
                            <span className="wr-sub-date">📅 {item.submittedAt}</span>
                            {item.evidenceUploaded ? <span className="wr-evidence-badge">✓ Evidence</span> : null}
                            {item.attachments[0] ? <span className="wr-file-badge">📎 {item.attachments[0]}</span> : null}
                            {item.link ? <a className="wr-link-badge" href={item.link} target="_blank" rel="noreferrer">🔗 View Link</a> : null}
                          </div>
                        ) : (
                          <p className="wr-del-not-submitted">Not yet submitted</p>
                        )}
                      </div>
                      <div className="wr-del-response">
                        {hasResponse ? (
                          <div className="wr-del-response-sent">
                            <p className="wr-del-response-text">{item.mentorComment || <em className="text-muted">No written feedback.</em>}</p>
                            <button
                              type="button"
                              className="wr-comment-edit-btn"
                              onClick={() => setCommentModal({
                                deliverableId: item.id,
                                title: item.title,
                                review: item.mentorReview,
                                comment: item.mentorComment,
                              })}
                            >
                              Edit Response
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="wr-comment-btn"
                            onClick={() => setCommentModal({
                              deliverableId: item.id,
                              title: item.title,
                              review: item.mentorReview,
                              comment: item.mentorComment,
                            })}
                          >
                            + Add Comment &amp; Review
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="section-card">
              <div className="section-header">
                <h3>Committed vs Actual</h3>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Deliverable</th>
                      <th>Target</th>
                      <th>Actual</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeMilestone.commitments.map((row) => (
                      <tr key={row.id}>
                        <td>{row.deliverable}</td>
                        <td>{row.target}</td>
                        <td>{row.actual}</td>
                        <td><Badge status={getStatus(row.target, row.actual)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="section-card">
              <div className="section-header">
                <h3>Tasks</h3>
                <span className="text-muted sm">
                  {(activeMilestone.tasks || []).filter((t) => t.done).length}/{(activeMilestone.tasks || []).length} done
                </span>
              </div>
              {(activeMilestone.tasks || []).length === 0 ? (
                <p className="wr-task-empty text-muted sm">No tasks yet.</p>
              ) : (
                <ul className="wr-task-list">
                  {(activeMilestone.tasks || []).map((task) => (
                    <li key={task.id} className={`wr-task-item${task.done ? ' done' : ''}`}>
                      <button type="button" className="wr-task-check" onClick={() => toggleTask(task.id)}>
                        <span className={`wr-task-dot${task.done ? ' checked' : ''}`} />
                      </button>
                      <span className="wr-task-text">{task.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="wr-workspace-side">
            <Card className="section-card">
              <h4 className="wr-side-heading">Gate Decision</h4>
              <select className="form-input form-select" value={activeMilestone.gateDecision} onChange={(e) => setGateDecision(e.target.value)}>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved to Progress">Approved to Progress</option>
                <option value="Hold">Hold</option>
                <option value="Needs Rework">Needs Rework</option>
              </select>

              <h4 className="wr-side-heading">Mentor Summary</h4>
              <textarea
                className="form-input form-textarea"
                rows={4}
                value={mentorSummary}
                onChange={(e) => setMentorSummary(e.target.value)}
                placeholder="Overall summary for this startup..."
              />
            </Card>

            <Card className="section-card">
              <h4 className="wr-side-heading">Mentor Suggestions</h4>
              <div className="wr-task-add-row">
                <input
                  className="form-input"
                  placeholder="Add suggestion..."
                  value={mentorSuggestionInput}
                  onChange={(e) => setMentorSuggestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSuggestion()}
                />
                <Button size="sm" onClick={addSuggestion}>Add</Button>
              </div>
              {mentorSuggestions.length === 0 ? (
                <p className="text-muted sm">No suggestions yet.</p>
              ) : (
                <ul className="wr-task-list">
                  {mentorSuggestions.map((s) => (
                    <li key={s.id} className="wr-task-item"><span className="wr-task-text">{s.text}</span></li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

