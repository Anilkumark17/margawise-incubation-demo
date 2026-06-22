import { useNavigate } from 'react-router-dom'
import { Card, Badge, Button, ProgressTracker, MetricCard, Avatar } from '../ui'
import { getGtmRecommendations } from '../../data/gtmSeed'
import { getStageMentorSuggestions } from '../../data/mentorMatch'

const GTM_STEPS = [
  'ICP Definition',
  'Positioning',
  'Pricing',
  'Marketing Channels',
  'Sales Outreach',
  'GTM Execution',
]

function MentorRecCard({ suggestion, rank, onBook, featured }) {
  const m = suggestion.mentor
  return (
    <div className={`mentor-rec-card ${featured ? 'featured' : ''}`}>
      {featured && <span className="best-match-badge">Best match</span>}
      {!featured && rank && <span className="mentor-rank">#{rank}</span>}
      <div className="mentor-rec-top">
        <Avatar name={m.name} size={48} />
        <div>
          <h4>{m.name}</h4>
          <p className="text-muted sm">{m.designation}</p>
          <div className="mentor-rec-score">
            <span className="score-val">{suggestion.score}</span>
            <span className="text-muted sm"> match · {m.rating}★ · ${m.hourlyCharge}/hr</span>
          </div>
        </div>
      </div>
      <p className="match-reason">{suggestion.reason}</p>
      <div className="tag-row">
        {m.expertise.slice(0, 4).map((t) => (
          <Badge key={t} status={t} />
        ))}
      </div>
      <Button size="sm" onClick={() => onBook(m.id)}>
        Book session
      </Button>
    </div>
  )
}

export default function GTMStage({ startup, mentors, onUpdateNote }) {
  const navigate = useNavigate()
  const gtm = startup.gtm || {
    leads: 0,
    meetings: 0,
    customers: 0,
    revenue: 0,
    activities: [],
  }
  const mentorList = mentors || []
  const recs = getGtmRecommendations(startup, mentorList)
  const stageMentors = getStageMentorSuggestions(startup, mentorList, 'GTM')
  const best = stageMentors[0]
  const rest = stageMentors.slice(1, 4)

  const handleBook = (mentorId) => {
    navigate(`/founder/mentors/${mentorId}/book`)
  }

  return (
    <div className="stage-page gtm-stage">
      <Card className="section-card">
        <div className="section-header">
          <h3>GTM Workflow</h3>
          <Badge status="Active">Phase 3 of 3</Badge>
        </div>
        <ProgressTracker steps={GTM_STEPS} currentIndex={(gtm.customers ?? 0) > 10 ? 5 : 3} />
      </Card>

      <Card className="section-card">
        <div className="section-header">
          <div>
            <h3>Marketing & GTM Mentors</h3>
            <p className="text-muted sm">Growth specialists matched to your stage and industry</p>
          </div>
        </div>
        {best && <MentorRecCard suggestion={best} onBook={handleBook} featured />}
        <div className="mentor-rec-grid">
          {rest.map((r, i) => (
            <MentorRecCard key={r.mentor.id} suggestion={r} rank={i + 2} onBook={handleBook} />
          ))}
        </div>
      </Card>

      <Card className="section-card">
        <h3>GTM Playbook</h3>
        <p className="section-desc">Carried forward from your validation journey</p>
        <div className="playbook-grid">
          <div className="playbook-item">
            <strong>ICP</strong>
            <p>{recs.gtmPlaybook.icpReminder}</p>
          </div>
          <div className="playbook-item">
            <strong>Primary channel</strong>
            <p>{recs.gtmPlaybook.channelFocus}</p>
          </div>
          <div className="playbook-item">
            <strong>Pricing</strong>
            <p>{recs.gtmPlaybook.pricingNote}</p>
          </div>
        </div>
        <h4 className="playbook-week-title">First week actions</h4>
        <div className="activity-list">
          {recs.gtmPlaybook.firstWeek.map((task, i) => (
            <div key={task} className={`activity-item ${i < 1 ? 'done' : ''}`}>
              <span className="activity-check">{i < 1 ? '✓' : '○'}</span>
              {task}
            </div>
          ))}
        </div>
      </Card>

      <div className="metrics-row">
        <MetricCard label="Leads Generated" value={gtm.leads} accent />
        <MetricCard label="Meetings Scheduled" value={gtm.meetings} accent />
        <MetricCard label="Customers Acquired" value={gtm.customers} accent />
        <MetricCard label="Revenue" value={`$${(gtm.revenue ?? 0).toLocaleString()}`} accent />
      </div>

      <Card className="section-card">
        <h3>GTM Activities</h3>
        <div className="activity-list">
          {(gtm.activities?.length ? gtm.activities : [
            { id: 'g1', task: 'Run LinkedIn Campaign', done: false },
            { id: 'g2', task: 'Cold Outreach', done: false },
            { id: 'g3', task: 'Customer Demo', done: false },
            { id: 'g4', task: 'Partnership Discussion', done: false },
          ]).map((a) => (
            <div key={a.id} className={`activity-item ${a.done ? 'done' : ''}`}>
              <span className="activity-check">{a.done ? '✓' : '○'}</span>
              {a.task}
            </div>
          ))}
        </div>
      </Card>

      <Card className="section-card stage-notes-card">
        <h3>GTM Stage Notes</h3>
        <p className="text-muted sm">Track outreach results, mentor feedback, and channel experiments</p>
        <textarea
          className="form-input form-textarea stage-notes-input"
          rows={4}
          placeholder="e.g. James suggested narrowing ICP to agencies under 20 people. LinkedIn campaign launched..."
          value={recs.stageNote}
          onChange={(e) => onUpdateNote(e.target.value)}
        />
      </Card>
    </div>
  )
}
