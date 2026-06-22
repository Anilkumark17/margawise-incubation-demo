import { Card, Badge, Button, ProgressTracker, MetricCard } from '../ui'
import { getMvpPlan } from '../../data/mvpSeed'

const MVP_STEPS = [
  'Define MVP Scope',
  'Feature Prioritization',
  'Prototype Created',
  'User Testing',
  'Feedback Collection',
  'MVP Launch',
]

const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2 }

export default function MVPStage({ startup, onUpdateNote, onMarkEntrySeen }) {
  const plan = getMvpPlan(startup)
  const ut = startup.userTesting || {
    testUsers: 0,
    feedbackCollected: 0,
    issuesFound: 0,
    featuresRequested: 0,
  }
  const features = [...plan.suggestedFeatures].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  )
  const released = features.filter((f) => f.status === 'Released').length

  return (
    <div className="stage-page mvp-stage">
      {!startup.stageNotes?.mvpEntrySeen && (
        <div className="stage-intro-banner">
          <span className="stage-intro-icon">◆</span>
          <div className="stage-intro-text">
            <strong>Validation insights loaded</strong>
            <p className="text-muted sm">
              Your MVP plan is built from {plan.insights.length} insights gathered across Explore, Assumptions, and Interviews.
            </p>
          </div>
          <Button size="sm" onClick={() => onMarkEntrySeen?.()}>Got it</Button>
        </div>
      )}

      <Card className="section-card">
        <div className="section-header">
          <h3>MVP Workflow</h3>
          <Badge status="In Progress">Phase 2 of 3</Badge>
        </div>
        <ProgressTracker steps={MVP_STEPS} currentIndex={Math.min(4, released + 1)} />
      </Card>

      <Card className="section-card">
        <div className="section-header">
          <div>
            <h3>Validation Insights</h3>
            <p className="text-muted sm">Evidence gathered from your validation journey</p>
          </div>
          <span className="ai-badge">{plan.insights.length} insights</span>
        </div>
        <div className="insights-list">
          {plan.insights.map((ins) => (
            <div key={ins.id} className="insight-row">
              <span className={`insight-source source-${ins.source.toLowerCase()}`}>{ins.source}</span>
              <div>
                <span className="insight-label">{ins.label}</span>
                <p>{ins.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="section-card">
        <div className="section-header">
          <div>
            <h3>Suggested Features</h3>
            <p className="text-muted sm">Prioritized by pain severity and validation evidence</p>
          </div>
        </div>
        <div className="feature-priority-list">
          {features.map((f, i) => (
            <div key={f.id} className={`feature-priority-row priority-${f.priority.toLowerCase()}`}>
              <span className="feature-rank">#{i + 1}</span>
              <div className="feature-priority-main">
                <div className="feature-priority-top">
                  <h4>{f.name}</h4>
                  <div className="feature-priority-badges">
                    <span className={`priority-pill ${f.priority.toLowerCase()}`}>{f.priority}</span>
                    <Badge status={f.status} />
                    <span className="effort-tag">{f.effort} effort</span>
                  </div>
                </div>
                <p className="pain-solved">Solves: {f.painSolved}</p>
                <p className="text-muted sm">{f.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="section-grid">
        <Card className="section-card persona-card mvp-persona">
          <h3>Ideal Customer Persona</h3>
          <p className="section-desc">Beachhead from validation — build MVP for this person first</p>
          <div className="persona-top">
            <div className="persona-avatar">{plan.persona.initials}</div>
            <div>
              <h4>{plan.persona.name}</h4>
              <span className="persona-subtitle">{plan.persona.role}</span>
            </div>
          </div>
          <p className="persona-summary">{plan.persona.summary}</p>
          <div className="persona-block">
            <strong>Job to be done</strong>
            <p>{plan.persona.jtbd}</p>
          </div>
          <div className="persona-block">
            <strong>Key frustrations</strong>
            <ul className="wizard-bullet-list">
              {plan.persona.frustrations.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="persona-block">
            <strong>Switching triggers</strong>
            <ul className="wizard-bullet-list">
              {plan.persona.switchingTriggers.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="section-card">
          <h3>Tech Stack Suggestion</h3>
          <p className="section-desc">Recommended stack based on MVP scope and team constraints</p>
          <div className="tech-stack-list">
            {plan.techStack.map((t) => (
              <div key={t.layer} className="tech-stack-row">
                <span className="tech-layer">{t.layer}</span>
                <strong>{t.tech}</strong>
                <p className="text-muted sm">{t.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="section-card cautions-card">
        <div className="section-header">
          <h3>Cautions & Risks</h3>
          <Badge status="At Risk">Review before building</Badge>
        </div>
        <div className="cautions-list">
          {plan.cautions.map((c) => (
            <div key={c.title} className={`caution-item severity-${c.severity}`}>
              <span className={`severity-badge ${c.severity}`}>{c.severity}</span>
              <div>
                <strong>{c.title}</strong>
                <p className="text-muted sm">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="metrics-row">
        <MetricCard label="Test Users" value={ut.testUsers} accent />
        <MetricCard label="Feedback Collected" value={ut.feedbackCollected} accent />
        <MetricCard label="Issues Found" value={ut.issuesFound} accent />
        <MetricCard label="Features Requested" value={ut.featuresRequested} accent />
      </div>

      <Card className="section-card stage-notes-card">
        <h3>MVP Stage Notes</h3>
        <p className="text-muted sm">Capture decisions, blockers, and learnings as you build</p>
        <textarea
          className="form-input form-textarea stage-notes-input"
          rows={4}
          placeholder="e.g. Decided to ship translator with human-in-the-loop first. Jira integration is P0 for beta..."
          value={plan.stageNote}
          onChange={(e) => onUpdateNote(e.target.value)}
        />
      </Card>
    </div>
  )
}
