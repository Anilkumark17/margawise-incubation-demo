import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Button, Card } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

/* ── tiny inline helpers ── */
function IconBtn({ icon, title, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`wr-icon-btn${danger ? ' wr-icon-btn-danger' : ''}`}
    >
      {icon}
    </button>
  )
}

const STAGE_TEMPLATES = [
  {
    stage: 'Validation',
    deliverables: [
      'Customer interview count',
      'Interview summaries',
      'Problem statements',
      'Market research findings',
    ],
    commitments: [
      { deliverable: 'Customer Interviews', target: 10, actual: 8 },
      { deliverable: 'Interview Summaries', target: 5, actual: 4 },
      { deliverable: 'Problem Statements', target: 3, actual: 3 },
    ],
  },
  {
    stage: 'MVP',
    deliverables: ['Wireframes', 'Product demos', 'Feature completion', 'User feedback'],
    commitments: [
      { deliverable: 'Wireframes', target: 8, actual: 5 },
      { deliverable: 'Product Demos', target: 2, actual: 1 },
      { deliverable: 'Features Completed', target: 6, actual: 3 },
    ],
  },
  {
    stage: 'Pilot',
    deliverables: ['Number of pilot users', 'Usage metrics', 'Customer testimonials', 'Bugs and improvements'],
    commitments: [
      { deliverable: 'Pilot Users', target: 5, actual: 2 },
      { deliverable: 'Usage Reviews', target: 5, actual: 2 },
      { deliverable: 'Testimonials', target: 3, actual: 1 },
    ],
  },
  {
    stage: 'Revenue',
    deliverables: ['Leads generated', 'Paying customers', 'Revenue', 'Conversion rates'],
    commitments: [
      { deliverable: 'Leads Generated', target: 80, actual: 30 },
      { deliverable: 'Paying Customers', target: 15, actual: 5 },
      { deliverable: 'Revenue (USD)', target: 8000, actual: 2400 },
    ],
  },
  {
    stage: 'Fundraising',
    deliverables: ['Pitch deck', 'Financial model', 'Investor meetings', 'Due diligence documents'],
    commitments: [
      { deliverable: 'Pitch Deck Revisions', target: 1, actual: 0 },
      { deliverable: 'Investor Meetings', target: 8, actual: 2 },
      { deliverable: 'DD Documents', target: 10, actual: 3 },
    ],
  },
]

const STAGE_ICONS = {
  Validation: '🔍',
  MVP: '🧩',
  Pilot: '🚀',
  Revenue: '💰',
  Fundraising: '🏦',
}

function getStatus(target, actual) {
  if (actual >= target) return 'Complete'
  if (actual >= Math.ceil(target * 0.7)) return 'At Risk'
  return 'Delayed'
}

function createMilestoneFromInput(stageName, deliverableNames, unlocked = false) {
  const safeStage = stageName?.trim() || 'Custom'
  const stageKey = safeStage.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const deliverables = deliverableNames.length
    ? deliverableNames
    : ['Deliverable 1', 'Deliverable 2', 'Deliverable 3']

  return {
    id: `milestone-${stageKey}-${Date.now()}`,
    stage: safeStage,
    unlocked,
    managerUnlocked: unlocked,
    gateDecision: 'Pending Review',
    interventionPlan: '',
    tasks: [],
    deliverables: deliverables.map((item, index) => ({
      id: `${stageKey}-deliverable-${Date.now()}-${index + 1}`,
      title: item,
      progressStatus: 'Pending',
      attachments: [],
      link: '',
      evidenceUploaded: false,
      submittedAt: 'Not submitted',
      managerReview: 'Pending Review',
      managerComment: '',
    })),
    commitments: deliverables.slice(0, 3).map((item, index) => ({
      id: `${stageKey}-commit-${Date.now()}-${index + 1}`,
      deliverable: item,
      target: 1,
      actual: 0,
    })),
  }
}

function buildMilestones() {
  return STAGE_TEMPLATES.map((template, index) => ({
    id: `milestone-${template.stage.toLowerCase()}`,
    stage: template.stage,
    unlocked: index === 0,
    managerUnlocked: false,
    gateDecision: 'Pending Review',
    interventionPlan: '',
    tasks: [],
    deliverables: template.deliverables.map((item, itemIndex) => ({
      id: `${template.stage.toLowerCase()}-deliverable-${itemIndex + 1}`,
      title: item,
      progressStatus: index === 0 && itemIndex < 2 ? 'In Progress' : 'Pending',
      attachments: index === 0 ? [`${item.toLowerCase().replace(/\s+/g, '-')}-week24.pdf`] : [],
      link: index === 0 ? `https://example.com/${template.stage.toLowerCase()}/${itemIndex + 1}` : '',
      evidenceUploaded: index === 0 && itemIndex < 2,
      submittedAt: index === 0 ? '2026-06-22' : 'Not submitted',
      managerReview: 'Pending Review',
      managerComment: '',
    })),
    commitments: template.commitments.map((row, rowIndex) => ({
      id: `${template.stage.toLowerCase()}-commit-${rowIndex + 1}`,
      ...row,
    })),
  }))
}

export default function ReportsHub() {
  const { data } = useApp()
  const navigate = useNavigate()
  const { id: startupId } = useParams()
  const [milestones, setMilestones] = useState(buildMilestones)
  const [activeMilestoneId, setActiveMilestoneId] = useState('milestone-validation')

  /* comment modal */
  const [commentModal, setCommentModal] = useState(null) // { deliverableId, title, review, comment }

  const openCommentModal = (item) => {
    setCommentModal({ deliverableId: item.id, title: item.title, review: item.managerReview, comment: item.managerComment })
  }
  const saveComment = () => {
    if (!commentModal) return
    setDeliverableReview(commentModal.deliverableId, commentModal.review)
    setDeliverableComment(commentModal.deliverableId, commentModal.comment)
    setCommentModal(null)
  }

  /* per-milestone tasks */
  const [newTaskText, setNewTaskText] = useState('')
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editingTaskText, setEditingTaskText] = useState('')

  const [managerSummary, setManagerSummary] = useState('')
  const [mentorSuggestionInput, setMentorSuggestionInput] = useState('')
  const [mentorSuggestions, setMentorSuggestions] = useState([])
  const [blockerInput, setBlockerInput] = useState('')
  const [blockers, setBlockers] = useState([
    { id: 'blk-1', text: 'Customer interviews below plan this week', severity: 'High', owner: 'Founder' },
  ])

  const startup = useMemo(() => {
    if (startupId) return data.startups.find((s) => s.id === startupId) || null
    return data.startups[0] || null
  }, [data.startups, startupId])

  const activeMilestone = milestones.find((m) => m.id === activeMilestoneId) || milestones[0]
  const activeMilestoneIndex = milestones.findIndex((m) => m.id === activeMilestone.id)
  const nextMilestone = milestones[activeMilestoneIndex + 1] || null
  const submittedCount = activeMilestone.deliverables.filter((item) => item.submittedAt !== 'Not submitted').length
  const evidenceCount = activeMilestone.deliverables.filter((item) => item.evidenceUploaded).length
  const approvedCount = activeMilestone.deliverables.filter((item) => item.managerReview === 'Approved').length
  const needsReworkCount = activeMilestone.deliverables.filter((item) => item.managerReview === 'Needs Rework').length

  const setDeliverableReview = (deliverableId, nextReview) => {
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id !== activeMilestone.id
          ? milestone
          : {
              ...milestone,
              deliverables: milestone.deliverables.map((item) =>
                item.id === deliverableId ? { ...item, managerReview: nextReview } : item
              ),
            }
      )
    )
  }

  const setDeliverableComment = (deliverableId, comment) => {
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id !== activeMilestone.id
          ? milestone
          : {
              ...milestone,
              deliverables: milestone.deliverables.map((item) =>
                item.id === deliverableId ? { ...item, managerComment: comment } : item
              ),
            }
      )
    )
  }

  const unlockNextMilestone = () => {
    if (!nextMilestone) return
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id === nextMilestone.id
          ? { ...milestone, managerUnlocked: true, unlocked: true }
          : milestone
      )
    )
  }

  const toggleMilestoneLock = (milestoneId) => {
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id === milestoneId
          ? { ...milestone, unlocked: !milestone.unlocked, managerUnlocked: !milestone.unlocked }
          : milestone
      )
    )
  }

  const deleteMilestone = (milestoneId) => {
    setMilestones((current) => {
      if (current.length <= 1) return current
      const next = current.filter((milestone) => milestone.id !== milestoneId)
      if (activeMilestoneId === milestoneId) {
        setActiveMilestoneId(next[0].id)
      }
      return next
    })
  }

  /* ── task handlers ── */
  const addTask = () => {
    const text = newTaskText.trim()
    if (!text) return
    setMilestones((curr) =>
      curr.map((m) =>
        m.id !== activeMilestone.id
          ? m
          : { ...m, tasks: [...(m.tasks || []), { id: `task-${Date.now()}`, text, done: false }] }
      )
    )
    setNewTaskText('')
  }

  const toggleTask = (taskId) => {
    setMilestones((curr) =>
      curr.map((m) =>
        m.id !== activeMilestone.id
          ? m
          : { ...m, tasks: (m.tasks || []).map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
      )
    )
  }

  const startEditTask = (task) => {
    setEditingTaskId(task.id)
    setEditingTaskText(task.text)
  }

  const saveEditTask = (taskId) => {
    const text = editingTaskText.trim()
    if (!text) return
    setMilestones((curr) =>
      curr.map((m) =>
        m.id !== activeMilestone.id
          ? m
          : { ...m, tasks: (m.tasks || []).map((t) => (t.id === taskId ? { ...t, text } : t)) }
      )
    )
    setEditingTaskId(null)
    setEditingTaskText('')
  }

  const deleteTask = (taskId) => {
    setMilestones((curr) =>
      curr.map((m) =>
        m.id !== activeMilestone.id
          ? m
          : { ...m, tasks: (m.tasks || []).filter((t) => t.id !== taskId) }
      )
    )
  }

  const setGateDecision = (decision) => {
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id === activeMilestone.id ? { ...milestone, gateDecision: decision } : milestone
      )
    )
  }

  const setInterventionPlan = (plan) => {
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id === activeMilestone.id ? { ...milestone, interventionPlan: plan } : milestone
      )
    )
  }

  const addBlocker = () => {
    const text = blockerInput.trim()
    if (!text) return
    setBlockers((current) => [...current, { id: `blk-${Date.now()}`, text, severity: 'Medium', owner: 'Incubation Manager' }])
    setBlockerInput('')
  }

  const addMentorSuggestion = () => {
    const text = mentorSuggestionInput.trim()
    if (!text) return
    setMentorSuggestions((current) => [
      ...current,
      {
        id: `mentor-suggestion-${Date.now()}`,
        text,
      },
    ])
    setMentorSuggestionInput('')
  }

  const resetView = () => {
    setMilestones(buildMilestones())
    setActiveMilestoneId('milestone-validation')
    setManagerSummary('')
    setMentorSuggestionInput('')
    setMentorSuggestions([])
    setBlockerInput('')
    setBlockers([{ id: 'blk-1', text: 'Customer interviews below plan this week', severity: 'High', owner: 'Founder' }])
  }

  return (
    <DashboardLayout role="incubation">

      {/* ── Comment / Review Modal ── */}
      {commentModal && (
        <div className="wr-modal-overlay" onClick={() => setCommentModal(null)}>
          <div className="wr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wr-modal-header">
              <div>
                <p className="wr-modal-eyebrow">Review Deliverable</p>
                <h3>{commentModal.title}</h3>
              </div>
              <button type="button" className="wr-modal-close" onClick={() => setCommentModal(null)}>✕</button>
            </div>
            <div className="wr-modal-body">
              <label className="form-label">Decision</label>
              <select
                className="form-input form-select"
                value={commentModal.review}
                onChange={(e) => setCommentModal((m) => ({ ...m, review: e.target.value }))}
              >
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Needs Rework">Needs Rework</option>
              </select>
              <label className="form-label">Your Feedback</label>
              <textarea
                className="form-input form-textarea"
                rows={5}
                autoFocus
                value={commentModal.comment}
                onChange={(e) => setCommentModal((m) => ({ ...m, comment: e.target.value }))}
                placeholder="Write your feedback for the startup on this deliverable…"
              />
            </div>
            <div className="wr-modal-footer">
              <Button variant="secondary" onClick={() => setCommentModal(null)}>Cancel</Button>
              <Button onClick={saveComment}>Send Review</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="wr-page-top">
        <div className="wr-page-top-left">
          <button type="button" className="wr-back-btn" onClick={() => navigate('/incubation/dashboard')}>
            ← Back
          </button>
          {startup && (
            <div className="wr-startup-banner">
              <div className="wr-startup-avatar">{startup.name.charAt(0)}</div>
              <div>
                <h2 className="wr-startup-name">{startup.name}</h2>
                <p className="wr-startup-meta">
                  {startup.founderName} · {startup.stage} Stage · {startup.mentorSessions || 0} mentor sessions
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="wr-page-top-right">
          <div className="wr-stat-pill"><span>Submitted</span><strong>{submittedCount}/{activeMilestone.deliverables.length}</strong></div>
          <div className="wr-stat-pill"><span>Evidence</span><strong>{evidenceCount}/{activeMilestone.deliverables.length}</strong></div>
          <div className="wr-stat-pill wr-stat-green"><span>Approved</span><strong>{approvedCount}/{activeMilestone.deliverables.length}</strong></div>
          <div className="wr-stat-pill wr-stat-red"><span>Rework</span><strong>{needsReworkCount}</strong></div>
          <Button size="sm" variant="secondary" onClick={resetView}>Reset</Button>
        </div>
      </div>

      {/* ── Milestone strip ── */}
      <div className="wr-milestone-strip-wrap">
        <div className="wr-milestone-strip">
          {milestones.map((milestone) => {
            const complete = milestone.deliverables.every((d) => d.progressStatus === 'Complete')
            const isActive = activeMilestoneId === milestone.id
            return (
              <div
                key={milestone.id}
                className={`wr-ms-card${isActive ? ' active' : ''}${complete ? ' ms-complete' : ''}${!milestone.unlocked ? ' ms-locked' : ''}`}
              >
                <button type="button" className="wr-ms-body" onClick={() => setActiveMilestoneId(milestone.id)}>
                  <span className="wr-ms-icon">{STAGE_ICONS[milestone.stage] || '🗂️'}</span>
                  <span className="wr-ms-name">{milestone.stage}</span>
                  <span className="wr-ms-status">
                    {complete ? '✅ Done' : milestone.unlocked ? 'In Progress' : '🔒 Locked'}
                  </span>
                  <Badge status={milestone.gateDecision} />
                </button>
                <div className="wr-ms-controls">
                  <IconBtn
                    icon={milestone.unlocked ? '🔒' : '🔓'}
                    title={milestone.unlocked ? 'Lock' : 'Unlock'}
                    onClick={() => toggleMilestoneLock(milestone.id)}
                  />
                  <IconBtn
                    icon="🗑️"
                    title="Delete"
                    onClick={() => deleteMilestone(milestone.id)}
                    disabled={milestones.length <= 1}
                    danger
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Active milestone workspace ── */}
      {activeMilestone && (
        <div className="wr-workspace">

          {/* Left column */}
          <div className="wr-workspace-main">

            {/* Deliverables — read-only view of what startup submitted */}
            <Card className="section-card">
              <div className="section-header">
                <h3>{STAGE_ICONS[activeMilestone.stage] || '🗂️'} {activeMilestone.stage} — Deliverables</h3>
                <div className="wr-deliverable-head-actions">
                  <Badge status={activeMilestone.deliverables.every((d) => d.progressStatus === 'Complete') ? 'Complete' : 'In Progress'} />
                  {nextMilestone && (
                    <Button size="sm" variant="secondary" onClick={unlockNextMilestone} disabled={nextMilestone.unlocked}>
                      {nextMilestone.unlocked ? `${nextMilestone.stage} unlocked` : `Unlock ${nextMilestone.stage} →`}
                    </Button>
                  )}
                </div>
              </div>
              <div className="wr-deliverable-list">
                {activeMilestone.deliverables.map((item) => {
                  const hasSubmission = item.submittedAt !== 'Not submitted'
                  const hasResponse = item.managerComment.trim() !== '' || item.managerReview !== 'Pending Review'
                  return (
                    <div
                      key={item.id}
                      className={`wr-deliverable-row${item.managerReview === 'Approved' ? ' del-approved' : item.managerReview === 'Needs Rework' ? ' del-rework' : ''}`}
                    >
                      {/* title row */}
                      <div className="wr-del-header">
                        <span className="wr-del-title">{item.title}</span>
                        <div className="wr-del-header-right">
                          <Badge status={item.progressStatus} />
                          {hasResponse && <Badge status={item.managerReview} />}
                        </div>
                      </div>

                      {/* submission */}
                      <div className="wr-del-submission">
                        <span className="wr-del-section-label">Submitted by Startup</span>
                        {hasSubmission ? (
                          <div className="wr-del-sub-row">
                            <span className="wr-sub-date">📅 {item.submittedAt}</span>
                            {item.evidenceUploaded && <span className="wr-evidence-badge">✓ Evidence</span>}
                            {item.attachments[0] && <span className="wr-file-badge">📎 {item.attachments[0]}</span>}
                            {item.link && (
                              <a className="wr-link-badge" href={item.link} target="_blank" rel="noreferrer">🔗 View Link</a>
                            )}
                          </div>
                        ) : (
                          <p className="wr-del-not-submitted">Not yet submitted</p>
                        )}
                      </div>

                      {/* manager response */}
                      <div className="wr-del-response">
                        {hasResponse ? (
                          <div className="wr-del-response-sent">
                            <p className="wr-del-response-text">
                              {item.managerComment || <em className="text-muted">No written feedback.</em>}
                            </p>
                            <button type="button" className="wr-comment-edit-btn" onClick={() => openCommentModal(item)}>
                              Edit Response
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="wr-comment-btn"
                            onClick={() => openCommentModal(item)}
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

            {/* Committed vs Actual — read-only */}
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

            {/* Tasks */}
            <Card className="section-card">
              <div className="section-header">
                <h3>Tasks</h3>
                <span className="text-muted sm">
                  {(activeMilestone.tasks || []).filter((t) => t.done).length}/{(activeMilestone.tasks || []).length} done
                </span>
              </div>
              <div className="wr-task-add-row">
                <input
                  className="form-input"
                  placeholder="Add a task… press Enter"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                <Button size="sm" onClick={addTask} disabled={!newTaskText.trim()}>Add</Button>
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
                      {editingTaskId === task.id ? (
                        <input
                          className="form-input wr-task-edit-input"
                          value={editingTaskText}
                          onChange={(e) => setEditingTaskText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEditTask(task.id); if (e.key === 'Escape') setEditingTaskId(null) }}
                          autoFocus
                        />
                      ) : (
                        <span className="wr-task-text">{task.text}</span>
                      )}
                      <div className="wr-task-controls">
                        {editingTaskId === task.id ? (
                          <>
                            <IconBtn icon="💾" title="Save" onClick={() => saveEditTask(task.id)} />
                            <IconBtn icon="✕" title="Cancel" onClick={() => setEditingTaskId(null)} />
                          </>
                        ) : (
                          <IconBtn icon="✏️" title="Edit" onClick={() => startEditTask(task)} />
                        )}
                        <IconBtn icon="🗑️" title="Delete" onClick={() => deleteTask(task.id)} danger />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="wr-workspace-side">
            <Card className="section-card">
              <h4 className="wr-side-heading">Gate Decision</h4>
              <select
                className="form-input form-select"
                value={activeMilestone.gateDecision}
                onChange={(e) => setGateDecision(e.target.value)}
              >
                <option value="Pending Review">Pending Review</option>
                <option value="Approved to Progress">Approved to Progress</option>
                <option value="Hold">Hold</option>
                <option value="Needs Rework">Needs Rework</option>
              </select>

              <h4 className="wr-side-heading">Manager Comment</h4>
              <textarea
                className="form-input form-textarea"
                rows={4}
                value={managerSummary}
                onChange={(e) => setManagerSummary(e.target.value)}
                placeholder="Overall review for this milestone…"
              />

              <h4 className="wr-side-heading">Intervention Plan</h4>
              <textarea
                className="form-input form-textarea"
                rows={3}
                value={activeMilestone.interventionPlan}
                onChange={(e) => setInterventionPlan(e.target.value)}
                placeholder="Owners, actions, deadlines…"
              />
            </Card>

            <Card className="section-card">
              <h4 className="wr-side-heading">Blockers</h4>
              <div className="wr-chip-list">
                {blockers.map((item) => (
                  <div key={item.id} className={`wr-chip${item.severity === 'High' ? ' wr-chip-high' : ''}`}>
                    <span>{item.text}</span>
                    <span className="wr-chip-owner">{item.owner}</span>
                  </div>
                ))}
              </div>
              <div className="wr-mentor-row">
                <input className="form-input" value={blockerInput} onChange={(e) => setBlockerInput(e.target.value)} placeholder="Add blocker…" />
                <Button size="sm" variant="secondary" onClick={addBlocker}>Add</Button>
              </div>
            </Card>

            <Card className="section-card">
              <h4 className="wr-side-heading">Mentor Suggestions</h4>
              <div className="wr-chip-list">
                {mentorSuggestions.length === 0
                  ? <p className="text-muted sm">None yet.</p>
                  : mentorSuggestions.map((item) => (
                    <div key={item.id} className="wr-chip wr-chip-mentor">{item.text}</div>
                  ))
                }
              </div>
              <div className="wr-mentor-row">
                <input className="form-input" value={mentorSuggestionInput} onChange={(e) => setMentorSuggestionInput(e.target.value)} placeholder="Suggest a mentor…" />
                <Button size="sm" onClick={addMentorSuggestion}>Add</Button>
              </div>
            </Card>
          </div>

        </div>
      )}
    </DashboardLayout>
  )
}

