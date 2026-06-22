import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Badge, Button, MetricCard } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { calcValidationMetrics } from '../../data/seed'

export default function ViewStartup() {
  const { id } = useParams()
  const { getStartup } = useApp()
  const navigate = useNavigate()
  const startup = getStartup(id)

  if (!startup) return null

  const metrics = calcValidationMetrics(startup)

  return (
    <DashboardLayout role="incubation">
      <PageHeader
        title={startup.name}
        subtitle={`Founded by ${startup.founderName}`}
        action={
          <div className="header-actions">
            <Button variant="secondary" onClick={() => navigate('/incubation/dashboard')}>← Back</Button>
            <Button onClick={() => navigate(`/incubation/startup/${id}/report`)}>Full Report</Button>
          </div>
        }
      />

      <div className="metrics-row">
        <MetricCard label="Stage" value={startup.stage} accent />
        <MetricCard label="Validation Score" value={`${metrics.score}%`} accent />
        <MetricCard label="Interviews" value={metrics.completed} accent />
        <MetricCard label="Mentor Sessions" value={startup.mentorSessions} accent />
      </div>

      <Card className="section-card">
        <h3>About</h3>
        <p>{startup.description}</p>
        <p className="text-muted">Industry: {startup.industry} · Status: <Badge status={startup.status} /></p>
      </Card>

      <div className="section-grid">
        <Card className="section-card">
          <h3>Recent Interviews</h3>
          {startup.interviews.length === 0 ? (
            <p className="text-muted">No interviews conducted yet</p>
          ) : (
            startup.interviews.slice(0, 3).map((i) => (
              <div key={i.id} className="list-item">
                <strong>{i.customerName}</strong> — {i.role}
              </div>
            ))
          )}
        </Card>
        <Card className="section-card">
          <h3>Assumptions</h3>
          {startup.assumptions.map((a) => (
            <div key={a.id} className="list-item">
              <span>"{a.text}"</span>
              <Badge status={a.status} />
            </div>
          ))}
        </Card>
      </div>
    </DashboardLayout>
  )
}
