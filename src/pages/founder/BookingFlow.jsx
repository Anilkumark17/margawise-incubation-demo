import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Button, Select } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

export default function BookingFlow() {
  const { id } = useParams()
  const { getMentor, getCurrentStartup, setPendingBooking } = useApp()
  const navigate = useNavigate()
  const mentor = getMentor(id)
  const startup = getCurrentStartup()

  const [date, setDate] = useState('2026-06-24')
  const [time, setTime] = useState(mentor?.availability[0] || '')
  const [duration, setDuration] = useState(mentor?.sessionTypes[0] || 60)

  if (!mentor) return null

  const price = Math.round((mentor.hourlyCharge * duration) / 60)

  const handleContinue = () => {
    setPendingBooking({
      mentorId: mentor.id,
      mentorName: mentor.name,
      startupId: startup.id,
      startupName: startup.name,
      startupStage: startup.stage,
      date,
      time,
      duration,
      price,
    })
    navigate(`/founder/mentors/${id}/payment`)
  }

  return (
    <DashboardLayout role="founder">
      <PageHeader title="Book Mentorship Session" subtitle={`with ${mentor.name}`} />

      <Card className="form-card booking-card">
        <Select label="Date" value={date} onChange={(e) => setDate(e.target.value)}>
          <option value="2026-06-24">June 24, 2026</option>
          <option value="2026-06-25">June 25, 2026</option>
          <option value="2026-06-26">June 26, 2026</option>
          <option value="2026-06-27">June 27, 2026</option>
        </Select>

        <Select label="Time Slot" value={time} onChange={(e) => setTime(e.target.value)}>
          {mentor.availability.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        <Select label="Duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
          {mentor.sessionTypes.map((t) => (
            <option key={t} value={t}>{t} minutes — ${Math.round((mentor.hourlyCharge * t) / 60)}</option>
          ))}
        </Select>

        <div className="booking-summary">
          <div className="summary-row">
            <span>Session with {mentor.name}</span>
            <span>${price}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${price}</span>
          </div>
        </div>

        <div className="form-actions">
          <Button variant="secondary" onClick={() => navigate(`/founder/mentors/${id}`)}>Back</Button>
          <Button onClick={handleContinue}>Continue to Payment</Button>
        </div>
      </Card>
    </DashboardLayout>
  )
}
