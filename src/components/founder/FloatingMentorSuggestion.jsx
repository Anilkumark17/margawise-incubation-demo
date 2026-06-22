import { useEffect, useState } from 'react'
import { Avatar, Button } from '../ui'
import { getStageMentorSuggestion } from '../../data/mentorMatch'

export default function FloatingMentorSuggestion({ stage, startup, mentors, onBook, onViewProfile }) {
  const [visible, setVisible] = useState(true)
  const [pickIndex, setPickIndex] = useState(0)

  useEffect(() => {
    setVisible(true)
    setPickIndex((i) => i + 1)
  }, [stage])

  const suggestion = getStageMentorSuggestion(startup, mentors, stage, pickIndex)

  if (!visible || !suggestion) return null

  const { mentor, reason, stageLabel, stageSubtitle } = suggestion

  return (
    <aside className="floating-mentor-suggest" aria-live="polite">
      <button
        type="button"
        className="floating-mentor-dismiss"
        onClick={() => setVisible(false)}
        aria-label="Dismiss mentor suggestion"
      >
        ×
      </button>
      <div className="floating-mentor-inner">
        <div className="floating-mentor-badge">{stageLabel}</div>
        <p className="floating-mentor-sub">{stageSubtitle}</p>
        <div className="floating-mentor-top">
          <Avatar name={mentor.name} size={44} />
          <div>
            <strong>{mentor.name}</strong>
            <p className="text-muted sm">{mentor.designation}</p>
          </div>
        </div>
        <p className="floating-mentor-reason">{reason}</p>
        <div className="floating-mentor-meta">
          <span>{mentor.rating}★</span>
          <span>·</span>
          <span>${mentor.hourlyCharge}/hr</span>
          <span>·</span>
          <span>{mentor.yearsExperience} yrs</span>
        </div>
        <div className="floating-mentor-actions">
          <Button size="sm" variant="secondary" onClick={() => setVisible(false)}>
            Cancel
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onViewProfile(mentor.id)}>
            Profile
          </Button>
          <Button size="sm" onClick={() => onBook(mentor.id)}>
            Book session
          </Button>
        </div>
      </div>
    </aside>
  )
}
