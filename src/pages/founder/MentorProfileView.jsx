import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Avatar, Button, Badge, MetricCard } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

export default function MentorProfileView() {
  const { id } = useParams()
  const { getMentor } = useApp()
  const navigate = useNavigate()
  const mentor = getMentor(id)

  if (!mentor) return <div>Mentor not found</div>

  return (
    <DashboardLayout role="founder">
      <PageHeader
        title={mentor.name}
        subtitle={mentor.designation}
        action={
          <Button onClick={() => navigate(`/founder/mentors/${id}/book`)}>Book Session</Button>
        }
      />

      <div className="profile-layout">
        <Card className="profile-main">
          <div className="profile-header">
            <Avatar name={mentor.name} size={80} />
            <div>
              <h2>{mentor.name}</h2>
              <p className="text-muted">{mentor.industryExpertise} · {mentor.yearsExperience} years</p>
              <a href={`https://${mentor.linkedin}`} target="_blank" rel="noreferrer" className="link">
                {mentor.linkedin}
              </a>
            </div>
          </div>
          <h3>About</h3>
          <p>{mentor.bio}</p>
          <h3>Expertise</h3>
          <div className="tag-row">
            {mentor.expertise.map((t) => (
              <Badge key={t} status={t} />
            ))}
          </div>
          {mentor.projectHighlights?.length > 0 && (
            <>
              <h3>Key Projects</h3>
              <div className="ic-form-builder-questions">
                {mentor.projectHighlights.map((project, index) => (
                  <div key={`${project.title}-${index}`} className="ic-form-builder-question">
                    <div>
                      <strong>{project.title || 'Project'}</strong>
                      <p className="text-muted sm">{project.domain || 'General domain'}</p>
                    </div>
                    <span className="text-muted sm">{project.outcome || 'Outcome not added'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {mentor.previousStartupsByDomain?.length > 0 && (
            <>
              <h3>Previously Worked Startups (Domain Wise)</h3>
              <div className="ic-form-builder-questions">
                {mentor.previousStartupsByDomain.map((entry, index) => (
                  <div key={`${entry.domain}-${index}`} className="ic-form-builder-question">
                    <div>
                      <strong>{entry.domain || 'General'}</strong>
                      <p className="text-muted sm">{entry.startups || 'No startup names added'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <h3>Availability</h3>
          <div className="slot-list">
            {mentor.availability.map((s) => (
              <span key={s} className="slot-chip">{s}</span>
            ))}
          </div>
        </Card>
        <div className="profile-sidebar">
          <MetricCard label="Hourly Rate" value={`$${mentor.hourlyCharge}`} accent />
          <MetricCard label="Rating" value={`${mentor.rating} ★`} accent />
          <MetricCard label="Sessions" value={mentor.totalSessions} accent />
          <Card>
            <h4>Session Types</h4>
            {mentor.sessionTypes.map((t) => (
              <p key={t}>{t} minutes — ${Math.round((mentor.hourlyCharge * t) / 60)}</p>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
