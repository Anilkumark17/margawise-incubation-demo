import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, MetricCard, Card, Button, Badge } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

const TODAY = '2026-06-18'

function formatDate(iso) {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function RequestRow({ req, onRespond }) {
  const isPending = req.status === 'pending'
  return (
    <div className="request-card mentor-request-row">
      <div className="mentor-request-main">
        <div className="mentor-request-head">
          <strong>{req.startupName}</strong>
          <Badge status={req.status} />
        </div>
        <p className="text-muted sm">{req.startupStage} Stage · Requested {formatDate(req.requestedDate)}</p>
      </div>
      {isPending && (
        <div className="request-actions mentor-request-actions">
          <Button size="sm" onClick={() => onRespond(req.id, true)}>Accept</Button>
          <Button size="sm" variant="secondary" onClick={() => onRespond(req.id, false)}>Reject</Button>
        </div>
      )}
    </div>
  )
}

export default function MentorDashboardHome() {
  const { getCurrentMentor, data, respondToRequest } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mentor = getCurrentMentor()
  const showMatchedInDashboard = searchParams.get('show') === 'matches'
  const mentorBookings = (data.bookings || []).filter((b) => b.mentorId === mentor?.id)
  const mentorRequests = (data.sessionRequests || [])
    .filter((r) => r.mentorId === mentor?.id)
    .sort((a, b) => b.requestedDate.localeCompare(a.requestedDate))
  const pendingRequests = mentorRequests.filter((r) => r.status === 'pending')
  const upcomingSessions = mentorBookings.filter((b) => b.date >= TODAY && b.status !== 'completed')
  const completedSessions = mentorBookings.filter((b) => b.date < TODAY || b.status === 'completed')

  const assignedStartups = useMemo(() => {
    const ids = [...new Set([
      ...mentorBookings.map((b) => b.startupId),
      ...mentorRequests.filter((r) => r.status !== 'rejected').map((r) => r.startupId),
    ])]
    return ids.map((id) => data.startups.find((s) => s.id === id)).filter(Boolean)
  }, [mentorBookings, mentorRequests, data.startups])

  const matchedStartups = useMemo(() => {
    const interestedOrAccepted = (data.mentorStartupActions || []).filter(
      (action) =>
        action.mentorId === mentor?.id &&
        (action.decision === 'interested' || action.decision === 'accepted')
    )
    const ids = [...new Set(interestedOrAccepted.map((action) => action.startupId))]
    return ids.map((id) => data.startups.find((s) => s.id === id)).filter(Boolean)
  }, [data.mentorStartupActions, data.startups, mentor?.id])

  const allVisibleStartups = useMemo(() => {
    if (!showMatchedInDashboard) return assignedStartups
    const byId = new Map()
    assignedStartups.forEach((startup) => byId.set(startup.id, startup))
    matchedStartups.forEach((startup) => byId.set(startup.id, startup))
    return Array.from(byId.values())
  }, [assignedStartups, matchedStartups, showMatchedInDashboard])

  if (!mentor) return null

  return (
    <DashboardLayout role="mentor">
      <PageHeader
        title={`Welcome, ${mentor.name.split(' ')[0]}`}
        subtitle="Assigned startups and mentorship requests"
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => navigate('/mentor/matches')}>Open Startup Matches</Button>
            <Button
              variant={showMatchedInDashboard ? 'primary' : 'secondary'}
              onClick={() =>
                navigate(showMatchedInDashboard ? '/mentor/dashboard' : '/mentor/dashboard?show=matches')
              }
            >
              {showMatchedInDashboard ? 'Hide Match Startups' : 'Show Match Startups'}
            </Button>
          </div>
        }
      />

      <div className="metrics-row">
        <MetricCard label="Assigned Startups" value={assignedStartups.length} accent />
        <MetricCard label="Pending Requests" value={pendingRequests.length} accent />
        <MetricCard label="Upcoming Sessions" value={upcomingSessions.length || mentor.upcomingSessions} accent />
        <MetricCard label="Completed Sessions" value={completedSessions.length || mentor.completedSessions} accent />
        <MetricCard label="Earnings" value={`$${mentor.earnings.toLocaleString()}`} accent />
      </div>

      <Card className="section-card">
        <div className="section-header">
          <h3>All Startups</h3>
          <span className="text-muted sm">
            {showMatchedInDashboard
              ? 'Assigned startups + shortlisted startups from My Matches'
              : 'Only startups assigned to you'}
          </span>
        </div>
        {allVisibleStartups.length === 0 ? (
          <p className="text-muted empty-hint">No startups assigned yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Startup</th>
                  <th>Stage</th>
                  <th>Mentorship Sessions</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allVisibleStartups.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td><Badge status={s.stage} /></td>
                    <td>{s.mentorSessions || 0}</td>
                    <td>
                      {assignedStartups.some((row) => row.id === s.id) ? (
                        <Badge status="Assigned" />
                      ) : (
                        <Badge status="From Matches" />
                      )}
                    </td>
                    <td>
                      <Button size="sm" onClick={() => navigate(`/mentor/startup/${s.id}/report`)}>Report</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="section-card">
        <div className="section-header">
          <h3>Mentorship Requests</h3>
          <span className="text-muted sm">{pendingRequests.length} pending</span>
        </div>
        {mentorRequests.length === 0 ? (
          <p className="text-muted empty-hint">No mentorship requests yet</p>
        ) : (
          <div className="mentor-request-list">
            {mentorRequests.map((req) => (
              <RequestRow key={req.id} req={req} onRespond={respondToRequest} />
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}

