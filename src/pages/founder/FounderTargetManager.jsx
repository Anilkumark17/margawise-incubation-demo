import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Badge, Button } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { ensureReportMilestones, getDeadlineStatus } from '../../data/reportMilestones'

const STATUS_FILTERS = [
  { id: 'all', label: 'All Targets' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'due-soon', label: 'Due Soon' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'pending', label: 'Not Submitted' },
]

export default function FounderTargetManager() {
  const { getCurrentStartup, submitDeliverableLink, updateDeliverableDeadline } = useApp()
  const startup = getCurrentStartup()
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeMilestoneId, setActiveMilestoneId] = useState('milestone-validation')
  const [submitModal, setSubmitModal] = useState(null)
  const [linkInput, setLinkInput] = useState('')

  const milestones = useMemo(
    () => (startup ? ensureReportMilestones(startup) : []),
    [startup]
  )

  const activeMilestone = milestones.find((m) => m.id === activeMilestoneId) || milestones[0]

  const flatTargets = useMemo(() => {
    return milestones.flatMap((milestone) =>
      milestone.deliverables.map((item) => ({
        ...item,
        milestoneId: milestone.id,
        milestoneStage: milestone.stage,
        deadlineStatus: getDeadlineStatus(item.deadline),
        isSubmitted: item.submittedAt !== 'Not submitted',
      }))
    )
  }, [milestones])

  const filteredTargets = useMemo(() => {
    return flatTargets.filter((item) => {
      if (statusFilter === 'overdue') return item.deadlineStatus === 'Overdue'
      if (statusFilter === 'due-soon') return item.deadlineStatus === 'Due soon'
      if (statusFilter === 'submitted') return item.isSubmitted
      if (statusFilter === 'pending') return !item.isSubmitted
      return true
    })
  }, [flatTargets, statusFilter])

  const activeDeliverables = useMemo(() => {
    if (!activeMilestone) return []
    return activeMilestone.deliverables.map((item) => ({
      ...item,
      deadlineStatus: getDeadlineStatus(item.deadline),
      isSubmitted: item.submittedAt !== 'Not submitted',
    }))
  }, [activeMilestone])

  const counts = useMemo(
    () => ({
      all: flatTargets.length,
      overdue: flatTargets.filter((t) => t.deadlineStatus === 'Overdue').length,
      dueSoon: flatTargets.filter((t) => t.deadlineStatus === 'Due soon').length,
      submitted: flatTargets.filter((t) => t.isSubmitted).length,
      pending: flatTargets.filter((t) => !t.isSubmitted).length,
    }),
    [flatTargets]
  )

  const openSubmit = (item) => {
    setSubmitModal(item)
    setLinkInput(item.link || '')
  }

  const handleSubmit = () => {
    if (!submitModal || !startup) return
    const link = linkInput.trim()
    if (!link) return
    submitDeliverableLink(startup.id, submitModal.milestoneId, submitModal.id, link)
    setSubmitModal(null)
    setLinkInput('')
  }

  const handleDeadlineChange = (milestoneId, deliverableId, deadline) => {
    if (!startup) return
    updateDeliverableDeadline(startup.id, milestoneId, deliverableId, deadline)
  }

  if (!startup) return null

  return (
    <DashboardLayout role="founder">
      {submitModal && (
        <div className="wr-modal-overlay" onClick={() => setSubmitModal(null)}>
          <div className="wr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wr-modal-header">
              <div>
                <p className="wr-modal-eyebrow">Submit Deliverable</p>
                <h3>{submitModal.title}</h3>
              </div>
              <button type="button" className="wr-modal-close" onClick={() => setSubmitModal(null)}>✕</button>
            </div>
            <div className="wr-modal-body">
              <label className="form-label">Deliverable link</label>
              <input
                className="form-input"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://docs.google.com/… or Figma, Notion, etc."
                autoFocus
              />
              <p className="text-muted sm">Paste a link to your doc, deck, demo, or evidence folder.</p>
            </div>
            <div className="wr-modal-footer">
              <Button variant="secondary" onClick={() => setSubmitModal(null)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!linkInput.trim()}>Submit Deliverable</Button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title="Target Manager"
        subtitle="Track deliverable deadlines and submit work for mentor and manager review"
      />

      <div className="fm-mentor-stats">
        <div className="wr-stat-pill wr-stat-red"><span>Overdue</span><strong>{counts.overdue}</strong></div>
        <div className="wr-stat-pill"><span>Due soon</span><strong>{counts.dueSoon}</strong></div>
        <div className="wr-stat-pill wr-stat-green"><span>Submitted</span><strong>{counts.submitted}</strong></div>
        <div className="wr-stat-pill"><span>Pending</span><strong>{counts.pending}</strong></div>
      </div>

      <div className="filter-bar fm-type-filters">
        {STATUS_FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={statusFilter === id ? 'active' : ''}
            onClick={() => setStatusFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="wr-seg-nav fd-target-nav">
        {milestones.map((milestone) => (
          <button
            key={milestone.id}
            type="button"
            className={`wr-seg-nav-btn${activeMilestoneId === milestone.id ? ' active' : ''}${!milestone.unlocked ? ' locked' : ''}`}
            onClick={() => setActiveMilestoneId(milestone.id)}
          >
            {milestone.stage}
            {!milestone.unlocked && <span className="wr-seg-lock">Locked</span>}
          </button>
        ))}
      </div>

      <Card className="section-card fd-target-panel">
        <div className="section-header">
          <h3>{activeMilestone?.stage} deliverables</h3>
          <span className="text-muted sm">{filteredTargets.length} targets in current filter</span>
        </div>

        {activeDeliverables.length === 0 ? (
          <p className="text-muted empty-hint">No deliverables for this milestone.</p>
        ) : (
          <div className="fd-target-list">
            {activeDeliverables
              .filter((item) => {
                if (statusFilter === 'all') return true
                if (statusFilter === 'overdue') return item.deadlineStatus === 'Overdue'
                if (statusFilter === 'due-soon') return item.deadlineStatus === 'Due soon'
                if (statusFilter === 'submitted') return item.isSubmitted
                if (statusFilter === 'pending') return !item.isSubmitted
                return true
              })
              .map((item) => (
                <div
                  key={item.id}
                  className={`fd-target-row${item.deadlineStatus === 'Overdue' ? ' fd-target-overdue' : ''}${item.isSubmitted ? ' fd-target-submitted' : ''}`}
                >
                  <div className="fd-target-main">
                    <div className="fd-target-title-row">
                      <strong>{item.title}</strong>
                      <Badge status={item.progressStatus} />
                      <Badge status={item.deadlineStatus} />
                    </div>
                    <div className="fd-target-meta">
                      <label className="form-label fd-deadline-label">Deadline</label>
                      <input
                        type="date"
                        className="form-input fd-deadline-input"
                        value={item.deadline || ''}
                        onChange={(e) =>
                          handleDeadlineChange(activeMilestone.id, item.id, e.target.value)
                        }
                      />
                    </div>
                    {item.isSubmitted && (
                      <p className="fd-target-submission text-muted sm">
                        Submitted {item.submittedAt}
                        {item.link && (
                          <>
                            {' · '}
                            <a className="wr-inline-link" href={item.link} target="_blank" rel="noreferrer">
                              View submission
                            </a>
                          </>
                        )}
                      </p>
                    )}
                    {(item.managerReview !== 'Pending Review' || item.mentorReview !== 'Pending Review') && (
                      <div className="fd-target-reviews">
                        {item.managerReview !== 'Pending Review' && (
                          <span className="text-muted sm">Manager: <Badge status={item.managerReview} /></span>
                        )}
                        {item.mentorReview !== 'Pending Review' && (
                          <span className="text-muted sm">Mentor: <Badge status={item.mentorReview} /></span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="fd-target-actions">
                    <Button
                      size="sm"
                      onClick={() =>
                        openSubmit({ ...item, milestoneId: activeMilestone.id })
                      }
                    >
                      {item.isSubmitted ? 'Update Link' : 'Submit Link'}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}
