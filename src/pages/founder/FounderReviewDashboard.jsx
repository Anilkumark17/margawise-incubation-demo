import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, Badge } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { collectStartupReviews, ensureReportMilestones } from '../../data/reportMilestones'

const REVIEW_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Incubation Manager', label: 'Incubation Manager' },
  { id: 'Mentor', label: 'Mentor' },
]

function getDecisionTone(decision) {
  if (decision === 'Approved') return 'approved'
  if (decision === 'Needs Rework') return 'rework'
  return 'neutral'
}

function formatReviewDate(date) {
  if (!date || date === 'Not submitted') return null
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function FounderReviewDashboard() {
  const { getCurrentStartup } = useApp()
  const [filter, setFilter] = useState('all')
  const startup = getCurrentStartup()

  const reviews = useMemo(() => {
    if (!startup) return []
    return collectStartupReviews(ensureReportMilestones(startup))
  }, [startup])

  const filtered = useMemo(
    () => (filter === 'all' ? reviews : reviews.filter((r) => r.role === filter)),
    [reviews, filter]
  )

  const counts = useMemo(
    () => ({
      all: reviews.length,
      manager: reviews.filter((r) => r.role === 'Incubation Manager').length,
      mentor: reviews.filter((r) => r.role === 'Mentor').length,
      approved: reviews.filter((r) => r.decision === 'Approved').length,
      rework: reviews.filter((r) => r.decision === 'Needs Rework').length,
    }),
    [reviews]
  )

  if (!startup) return null

  return (
    <DashboardLayout role="founder">
      <div className="fr-page">
        <header className="fr-head">
          <div>
            <h1 className="fr-title">Reviews</h1>
            <p className="fr-subtitle">
              {startup.name} · feedback from mentors and incubation managers
            </p>
          </div>
          <div className="fr-stats">
            <div className="wr-stat-pill"><span>Total</span><strong>{counts.all}</strong></div>
            <div className="wr-stat-pill wr-stat-green"><span>Approved</span><strong>{counts.approved}</strong></div>
            <div className="wr-stat-pill wr-stat-red"><span>Rework</span><strong>{counts.rework}</strong></div>
          </div>
        </header>

        <nav className="wr-seg-nav fr-filters" aria-label="Review filters">
          {REVIEW_FILTERS.map(({ id, label }) => {
            const count = id === 'all' ? counts.all : id === 'Mentor' ? counts.mentor : counts.manager
            return (
              <button
                key={id}
                type="button"
                className={`wr-seg-nav-btn${filter === id ? ' active' : ''}`}
                onClick={() => setFilter(id)}
              >
                {label}
                <span className="fr-filter-count">{count}</span>
              </button>
            )
          })}
        </nav>

        {filtered.length === 0 ? (
          <Card className="section-card fr-empty">
            <div className="fr-empty-inner">
              <p className="fr-empty-title">No reviews yet</p>
              <p className="text-muted sm">
                Submit deliverables in Target Manager to receive mentor and manager feedback.
              </p>
              <Link to="/founder/dashboard" className="fr-empty-link">Go to Dashboard →</Link>
            </div>
          </Card>
        ) : (
          <Card className="section-card fr-panel">
            <div className="fr-list-head">
              <span>{filtered.length} review{filtered.length === 1 ? '' : 's'}</span>
              <span className="text-muted sm">Newest first</span>
            </div>
            <div className="fr-list">
              {filtered.map((review) => {
                const tone = getDecisionTone(review.decision)
                const formattedDate = formatReviewDate(review.date)
                return (
                  <article key={review.id} className={`fr-row fr-row-${tone}`}>
                    <div className="fr-row-main">
                      <div className="fr-row-top">
                        <div className="fr-row-identity">
                          <span className={`fr-role-chip fr-role-${review.role === 'Mentor' ? 'mentor' : 'manager'}`}>
                            {review.role === 'Mentor' ? 'M' : 'IM'}
                          </span>
                          <div>
                            <h3 className="fr-row-title">{review.deliverable}</h3>
                            <p className="fr-row-meta">
                              {review.milestone} · {review.kind}
                            </p>
                          </div>
                        </div>
                        <div className="fr-row-badges">
                          <Badge status={review.decision} />
                        </div>
                      </div>
                      <blockquote className="fr-row-quote">
                        {review.comment?.trim() || 'No written feedback provided.'}
                      </blockquote>
                      <footer className="fr-row-foot">
                        <span>{review.role}</span>
                        {formattedDate && <time dateTime={review.date}>{formattedDate}</time>}
                      </footer>
                    </div>
                  </article>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
