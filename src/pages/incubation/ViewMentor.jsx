import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Avatar, Badge, Button, MetricCard } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

export default function ViewMentor() {
  const { id } = useParams()
  const { getMentor, updateMentorStatus } = useApp()
  const navigate = useNavigate()
  const mentor = getMentor(id)

  if (!mentor) return null

  return (
    <DashboardLayout role="incubation">
      <PageHeader
        title={mentor.name}
        subtitle={mentor.designation}
        action={<Button variant="secondary" onClick={() => navigate('/incubation/mentors')}>← Back</Button>}
      />

      <div className="profile-layout">
        <Card className="profile-main">
          <div className="profile-header">
            <Avatar name={mentor.name} size={80} />
            <div>
              <h2>{mentor.name}</h2>
              <Badge status={mentor.status} />
              <p className="text-muted">{mentor.yearsExperience} years · {mentor.industryExpertise}</p>
            </div>
          </div>
          <p>{mentor.bio}</p>
          <div className="tag-row">
            {mentor.expertise.map((t) => (
              <Badge key={t} status={t} />
            ))}
          </div>
        </Card>
        <div className="profile-sidebar">
          <MetricCard label="Total Sessions" value={mentor.totalSessions} accent />
          <MetricCard label="Rating" value={`${mentor.rating} ★`} accent />
          <MetricCard label="Revenue Generated" value={`$${mentor.revenue.toLocaleString()}`} accent />
          <div className="mentor-actions vertical">
            {mentor.status !== 'Approved' && (
              <Button onClick={() => updateMentorStatus(mentor.id, 'Approved')}>Approve Mentor</Button>
            )}
            {mentor.status !== 'Suspended' && (
              <Button variant="danger" onClick={() => updateMentorStatus(mentor.id, 'Suspended')}>
                Suspend Mentor
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
