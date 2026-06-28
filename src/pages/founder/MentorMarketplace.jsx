import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Avatar, Button, Badge } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

const TYPE_FILTERS = [
  { id: 'all', label: 'All Mentors' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'internal', label: 'Internal' },
  { id: 'external', label: 'External' },
]

function getAssignedMentorIds(startupId, bookings, sessionRequests) {
  if (!startupId) return new Set()
  const fromBookings = (bookings || []).filter((b) => b.startupId === startupId).map((b) => b.mentorId)
  const fromRequests = (sessionRequests || [])
    .filter((r) => r.startupId === startupId && r.status !== 'rejected')
    .map((r) => r.mentorId)
  return new Set([...fromBookings, ...fromRequests])
}

export default function MentorMarketplace() {
  const { data, getCurrentStartup } = useApp()
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState('all')
  const startup = getCurrentStartup()

  const assignedMentorIds = useMemo(
    () => getAssignedMentorIds(startup?.id, data.bookings, data.sessionRequests),
    [startup?.id, data.bookings, data.sessionRequests]
  )

  const approvedMentors = useMemo(
    () => data.mentors.filter((m) => m.status === 'Approved'),
    [data.mentors]
  )

  const counts = useMemo(
    () => ({
      all: approvedMentors.length,
      assigned: approvedMentors.filter((m) => assignedMentorIds.has(m.id)).length,
      internal: approvedMentors.filter((m) => m.isInternal).length,
      external: approvedMentors.filter((m) => !m.isInternal).length,
    }),
    [approvedMentors, assignedMentorIds]
  )

  const mentors = useMemo(() => {
    return approvedMentors.filter((m) => {
      if (typeFilter === 'assigned') return assignedMentorIds.has(m.id)
      if (typeFilter === 'internal') return m.isInternal
      if (typeFilter === 'external') return !m.isInternal
      return true
    })
  }, [approvedMentors, assignedMentorIds, typeFilter])

  const upcomingByMentor = useMemo(() => {
    const map = new Map()
    if (!startup?.id) return map
    ;(data.bookings || [])
      .filter((b) => b.startupId === startup.id && b.status !== 'completed' && b.date >= '2026-06-18')
      .forEach((b) => {
        if (!map.has(b.mentorId)) map.set(b.mentorId, b)
      })
    return map
  }, [data.bookings, startup?.id])

  return (
    <DashboardLayout role="founder">
      <PageHeader
        title="Mentors"
        subtitle="Your assigned mentors and the full mentor network"
      />

      <div className="fm-mentor-stats">
        {TYPE_FILTERS.map(({ id, label }) => (
          <div key={id} className="wr-stat-pill">
            <span>{label}</span>
            <strong>{counts[id]}</strong>
          </div>
        ))}
      </div>

      <div className="filter-bar fm-type-filters">
        {TYPE_FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={typeFilter === id ? 'active' : ''}
            onClick={() => setTypeFilter(id)}
          >
            {label}
            <span className="fm-filter-count">{counts[id]}</span>
          </button>
        ))}
      </div>

      {mentors.length === 0 ? (
        <Card className="section-card">
          <p className="text-muted empty-hint">
            {typeFilter === 'assigned'
              ? 'No mentors assigned to your startup yet. Browse internal and external mentors to book a session.'
              : 'No mentors match this filter.'}
          </p>
        </Card>
      ) : (
        <div className="mentor-grid">
          {mentors.map((m) => {
            const isAssigned = assignedMentorIds.has(m.id)
            const upcoming = upcomingByMentor.get(m.id)
            return (
              <Card
                key={m.id}
                className={`mentor-card${m.isInternal ? ' mm-card-internal' : ''}${isAssigned ? ' fm-card-assigned' : ''}`}
              >
                <div className="mentor-card-top">
                  <Avatar name={m.name} size={56} />
                  <div>
                    <div className="mm-card-name-row">
                      <h3>{m.name}</h3>
                      {m.isInternal && (
                        <span className="mm-internal-badge" title="Internal mentor">I</span>
                      )}
                    </div>
                    <p className="text-muted">{m.designation}</p>
                    <div className="fm-mentor-badges">
                      {isAssigned && <Badge status="Assigned" />}
                      {m.isInternal ? (
                        <Badge status="Internal" />
                      ) : (
                        <Badge status="External" />
                      )}
                    </div>
                  </div>
                </div>
                <p className="mentor-exp">
                  {m.yearsExperience} years experience · {m.industryExpertise}
                </p>
                <div className="tag-row">
                  {m.expertise.slice(0, 3).map((t) => (
                    <Badge key={t} status={t} />
                  ))}
                </div>
                {upcoming && (
                  <p className="text-muted sm fm-upcoming-session">
                    Upcoming session: {upcoming.date} · {upcoming.time}
                  </p>
                )}
                <div className="mentor-card-bottom">
                  <div>
                    <span className="price">${m.hourlyCharge}/hr</span>
                    <span className="text-muted"> · {m.availability.length} slots available</span>
                  </div>
                  <div className="mentor-actions">
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/founder/mentors/${m.id}`)}>
                      View Profile
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/founder/mentors/${m.id}/book`)}>
                      {isAssigned ? 'Book Again' : 'Book Session'}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
