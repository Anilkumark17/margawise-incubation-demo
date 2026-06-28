import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Card, PageHeader } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import ReportsHub from '../incubation/ReportsHub'

export default function MentorStartupReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCurrentMentor, data } = useApp()
  const mentor = getCurrentMentor()

  const assignedStartupIds = useMemo(() => {
    if (!mentor) return []
    const mentorBookings = (data.bookings || []).filter((b) => b.mentorId === mentor.id)
    const mentorRequests = (data.sessionRequests || []).filter((r) => r.mentorId === mentor.id)
    const mentorActions = (data.mentorStartupActions || []).filter((action) => action.mentorId === mentor.id)
    return [...new Set([
      ...mentorBookings.map((b) => b.startupId),
      ...mentorRequests.filter((r) => r.status !== 'rejected').map((r) => r.startupId),
      ...mentorActions.map((action) => action.startupId),
    ])]
  }, [data.bookings, data.sessionRequests, data.mentorStartupActions, mentor])

  const startup = data.startups.find((s) => s.id === id && assignedStartupIds.includes(s.id))

  if (!mentor) return null

  if (!startup) {
    return (
      <DashboardLayout role="mentor">
        <PageHeader title="Startup Report" subtitle="Access restricted" />
        <Card className="section-card">
          <p className="text-muted">You can only access reports of startups assigned to you.</p>
          <div style={{ marginTop: 12 }}>
            <Button variant="secondary" onClick={() => navigate('/mentor/dashboard')}>← Back to Dashboard</Button>
          </div>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <ReportsHub
      role="mentor"
      backPath="/mentor/dashboard"
      startupId={id}
    />
  )
}
