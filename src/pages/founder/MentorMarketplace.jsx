import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Avatar, Button, Badge } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { EXPERTISE_TAGS } from '../../data/seed'

export default function MentorMarketplace() {
  const { data } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')

  const mentors = data.mentors.filter(
    (m) => m.status === 'Approved' && (filter === 'All' || m.expertise.includes(filter))
  )

  return (
    <DashboardLayout role="founder">
      <PageHeader title="Mentor Marketplace" subtitle="Find experts to accelerate your startup journey" />

      <div className="filter-bar">
        <button type="button" className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>
          All
        </button>
        {EXPERTISE_TAGS.filter((t) => t !== 'B2B Sales').map((tag) => (
          <button
            key={tag}
            type="button"
            className={filter === tag ? 'active' : ''}
            onClick={() => setFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mentor-grid">
        {mentors.map((m) => (
          <Card key={m.id} className="mentor-card">
            <div className="mentor-card-top">
              <Avatar name={m.name} size={56} />
              <div>
                <h3>{m.name}</h3>
                <p className="text-muted">{m.designation}</p>
              </div>
            </div>
            <p className="mentor-exp">{m.yearsExperience} years experience · {m.industryExpertise}</p>
            <div className="tag-row">
              {m.expertise.slice(0, 3).map((t) => (
                <Badge key={t} status={t} />
              ))}
            </div>
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
                  Book Session
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
