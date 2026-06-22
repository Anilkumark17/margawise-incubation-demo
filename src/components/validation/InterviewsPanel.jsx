import { useState } from 'react'
import { Button } from '../ui'
import {
  getInterviewFrameworks,
  getInterviewSessions,
  getAssumptions,
} from '../../data/assumptionsSeed'

const FW_ICONS = {
  'fw-discovery': '👥',
  'fw-solution': '💡',
  'fw-pricing': '💰',
}

function SessionCard({ session, assumptions, onMarkEvidence, defaultOpen = false }) {
  const [expanded, setExpanded] = useState(defaultOpen)
  const linked = session.assumptionLinks.map((link) => ({
    ...link,
    assumption: assumptions.find((a) => a.id === link.assumptionId),
  }))

  return (
    <div className={`interview-row ${expanded ? 'expanded' : ''}`}>
      <div
        className="interview-row-header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div>
          <h4>{session.title}</h4>
          <div className="interview-meta">
            <span className="tag-outline">{session.framework}</span>
            <span>{session.sessions} session{session.sessions !== 1 ? 's' : ''}</span>
            <span>{session.lastUpdated}</span>
          </div>
        </div>
        <span className="expand-icon">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="interview-row-body">
          <div className="session-actions">
            <Button size="sm">Start Live Interview</Button>
            <Button size="sm" variant="secondary">Upload Offline</Button>
            <Button size="sm" variant="ghost">Details</Button>
          </div>
          <p className="derived-label">Questions derived from {session.assumptionLinks.length} assumptions</p>
          <p className="text-muted sm">{getFrameworkDesc(session.frameworkId)}</p>
          <ul className="session-assumptions">
            {linked.map(({ assumptionId, status, assumption }) => (
              <li key={assumptionId} className={`session-assumption status-${status.replace(/\s+/g, '-')}`}>
                <span>{assumption?.text || assumptionId}</span>
                <span className="assumption-status-tag">{status}</span>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" onClick={() => onMarkEvidence(session.id)}>
            Mark as Evidence Collected
          </Button>
        </div>
      )}
    </div>
  )
}

function getFrameworkDesc(frameworkId) {
  if (frameworkId === 'fw-solution') {
    return 'Validates assumptions about your proposed solution, features, and value proposition.'
  }
  if (frameworkId === 'fw-discovery') {
    return 'Validates assumptions about target customers, their pain points, and current alternatives.'
  }
  return 'Validates willingness to pay and buying intent.'
}

export default function InterviewsPanel({
  startup,
  onNewInterview,
  onMarkSessionEvidence,
  onOpenFramework,
}) {
  const frameworks = getInterviewFrameworks(startup)
  const sessions = getInterviewSessions(startup)
  const assumptions = getAssumptions(startup)
  const [search, setSearch] = useState('')

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="interviews-panel">
      <nav className="breadcrumb">
        <span>Validate</span>
        <span className="bc-sep">›</span>
        <span className="bc-active">Interviews</span>
      </nav>

      <header className="content-header">
        <span className="step-eyebrow">STEP 8 — INTERVIEWS</span>
        <h1>Interviews</h1>
        <p>Talk to real people. This is where assumptions become evidence.</p>
      </header>

      <section className="content-section">
        <h3>Interview frameworks</h3>
        <p className="section-lead">
          Pick a framework to validate assumptions. Questions are auto-generated from your tagged assumptions — no separate question bank step.
        </p>
        <div className="framework-grid">
          {frameworks.map((fw, i) => (
            <div key={fw.id} className={`framework-card ${fw.status === 'Active' ? 'active-fw' : ''}`}>
              {fw.status === 'Active' && <span className="fw-active-badge">Active</span>}
              <div className="fw-icon">{FW_ICONS[fw.id] || '📋'}</div>
              <h4>{fw.title}</h4>
              <p>{fw.description}</p>
              <p className="fw-meta">
                Validates: {fw.validates} · {fw.assumptionCount} assumption{fw.assumptionCount !== 1 ? 's' : ''}
              </p>
              <button type="button" className="fw-link" onClick={() => onOpenFramework(fw.id)}>
                {fw.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-toolbar">
          <h3>Your Interviews ({sessions.length})</h3>
          <Button onClick={onNewInterview}>+ New Interview</Button>
        </div>
        <p className="text-muted sm">Interviews linked to this project.</p>
        <div className="search-row">
          <input
            className="form-input search-input"
            placeholder="Search interviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="form-input form-select sm sort-select-inline">
            <option>Sort by Last updated</option>
            <option>Sort by Name</option>
          </select>
        </div>
        <div className="session-list">
          {filteredSessions.map((session, i) => (
            <SessionCard
              key={session.id}
              session={session}
              assumptions={assumptions}
              onMarkEvidence={onMarkSessionEvidence}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
