import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Button } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

export default function Availability() {
  const { getCurrentMentor, addAvailabilitySlot, removeAvailabilitySlot } = useApp()
  const mentor = getCurrentMentor()
  const [newSlot, setNewSlot] = useState('')

  if (!mentor) return null

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const slotsByDay = days.reduce((acc, day) => {
    acc[day] = mentor.availability.filter((s) => s.startsWith(day))
    return acc
  }, {})

  const handleAdd = () => {
    if (newSlot.trim()) {
      addAvailabilitySlot(mentor.id, newSlot.trim())
      setNewSlot('')
    }
  }

  return (
    <DashboardLayout role="mentor">
      <PageHeader title="Availability Management" subtitle="Manage your available time slots" />

      <Card className="section-card">
        <h3>Add Time Slot</h3>
        <div className="add-slot-row">
          <input
            className="form-input"
            placeholder="e.g. Mon 10:00"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
          />
          <Button onClick={handleAdd}>Add Slot</Button>
        </div>
      </Card>

      <div className="calendar-grid">
        {days.map((day) => (
          <Card key={day} className="calendar-day">
            <h4>{day}</h4>
            {slotsByDay[day].length === 0 ? (
              <p className="text-muted sm">No slots</p>
            ) : (
              slotsByDay[day].map((slot) => (
                <div key={slot} className="slot-item">
                  <span>{slot.split(' ')[1]}</span>
                  <button type="button" className="remove-btn" onClick={() => removeAvailabilitySlot(mentor.id, slot)}>
                    ×
                  </button>
                </div>
              ))
            )}
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
