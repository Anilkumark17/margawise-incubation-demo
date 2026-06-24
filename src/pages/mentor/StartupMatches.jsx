import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Button, Card, MetricCard, PageHeader } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

function splitTerms(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)
}

function computeMatch(mentor, startup) {
  const mentorExpertiseTags = (mentor.expertise || []).map((t) => t.toLowerCase())
  const mentorDomainTerms = splitTerms(mentor.industryExpertise)
  const mentorExpertiseTerms = splitTerms((mentor.expertise || []).join(' '))
  const startupIndustryTerms = splitTerms(startup.industry)
  const startupAllTerms = splitTerms(
    `${startup.industry} ${startup.description || ''} ${startup.stage} ${startup.name}`
  )

  // Domain overlap: startup industry tokens vs mentor domain tokens
  const sharedDomain = [...new Set(startupIndustryTerms.filter((t) => mentorDomainTerms.includes(t)))]
  // Expertise overlap: startup text vs mentor expertise tokens
  const sharedExpertise = [...new Set(startupAllTerms.filter((t) => mentorExpertiseTerms.includes(t) && t.length > 3))]

  // Start from 0 — only score based on real overlap
  let score = 0
  score += sharedDomain.length * 22        // domain match is strong
  score += sharedExpertise.length * 12      // skill/text overlap

  // Stage-specific bonuses
  if (startup.stage === 'Validation' && mentorExpertiseTags.includes('startup validation')) score += 12
  if (startup.stage === 'MVP' && mentorExpertiseTags.includes('product management')) score += 10
  if (startup.stage === 'GTM' && (mentorExpertiseTags.includes('gtm') || mentorExpertiseTags.includes('marketing'))) score += 12
  if (startup.stage === 'Validation' && mentorExpertiseTags.includes('product management')) score += 6

  // Seniority bonus (capped at 12)
  score += Math.min(12, mentor.yearsExperience || 0)

  score = Math.min(100, Math.round(score))

  const reasons = []
  if (sharedDomain.length) reasons.push(`Domain: ${sharedDomain.slice(0, 2).join(', ')}`)
  if (sharedExpertise.length) reasons.push(`Skill overlap: ${sharedExpertise.slice(0, 2).join(', ')}`)

  // Stage match reasons
  if (startup.stage === 'Validation' && mentorExpertiseTags.includes('startup validation')) reasons.push('Startup Validation expert')
  if (startup.stage === 'GTM' && mentorExpertiseTags.includes('gtm')) reasons.push('GTM stage fit')
  if (startup.stage === 'MVP' && mentorExpertiseTags.includes('product management')) reasons.push('Product Management fit')

  return { score, reasons: [...new Set(reasons)] }
}

function InterestedStartupCard({ startup, fit, onAccept, onRemove, hasAvailability, isAccepted }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="ms-icard">
      <div className="ms-icard-header">
        <div className="ms-icard-title">
          <div className="ms-icard-name-row">
            <strong>{startup.name}</strong>
            <Badge status={`${fit?.score ?? '—'}% fit`} />
            {isAccepted && <Badge status="Accepted" />}
          </div>
          <p className="ms-icard-meta">
            {startup.founderName} · {startup.industry} · {startup.stage}
          </p>
        </div>
        <button
          type="button"
          className="ms-icard-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse application' : 'View application'}
        >
          {expanded ? '▲ Hide' : '▼ Application'}
        </button>
      </div>

      {expanded && (
        <div className="ms-icard-body">
          {startup.description && (
            <div className="ms-icard-field">
              <span className="ms-icard-label">Problem Statement</span>
              <p>{startup.description}</p>
            </div>
          )}
          <div className="ms-icard-grid">
            <div className="ms-icard-field">
              <span className="ms-icard-label">Industry</span>
              <span>{startup.industry || '—'}</span>
            </div>
            <div className="ms-icard-field">
              <span className="ms-icard-label">Stage</span>
              <Badge status={startup.stage} />
            </div>
            <div className="ms-icard-field">
              <span className="ms-icard-label">Cohort</span>
              <span>{startup.cohort || '—'}</span>
            </div>
            <div className="ms-icard-field">
              <span className="ms-icard-label">Mentor Sessions</span>
              <span>{startup.mentorSessions ?? 0}</span>
            </div>
          </div>
          {fit?.reasons?.length > 0 && (
            <div className="ms-icard-field">
              <span className="ms-icard-label">Why matched</span>
              <div className="ms-icard-pills">
                {fit.reasons.map((r) => (
                  <span key={r} className="mentor-match-pill">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isAccepted && (
        <div className="ms-icard-actions">
          <Button
            size="sm"
            onClick={() => onAccept(startup.id)}
            disabled={!hasAvailability}
          >
            Accept
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onRemove(startup.id)}>
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}

export default function StartupMatches() {
  const { getCurrentMentor, data, setMentorStartupInterest, clearMentorStartupInterest } = useApp()
  const navigate = useNavigate()
  const mentor = getCurrentMentor()

  const [stageFilter, setStageFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [dragX, setDragX] = useState(0)
  const [dragStartX, setDragStartX] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState(null)
  const [cardExpanded, setCardExpanded] = useState(false)

  const mentorActions = useMemo(
    () => (data.mentorStartupActions || []).filter((a) => a.mentorId === mentor?.id),
    [data.mentorStartupActions, mentor?.id]
  )
  const actionsByStartup = useMemo(
    () => Object.fromEntries(mentorActions.map((a) => [a.startupId, a])),
    [mentorActions]
  )

  const stages = useMemo(
    () => ['All', ...new Set((data.startups || []).map((s) => s.stage).filter(Boolean))],
    [data.startups]
  )

  const filteredStartups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return (data.startups || []).filter((s) => {
      const stageOk = stageFilter === 'All' || s.stage === stageFilter
      const queryOk = !q || s.name.toLowerCase().includes(q) || (s.founderName || '').toLowerCase().includes(q) || (s.industry || '').toLowerCase().includes(q)
      return stageOk && queryOk
    })
  }, [data.startups, searchQuery, stageFilter])

  const MIN_MATCH_SCORE = 20 // Only show startups with meaningful expertise overlap

  const sortedMatches = useMemo(() => {
    if (!mentor) return []
    const scored = filteredStartups
      .map((startup) => ({ startup, fit: computeMatch(mentor, startup) }))
      .filter((item) => item.fit.score >= MIN_MATCH_SCORE)
      .sort((a, b) => b.fit.score - a.fit.score)

    // If mentor profile has no expertise set yet, show all (capped at 10) so the page isn't empty
    if (scored.length === 0 && !(mentor.expertise?.length || mentor.industryExpertise)) {
      return filteredStartups
        .slice(0, 10)
        .map((startup) => ({ startup, fit: { score: 0, reasons: ['Complete your profile to see match reasons'] } }))
    }
    return scored
  }, [filteredStartups, mentor])

  const undecidedMatches = useMemo(
    () => sortedMatches.filter((item) => {
      const action = actionsByStartup[item.startup.id]
      return !action
    }),
    [sortedMatches, actionsByStartup]
  )

  const interestedMatches = useMemo(
    () => mentorActions
      .filter((a) => a.decision === 'interested')
      .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt)),
    [mentorActions]
  )
  const acceptedMatches = useMemo(
    () => mentorActions
      .filter((a) => a.decision === 'accepted')
      .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt)),
    [mentorActions]
  )
  const passedCount = mentorActions.filter((a) => a.decision === 'pass').length

  const cardStack = undecidedMatches.slice(0, 3)
  const current = undecidedMatches[0] || null
  const deckDone = sortedMatches.length - undecidedMatches.length
  const deckProgress = sortedMatches.length ? Math.round((deckDone / sortedMatches.length) * 100) : 0
  const lastAction = mentorActions.length
    ? [...mentorActions].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0]
    : null
  const hasAvailability = (mentor?.availability || []).length > 0

  useEffect(() => {
    setDragX(0); setDragStartX(null); setIsDragging(false); setExitDirection(null); setCardExpanded(false)
  }, [current?.startup.id])

  const decideCurrent = useCallback(
    (decision) => {
      if (!current || !mentor) return
      setMentorStartupInterest(mentor.id, current.startup.id, decision)
    },
    [current, mentor, setMentorStartupInterest]
  )

  useEffect(() => {
    const onKey = (e) => {
      if (!current) return
      if (e.key === 'ArrowLeft') decideCurrent('pass')
      if (e.key === 'ArrowRight') decideCurrent('interested')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, decideCurrent])

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragStartX(e.clientX)
    setIsDragging(true)
  }
  const handlePointerMove = (e) => {
    if (!isDragging || dragStartX == null) return
    setDragX(e.clientX - dragStartX)
  }
  const handlePointerUp = (e) => {
    if (!isDragging) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (_) {}
    setIsDragging(false)
    setDragStartX(null)
    if (dragX > 100) {
      setExitDirection('right')
      setTimeout(() => decideCurrent('interested'), 200)
      return
    }
    if (dragX < -100) {
      setExitDirection('left')
      setTimeout(() => decideCurrent('pass'), 200)
      return
    }
    setDragX(0)
  }
  const handlePointerCancel = () => {
    setIsDragging(false)
    setDragStartX(null)
    setDragX(0)
  }

  const cardStyle = exitDirection === 'right'
    ? { transform: 'translateX(110%) rotate(22deg)', opacity: 0, transition: 'transform 260ms cubic-bezier(0.4,0,0.2,1), opacity 240ms ease' }
    : exitDirection === 'left'
      ? { transform: 'translateX(-110%) rotate(-22deg)', opacity: 0, transition: 'transform 260ms cubic-bezier(0.4,0,0.2,1), opacity 240ms ease' }
      : {
          transform: `translateX(${dragX}px) rotate(${dragX * 0.035}deg)`,
          transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
        }

  if (!mentor) return null

  return (
    <DashboardLayout role="mentor">
      <PageHeader
        title="Startup Match Studio"
        subtitle="Swipe to shortlist startups — review applications and accept based on your availability"
        action={
          <Button variant="secondary" onClick={() => navigate('/mentor/dashboard?show=matches')}>
            Show in Dashboard
          </Button>
        }
      />

      {/* ── Stats ── */}
      <div className="metrics-row">
        <MetricCard label="Expertise Matches" value={sortedMatches.length} accent />
        <MetricCard label="To Review" value={undecidedMatches.length} accent />
        <MetricCard label="Shortlisted" value={interestedMatches.length} accent />
        <MetricCard label="Accepted" value={acceptedMatches.length} accent />
        <MetricCard label="Passed" value={passedCount} accent />
      </div>

      {/* ── Main two-column layout ── */}
      <div className="ms-layout">

        {/* LEFT — Swipe deck */}
        <div className="ms-deck-col">
          <Card className="section-card ms-deck-card">
            <div className="section-header">
              <div>
                <h3>Match Deck</h3>
                <p className="text-muted sm">Swipe or use buttons · Arrow keys supported</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => { if (mentor && lastAction) clearMentorStartupInterest(mentor.id, lastAction.startupId) }} disabled={!lastAction}>
                Undo
              </Button>
            </div>

            {/* Filters */}
            <div className="ms-toolbar">
              <input
                className="form-input"
                placeholder="Search startup, founder, domain…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="form-input form-select"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                {stages.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Progress bar */}
            <div className="ms-progress-bar">
              <div className="ms-progress-fill" style={{ width: `${deckProgress}%` }} />
            </div>
            <div className="ms-progress-label">
              <span className="text-muted sm">{deckDone} reviewed</span>
              <span className="text-muted sm">{sortedMatches.length - deckDone} remaining</span>
            </div>

            {/* Deck count */}
            {sortedMatches.length > 0 && (
              <div className="ms-deck-count">
                <span className="ms-deck-count-num">{undecidedMatches.length}</span>
                <span className="text-muted sm"> of {sortedMatches.length} matched startups in queue</span>
              </div>
            )}

            {/* Card stack */}
            {!current ? (
              <div className="ms-empty-deck">
                {sortedMatches.length === 0 ? (
                  <>
                    <div className="ms-empty-icon">🎯</div>
                    <p className="text-muted">No startups match your expertise yet.</p>
                    <p className="text-muted sm">Update your profile with your domain and skills to see relevant matches.</p>
                    <Button size="sm" variant="secondary" onClick={() => navigate('/mentor/profile')}>
                      Update Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="ms-empty-icon">✅</div>
                    <p className="text-muted">All {sortedMatches.length} matched startups reviewed.</p>
                    <p className="text-muted sm">Check your Interested panel to accept startups.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="ms-stack-wrap">
                <div className="ms-stack-tray">
                <div className="ms-stack">
                  {cardStack.map((item, idx) => {
                    const isTop = idx === 0
                    return (
                      <div
                        key={item.startup.id}
                        className={`ms-card ${isTop ? 'ms-card-top' : `ms-card-back-${idx}`}`}
                        style={isTop ? cardStyle : undefined}
                        onPointerDown={isTop ? handlePointerDown : undefined}
                        onPointerMove={isTop ? handlePointerMove : undefined}
                        onPointerUp={isTop ? handlePointerUp : undefined}
                        onPointerCancel={isTop ? handlePointerCancel : undefined}
                      >
                        {isTop && (
                          <>
                            <span className={`ms-stamp ms-stamp-pass${dragX < -35 ? ' show' : ''}`}>PASS</span>
                            <span className={`ms-stamp ms-stamp-like${dragX > 35 ? ' show' : ''}`}>INTERESTED</span>
                          </>
                        )}

                        {/* Card header */}
                        <div className="ms-card-head">
                          <div>
                            <h2 className="ms-card-name">{item.startup.name}</h2>
                            <p className="text-muted sm">{item.startup.founderName} · {item.startup.stage}</p>
                          </div>
                          <span className="ms-fit-badge">{item.fit.score}% fit</span>
                        </div>

                        {/* Industry + Stage row */}
                        <div className="ms-card-two-col">
                          <div className="ms-card-row">
                            <span className="ms-card-row-label">Industry</span>
                            <span>{item.startup.industry || '—'}</span>
                          </div>
                          <div className="ms-card-row">
                            <span className="ms-card-row-label">Stage</span>
                            <Badge status={item.startup.stage} />
                          </div>
                        </div>

                        {/* Problem statement — always visible */}
                        <div className="ms-card-block">
                          <span className="ms-card-row-label">Problem Statement</span>
                          <p className="ms-card-desc">{item.startup.description || 'No description available.'}</p>
                        </div>

                        {/* Match reasons */}
                        {item.fit.reasons.length > 0 && (
                          <div className="ms-card-pills">
                            {item.fit.reasons.map((r) => (
                              <span key={r} className="mentor-match-pill">{r}</span>
                            ))}
                          </div>
                        )}

                        {/* View Application toggle — only on top card */}
                        {isTop && (
                          <button
                            type="button"
                            className="ms-card-app-toggle"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setCardExpanded((v) => !v) }}
                          >
                            {cardExpanded ? '▲ Hide Application' : '▼ View Full Application'}
                          </button>
                        )}

                        {/* Expanded application details */}
                        {isTop && cardExpanded && (
                          <div className="ms-card-app-body">
                            <div className="ms-card-app-grid">
                              <div className="ms-card-app-field">
                                <span className="ms-card-row-label">Cohort</span>
                                <span>{item.startup.cohort || '—'}</span>
                              </div>
                              <div className="ms-card-app-field">
                                <span className="ms-card-row-label">Mentor Sessions</span>
                                <span>{item.startup.mentorSessions ?? 0}</span>
                              </div>
                              <div className="ms-card-app-field">
                                <span className="ms-card-row-label">Founded</span>
                                <span>{item.startup.founded || '—'}</span>
                              </div>
                              <div className="ms-card-app-field">
                                <span className="ms-card-row-label">Team Size</span>
                                <span>{item.startup.teamSize || '—'}</span>
                              </div>
                            </div>
                            {item.startup.solution && (
                              <div className="ms-card-app-section">
                                <span className="ms-card-row-label">Solution</span>
                                <p className="ms-card-desc">{item.startup.solution}</p>
                              </div>
                            )}
                            {item.startup.targetMarket && (
                              <div className="ms-card-app-section">
                                <span className="ms-card-row-label">Target Market</span>
                                <p className="ms-card-desc">{item.startup.targetMarket}</p>
                              </div>
                            )}
                            {item.startup.traction && (
                              <div className="ms-card-app-section">
                                <span className="ms-card-row-label">Traction</span>
                                <p className="ms-card-desc">{item.startup.traction}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                </div>{/* end ms-stack-tray */}

                {/* Action buttons */}
                <div className="ms-actions">
                  <button type="button" className="ms-btn-pass" onClick={() => decideCurrent('pass')}>
                    ✕ Pass
                  </button>
                  <button type="button" className="ms-btn-interest" onClick={() => decideCurrent('interested')}>
                    ♥ Interested
                  </button>
                </div>
                <p className="text-muted sm ms-tip">Drag the card · or use ← → arrow keys</p>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT — Interested + Accepted */}
        <div className="ms-panel-col">

          {/* Availability alert */}
          {!hasAvailability && (
            <div className="ms-avail-alert">
              <strong>Set your availability to accept startups</strong>
              <Button size="sm" variant="secondary" onClick={() => navigate('/mentor/availability')}>
                Set Availability
              </Button>
            </div>
          )}

          {/* Interested */}
          <Card className="section-card ms-panel-card">
            <div className="section-header">
              <h3>Interested Startups</h3>
              <span className="text-muted sm">{interestedMatches.length} shortlisted</span>
            </div>

            {interestedMatches.length === 0 ? (
              <p className="text-muted sm ms-panel-empty">Startups you swipe right will appear here for review.</p>
            ) : (
              <div className="ms-icard-list">
                {interestedMatches.map((action) => {
                  const startup = data.startups.find((s) => s.id === action.startupId)
                  if (!startup) return null
                  const match = sortedMatches.find((m) => m.startup.id === startup.id)
                  return (
                    <InterestedStartupCard
                      key={action.startupId}
                      startup={startup}
                      fit={match?.fit}
                      hasAvailability={hasAvailability}
                      isAccepted={false}
                      onAccept={(id) => setMentorStartupInterest(mentor.id, id, 'accepted')}
                      onRemove={(id) => clearMentorStartupInterest(mentor.id, id)}
                    />
                  )
                })}
              </div>
            )}
          </Card>

          {/* Accepted */}
          {acceptedMatches.length > 0 && (
            <Card className="section-card ms-panel-card">
              <div className="section-header">
                <h3>Accepted</h3>
                <span className="text-muted sm">{acceptedMatches.length} confirmed</span>
              </div>
              <div className="ms-icard-list">
                {acceptedMatches.map((action) => {
                  const startup = data.startups.find((s) => s.id === action.startupId)
                  if (!startup) return null
                  const match = sortedMatches.find((m) => m.startup.id === startup.id)
                  return (
                    <InterestedStartupCard
                      key={action.startupId}
                      startup={startup}
                      fit={match?.fit}
                      hasAvailability={hasAvailability}
                      isAccepted
                      onAccept={() => {}}
                      onRemove={() => {}}
                    />
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ── Bottom — Top 6 overview ── */}
      <Card className="section-card ms-overview-card">
        <div className="section-header">
          <h3>Top 6 Matched Startups</h3>
          <span className="text-muted sm">Ranked by expertise fit</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Startup</th>
                <th>Founder</th>
                <th>Industry</th>
                <th>Stage</th>
                <th>Fit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedMatches.slice(0, 6).map((match, idx) => {
                const decision = actionsByStartup[match.startup.id]?.decision
                return (
                  <tr key={match.startup.id}>
                    <td><span className="shortlist-rank">#{idx + 1}</span></td>
                    <td><strong>{match.startup.name}</strong></td>
                    <td>{match.startup.founderName}</td>
                    <td>{match.startup.industry}</td>
                    <td><Badge status={match.startup.stage} /></td>
                    <td><span className="ms-fit-badge">{match.fit.score}%</span></td>
                    <td>
                      {decision === 'interested' && <Badge status="Shortlisted" />}
                      {decision === 'accepted' && <Badge status="Accepted" />}
                      {decision === 'pass' && <Badge status="Passed" />}
                      {!decision && <Badge status="Not Reviewed" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  )
}
