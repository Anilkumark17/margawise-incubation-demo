import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Button, Card } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { buildDefaultMilestones, ensureReportMilestones, getStatus } from '../../data/reportMilestones'

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
    managerSummary: '',
    mentorSummary: '',
    interventionPlan: '',
    tasks: [],
    deliverables: deliverables.map((item, index) => ({
      id: `${stageKey}-deliverable-${Date.now()}-${index + 1}`,
      title: item,
      deadline: '',
      progressStatus: 'Pending',
      attachments: [],
      link: '',
      evidenceUploaded: false,
      submittedAt: 'Not submitted',
      managerReview: 'Pending Review',
      managerComment: '',
      mentorReview: 'Pending Review',
      mentorComment: '',
      reviewedAtManager: '',
      reviewedAtMentor: '',
    })),
    commitments: deliverables.slice(0, 3).map((item, index) => ({
      id: `${stageKey}-commit-${Date.now()}-${index + 1}`,
      deliverable: item,
      target: 1,
      actual: 0,
    })),
  }
}

const REPORT_COPY = {
  incubation: {
    pageTitle: 'Reports',
    gateDecision: 'Gate decision',
    summary: 'Manager comment',
    summaryPlaceholder: 'Overall review for this milestone…',
    plan: 'Intervention plan',
    planPlaceholder: 'Owners, actions, deadlines…',
    blockers: 'Blockers',
    blockerPlaceholder: 'Add blocker…',
    suggestionsTitle: 'Mentor suggestions',
    suggestionsEmpty: 'None yet.',
    suggestionsPlaceholder: 'Suggest a mentor…',
    reviewEyebrow: 'Review Deliverable',
    reviewSubmit: 'Send Review',
    deliverableReview: 'Review',
    deliverableEditReview: 'Edit review',
    feedbackEmpty: 'Review recorded — no written feedback.',
  },
  mentor: {
    pageTitle: 'Startup Report',
    gateDecision: 'Mentor recommendation',
    summary: 'Mentor feedback',
    summaryPlaceholder: 'Overall feedback for this milestone…',
    plan: 'Recommended next steps',
    planPlaceholder: 'Actions you recommend for the startup…',
    blockers: 'Observed blockers',
    blockerPlaceholder: 'Flag a blocker you have observed…',
    suggestionsTitle: 'Recommendations for startup',
    suggestionsEmpty: 'No recommendations yet.',
    suggestionsPlaceholder: 'Add a recommendation for the startup…',
    reviewEyebrow: 'Mentor Response',
    reviewSubmit: 'Save Feedback',
    deliverableReview: 'Add feedback',
    deliverableEditReview: 'Edit feedback',
    feedbackEmpty: 'Feedback recorded — no written comments.',
  },
}

export default function ReportsHub({ role: roleProp, backPath: backPathProp, startupId: startupIdProp }) {
  const { data, updateReportMilestones } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { id: routeStartupId } = useParams()
  const startupId = startupIdProp ?? routeStartupId

  const isMentorView = location.pathname.startsWith('/mentor/')
  const role = roleProp ?? (isMentorView ? 'mentor' : data.currentUser?.role === 'mentor' ? 'mentor' : 'incubation')
  const backPath = backPathProp ?? (role === 'mentor' ? '/mentor/dashboard' : '/incubation/dashboard')
  const isMentor = role === 'mentor'
  const copy = isMentor ? REPORT_COPY.mentor : REPORT_COPY.incubation
  const [activeMilestoneId, setActiveMilestoneId] = useState('milestone-validation')

  const startup = useMemo(() => {
    if (startupId) return data.startups.find((s) => s.id === startupId) || null
    return data.startups[0] || null
  }, [data.startups, startupId])

  const milestones = useMemo(
    () => (startup ? ensureReportMilestones(startup) : buildDefaultMilestones('startup-1')),
    [startup]
  )

  const setMilestones = (updater) => {
    if (!startup) return
    updateReportMilestones(startup.id, updater)
  }

  /* comment modal */
  const [commentModal, setCommentModal] = useState(null)

  const openCommentModal = (item) => {
    setCommentModal({
      deliverableId: item.id,
      title: item.title,
      review: isMentor ? item.mentorReview : item.managerReview,
      comment: isMentor ? item.mentorComment : item.managerComment,
    })
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

  const [mentorSuggestionInput, setMentorSuggestionInput] = useState('')
  const [mentorSuggestions, setMentorSuggestions] = useState([])
  const [blockerInput, setBlockerInput] = useState('')
  const [blockers, setBlockers] = useState([
    { id: 'blk-1', text: 'Customer interviews below plan this week', severity: 'High', owner: 'Founder' },
  ])

  const [showCreateMilestone, setShowCreateMilestone] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [newDeliverablesText, setNewDeliverablesText] = useState('')

  const activeMilestone = milestones.find((m) => m.id === activeMilestoneId) || milestones[0]
  const activeMilestoneIndex = milestones.findIndex((m) => m.id === activeMilestone.id)
  const nextMilestone = milestones[activeMilestoneIndex + 1] || null
  const submittedCount = activeMilestone.deliverables.filter((item) => item.submittedAt !== 'Not submitted').length
  const evidenceCount = activeMilestone.deliverables.filter((item) => item.evidenceUploaded).length
  const approvedCount = activeMilestone.deliverables.filter((item) =>
    isMentor ? item.mentorReview === 'Approved' : item.managerReview === 'Approved'
  ).length
  const needsReworkCount = activeMilestone.deliverables.filter((item) =>
    isMentor ? item.mentorReview === 'Needs Rework' : item.managerReview === 'Needs Rework'
  ).length
  const summaryValue = isMentor ? activeMilestone.mentorSummary || '' : activeMilestone.managerSummary || ''

  const setDeliverableReview = (deliverableId, nextReview) => {
    const today = new Date().toISOString().split('T')[0]
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id !== activeMilestone.id
          ? milestone
          : {
              ...milestone,
              deliverables: milestone.deliverables.map((item) =>
                item.id === deliverableId
                  ? isMentor
                    ? { ...item, mentorReview: nextReview, reviewedAtMentor: today }
                    : { ...item, managerReview: nextReview, reviewedAtManager: today }
                  : item
              ),
            }
      )
    )
  }

  const setDeliverableComment = (deliverableId, comment) => {
    const today = new Date().toISOString().split('T')[0]
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id !== activeMilestone.id
          ? milestone
          : {
              ...milestone,
              deliverables: milestone.deliverables.map((item) =>
                item.id === deliverableId
                  ? isMentor
                    ? { ...item, mentorComment: comment, reviewedAtMentor: today }
                    : { ...item, managerComment: comment, reviewedAtManager: today }
                  : item
              ),
            }
      )
    )
  }

  const setSummaryValue = (value) => {
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id === activeMilestone.id
          ? { ...milestone, [isMentor ? 'mentorSummary' : 'managerSummary']: value }
          : milestone
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
    setBlockers((current) => [...current, { id: `blk-${Date.now()}`, text, severity: 'Medium', owner: isMentor ? 'Mentor' : 'Incubation Manager' }])
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

  const createMilestone = () => {
    const deliverableNames = newDeliverablesText
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
    const milestone = createMilestoneFromInput(newStageName, deliverableNames, true)
    setMilestones((current) => [...current, milestone])
    setActiveMilestoneId(milestone.id)
    setShowCreateMilestone(false)
    setNewStageName('')
    setNewDeliverablesText('')
  }

  const resetView = () => {
    if (!startup) return
    updateReportMilestones(startup.id, buildDefaultMilestones(startup.id))
    setActiveMilestoneId('milestone-validation')
    setMentorSuggestionInput('')
    setMentorSuggestions([])
    setBlockerInput('')
    setBlockers([{ id: 'blk-1', text: 'Customer interviews below plan this week', severity: 'High', owner: 'Founder' }])
  }

  return (
    <DashboardLayout role={role}>
      <div className="wr-shell">

      {commentModal && (
        <div className="wr-modal-overlay" onClick={() => setCommentModal(null)}>
          <div className="wr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wr-modal-header">
              <div>
                <p className="wr-modal-eyebrow">{copy.reviewEyebrow}</p>
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
              <Button onClick={saveComment}>{copy.reviewSubmit}</Button>
            </div>
          </div>
        </div>
      )}

      {showCreateMilestone && (
        <div className="wr-modal-overlay" onClick={() => setShowCreateMilestone(false)}>
          <div className="wr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wr-modal-header">
              <div>
                <p className="wr-modal-eyebrow">New Milestone</p>
                <h3>Create milestone</h3>
              </div>
              <button type="button" className="wr-modal-close" onClick={() => setShowCreateMilestone(false)}>✕</button>
            </div>
            <div className="wr-modal-body">
              <label className="form-label">Stage name</label>
              <input
                className="form-input"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="e.g. GTM, Scale, Custom stage…"
                autoFocus
              />
              <label className="form-label">Deliverables</label>
              <textarea
                className="form-input form-textarea"
                rows={4}
                value={newDeliverablesText}
                onChange={(e) => setNewDeliverablesText(e.target.value)}
                placeholder="One per line or comma-separated&#10;e.g. Pitch deck, Investor meetings"
              />
            </div>
            <div className="wr-modal-footer">
              <Button variant="secondary" onClick={() => setShowCreateMilestone(false)}>Cancel</Button>
              <Button onClick={createMilestone} disabled={!newStageName.trim()}>Create Milestone</Button>
            </div>
          </div>
        </div>
      )}

      <div className="wr-shell-head">
        <div>
          <button type="button" className="wr-back-btn wr-back-inline" onClick={() => navigate(backPath)}>
            ← Back
          </button>
          <h1 className="wr-shell-title">{copy.pageTitle}</h1>
          {startup && (
            <p className="wr-shell-sub">
              {startup.name} · {startup.founderName} · {startup.stage}
            </p>
          )}
        </div>
        <div className="wr-shell-head-right">
          <div className="wr-shell-stats">
            <div className="wr-stat-pill"><span>Submitted</span><strong>{submittedCount}/{activeMilestone.deliverables.length}</strong></div>
            <div className="wr-stat-pill"><span>Evidence</span><strong>{evidenceCount}/{activeMilestone.deliverables.length}</strong></div>
            <div className="wr-stat-pill wr-stat-green"><span>Approved</span><strong>{approvedCount}</strong></div>
            <div className="wr-stat-pill wr-stat-red"><span>Rework</span><strong>{needsReworkCount}</strong></div>
          </div>
          <Button size="sm" variant="secondary" onClick={resetView}>Reset</Button>
        </div>
      </div>

      <div className="wr-seg-nav">
        {milestones.map((milestone) => {
          const isActive = activeMilestoneId === milestone.id
          const complete = milestone.deliverables.every((d) => d.progressStatus === 'Complete')
          return (
            <button
              key={milestone.id}
              type="button"
              className={`wr-seg-nav-btn${isActive ? ' active' : ''}${!milestone.unlocked ? ' locked' : ''}`}
              onClick={() => setActiveMilestoneId(milestone.id)}
            >
              {milestone.stage}
              {!milestone.unlocked && <span className="wr-seg-lock">Locked</span>}
              {complete && milestone.unlocked && <span className="wr-seg-done">Done</span>}
            </button>
          )
        })}
        {!isMentor && (
          <button type="button" className="wr-seg-nav-btn wr-seg-add" onClick={() => setShowCreateMilestone(true)}>
            + New milestone
          </button>
        )}
      </div>

      {activeMilestone && (
        <>
          <div className="wr-milestone-bar">
            <div className="wr-milestone-bar-left">
              <strong>{activeMilestone.stage}</strong>
              <Badge status={activeMilestone.gateDecision} />
              <span className="text-muted sm">
                {activeMilestone.deliverables.filter((d) => d.progressStatus === 'Complete').length}/{activeMilestone.deliverables.length} deliverables complete
              </span>
            </div>
            {!isMentor && (
              <div className="wr-milestone-bar-actions">
                <button type="button" className="wr-text-btn" onClick={() => toggleMilestoneLock(activeMilestone.id)}>
                  {activeMilestone.unlocked ? 'Lock stage' : 'Unlock stage'}
                </button>
                {nextMilestone && (
                  <Button size="sm" variant="secondary" onClick={unlockNextMilestone} disabled={nextMilestone.unlocked}>
                    {nextMilestone.unlocked ? `${nextMilestone.stage} open` : `Unlock ${nextMilestone.stage}`}
                  </Button>
                )}
                <button
                  type="button"
                  className="wr-text-btn wr-text-btn-danger"
                  onClick={() => deleteMilestone(activeMilestone.id)}
                  disabled={milestones.length <= 1}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="wr-workspace wr-workspace-v2">
            <div className="wr-workspace-main">

              <Card className="section-card wr-panel wr-panel-list">
                <div className="wr-list-head">
                  <span>Deliverables</span>
                  <Badge status={activeMilestone.deliverables.every((d) => d.progressStatus === 'Complete') ? 'Complete' : 'In Progress'} />
                </div>
                <div className="wr-flat-list">
                  {activeMilestone.deliverables.map((item) => {
                    const review = isMentor ? item.mentorReview : item.managerReview
                    const comment = isMentor ? item.mentorComment : item.managerComment
                    const hasSubmission = item.submittedAt !== 'Not submitted'
                    const hasResponse = comment.trim() !== '' || review !== 'Pending Review'
                    return (
                      <div
                        key={item.id}
                        className={`wr-list-row${review === 'Approved' ? ' wr-row-approved' : review === 'Needs Rework' ? ' wr-row-rework' : ''}`}
                      >
                        <div className="wr-list-main">
                          <div className="wr-list-title">
                            <strong>{item.title}</strong>
                            <Badge status={item.progressStatus} />
                            {hasResponse && <Badge status={review} />}
                          </div>
                          <p className="wr-list-meta">
                            {item.deadline && <>Deadline {item.deadline} · </>}
                            {hasSubmission ? (
                              <>
                                Submitted {item.submittedAt}
                                {item.evidenceUploaded && ' · Evidence attached'}
                                {item.attachments[0] && ` · ${item.attachments[0]}`}
                                {item.link && (
                                  <>
                                    {' · '}
                                    <a className="wr-inline-link" href={item.link} target="_blank" rel="noreferrer">View link</a>
                                  </>
                                )}
                              </>
                            ) : (
                              'Not yet submitted'
                            )}
                          </p>
                          {hasResponse && (
                            <p className="wr-list-sub">
                              {comment || copy.feedbackEmpty}
                            </p>
                          )}
                        </div>
                        <div className="wr-list-actions">
                          <Button size="sm" variant="secondary" onClick={() => openCommentModal(item)}>
                            {hasResponse ? copy.deliverableEditReview : copy.deliverableReview}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card className="section-card wr-panel">
                <div className="section-header wr-section-min">
                  <h3>Committed vs actual</h3>
                </div>
                <div className="wr-commit-list">
                  {activeMilestone.commitments.map((row) => (
                    <div key={row.id} className="wr-commit-row">
                      <span className="wr-commit-name">{row.deliverable}</span>
                      <span className="wr-commit-nums">{row.actual} / {row.target}</span>
                      <Badge status={getStatus(row.target, row.actual)} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="section-card wr-panel">
                <div className="section-header wr-section-min">
                  <h3>Tasks</h3>
                  <span className="text-muted sm">
                    {(activeMilestone.tasks || []).filter((t) => t.done).length}/{(activeMilestone.tasks || []).length} done
                  </span>
                </div>
                <div className="wr-task-add-row">
                  <input
                    className="form-input"
                    placeholder="Add a task for this milestone…"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Button size="sm" onClick={addTask} disabled={!newTaskText.trim()}>Add task</Button>
                </div>
                {(activeMilestone.tasks || []).length === 0 ? (
                  <div className="wr-empty">
                    <p>No tasks yet. Add one above to track milestone work.</p>
                  </div>
                ) : (
                  <ul className="wr-task-list wr-task-list-min">
                    {(activeMilestone.tasks || []).map((task) => (
                      <li key={task.id} className={`wr-task-item wr-task-row${task.done ? ' done' : ''}`}>
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
                              <button type="button" className="wr-text-btn" onClick={() => saveEditTask(task.id)}>Save</button>
                              <button type="button" className="wr-text-btn" onClick={() => setEditingTaskId(null)}>Cancel</button>
                            </>
                          ) : (
                            <button type="button" className="wr-text-btn" onClick={() => startEditTask(task)}>Edit</button>
                          )}
                          <button type="button" className="wr-text-btn wr-text-btn-danger" onClick={() => deleteTask(task.id)}>Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="wr-workspace-side">
              <Card className="section-card wr-panel wr-side-panel">
                <h4 className="wr-side-heading">{copy.gateDecision}</h4>
                <select
                  className="form-input form-select"
                  value={activeMilestone.gateDecision}
                  onChange={(e) => setGateDecision(e.target.value)}
                >
                  {isMentor ? (
                    <>
                      <option value="Pending Review">Pending Review</option>
                      <option value="On Track">On Track</option>
                      <option value="Needs Support">Needs Support</option>
                      <option value="Recommend Hold">Recommend Hold</option>
                    </>
                  ) : (
                    <>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Approved to Progress">Approved to Progress</option>
                      <option value="Hold">Hold</option>
                      <option value="Needs Rework">Needs Rework</option>
                    </>
                  )}
                </select>

                <h4 className="wr-side-heading">{copy.summary}</h4>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={summaryValue}
                  onChange={(e) => setSummaryValue(e.target.value)}
                  placeholder={copy.summaryPlaceholder}
                />

                <h4 className="wr-side-heading">{copy.plan}</h4>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={activeMilestone.interventionPlan}
                  onChange={(e) => setInterventionPlan(e.target.value)}
                  placeholder={copy.planPlaceholder}
                />
              </Card>

              <Card className="section-card wr-panel wr-side-panel">
                <h4 className="wr-side-heading">{copy.blockers}</h4>
                <div className="wr-note-list">
                  {blockers.map((item) => (
                    <div key={item.id} className={`wr-note-item${item.severity === 'High' ? ' wr-note-high' : ''}`}>
                      <p>{item.text}</p>
                      <span>{item.owner}</span>
                    </div>
                  ))}
                </div>
                <div className="wr-inline-add">
                  <input className="form-input" value={blockerInput} onChange={(e) => setBlockerInput(e.target.value)} placeholder={copy.blockerPlaceholder} onKeyDown={(e) => e.key === 'Enter' && addBlocker()} />
                  <Button size="sm" variant="secondary" onClick={addBlocker}>Add</Button>
                </div>
              </Card>

              <Card className="section-card wr-panel wr-side-panel">
                <h4 className="wr-side-heading">{copy.suggestionsTitle}</h4>
                {mentorSuggestions.length === 0 ? (
                  <p className="text-muted sm wr-side-empty">{copy.suggestionsEmpty}</p>
                ) : (
                  <div className="wr-note-list">
                    {mentorSuggestions.map((item) => (
                      <div key={item.id} className="wr-note-item wr-note-mentor"><p>{item.text}</p></div>
                    ))}
                  </div>
                )}
                <div className="wr-inline-add">
                  <input className="form-input" value={mentorSuggestionInput} onChange={(e) => setMentorSuggestionInput(e.target.value)} placeholder={copy.suggestionsPlaceholder} onKeyDown={(e) => e.key === 'Enter' && addMentorSuggestion()} />
                  <Button size="sm" onClick={addMentorSuggestion}>Add</Button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
      </div>
    </DashboardLayout>
  )
}

