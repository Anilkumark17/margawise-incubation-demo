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
          {mentor.projectHighlights?.length > 0 && (
            <div className="shortlist-field-block">
              <label>Key Projects</label>
              <div className="ic-form-builder-questions" style={{ marginTop: 8 }}>
                {mentor.projectHighlights.map((project, index) => (
                  <div key={`${project.title}-${index}`} className="ic-form-builder-question">
                    <div>
                      <strong>{project.title || 'Project'}</strong>
                      <p className="text-muted sm">{project.domain || 'General domain'}</p>
                    </div>
                    <p className="text-muted sm">{project.outcome || 'Outcome not added'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mentor.previousStartupsByDomain?.length > 0 && (
            <div className="shortlist-field-block">
              <label>Previously Worked Startups (Domain Wise)</label>
              <div className="ic-form-builder-questions" style={{ marginTop: 8 }}>
                {mentor.previousStartupsByDomain.map((entry, index) => (
                  <div key={`${entry.domain}-${index}`} className="ic-form-builder-question">
                    <div>
                      <strong>{entry.domain || 'General'}</strong>
                      <p className="text-muted sm">{entry.startups || 'No startup names added'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
