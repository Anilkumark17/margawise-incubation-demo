import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, MetricCard, Card, Button, Badge } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { getStartupIncubationSnapshot } from '../../data/incubationMilestones'

export default function IncubationDashboard() {
  const { data } = useApp()
  const navigate = useNavigate()
  const { startups } = data

  const withMetrics = startups.map((startup) => {
    const { metrics, milestone, completedSubtasks, recommendation } = getStartupIncubationSnapshot(startup)

    return {
      startup,
      metrics,
      milestone,
      completedSubtasks,
      recommendation,
    }
  })

  return (
    <DashboardLayout role="incubation">
      <PageHeader
        title="Incubation Manager Dashboard"
        subtitle="Startup stage tracking, milestone execution, validation evidence, and mentor feedback"
      />

      <div className="metrics-row">
        <MetricCard label="Applied Startups" value={startups.length} accent />
        <MetricCard
          label="Avg Mentorship Sessions"
          value={
            startups.length
              ? Math.round(startups.reduce((sum, s) => sum + (s.mentorSessions || 0), 0) / startups.length)
              : 0
          }
          accent
        />
        <MetricCard
          label="Avg Interviews Completed"
          value={
            startups.length
              ? Math.round(withMetrics.reduce((sum, s) => sum + s.metrics.completed, 0) / startups.length)
              : 0
          }
          accent
        />
        <MetricCard
          label="Assumptions Validated"
          value={withMetrics.reduce((sum, s) => sum + s.metrics.validated, 0)}
          accent
        />
      </div>

      <Card className="section-card">
        <h3>All Startups</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Startup</th>
                <th>Stage</th>
                <th>Mentorship Sessions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {startups.map((s) => {
                return (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>
                      <Badge status={s.stage} />
                    </td>
                    <td>{s.mentorSessions || 0}</td>
                    <td>
                      <div className="table-actions">
                        <Button size="sm" onClick={() => navigate(`/incubation/startup/${s.id}/report`)}>
                          Report
                        </Button>
                      </div>
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
