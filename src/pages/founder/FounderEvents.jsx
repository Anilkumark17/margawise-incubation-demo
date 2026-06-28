import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Button } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import {
  FOUNDER_EVENTS,
  formatEventDate,
  getEventThemeStyle,
  isEventUpcoming,
} from '../../data/founderEvents'

const TABS = [
  { id: 'upcoming', label: 'Upcoming Events' },
  { id: 'registered', label: 'Registered Events' },
]

function EventCard({ event, registered, onRegister, onUnregister }) {
  const theme = getEventThemeStyle(event.theme)
  const canRegister = isEventUpcoming(event) && !registered

  return (
    <article className="ws-card fe-event-card">
      <div className="ws-card-top">
        <div className="ws-card-badges">
          <span
            className="ws-theme-badge"
            style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.border}` }}
          >
            {event.theme}
          </span>
          <span className={`ws-status-badge ws-status-${event.status.toLowerCase()}`}>
            {registered ? 'Registered' : event.status}
          </span>
        </div>
        {canRegister && (
          <Button size="sm" onClick={() => onRegister(event.id)}>
            Register
          </Button>
        )}
        {registered && isEventUpcoming(event) && (
          <Button size="sm" variant="secondary" onClick={() => onUnregister(event.id)}>
            Cancel registration
          </Button>
        )}
      </div>

      <h3 className="ws-name">{event.name}</h3>

      <div className="ws-meta-row">
        <span className="ws-meta-item">📅 {formatEventDate(event.date)}</span>
        <span className="ws-meta-item">🕐 {event.schedule}</span>
        <span className="ws-meta-item">📍 {event.venue}</span>
      </div>

      <p className="ws-description">{event.description}</p>

      <div className="ws-guest-row">
        <div className="ws-guest-info">
          <span className="ws-guest-label">Host</span>
          <span className="ws-guest-name">{event.host}</span>
        </div>
      </div>
    </article>
  )
}

export default function FounderEvents() {
  const { getCurrentStartup, registerForEvent, unregisterFromEvent } = useApp()
  const startup = getCurrentStartup()
  const [tab, setTab] = useState('upcoming')

  const registeredIds = startup?.registeredEventIds || []

  const upcomingEvents = useMemo(
    () => FOUNDER_EVENTS.filter((event) => isEventUpcoming(event)),
    []
  )

  const registeredEvents = useMemo(
    () => FOUNDER_EVENTS.filter((event) => registeredIds.includes(event.id)),
    [registeredIds]
  )

  const visibleEvents = tab === 'registered' ? registeredEvents : upcomingEvents

  const handleRegister = (eventId) => {
    if (!startup) return
    registerForEvent(startup.id, eventId)
  }

  const handleUnregister = (eventId) => {
    if (!startup) return
    unregisterFromEvent(startup.id, eventId)
  }

  if (!startup) return null

  return (
    <DashboardLayout role="founder">
      <div className="fr-page fe-page">
        <header className="fr-head">
          <div>
            <h1 className="fr-title">Events</h1>
            <p className="fr-subtitle">
              {startup.name} · register for incubation workshops and sessions
            </p>
          </div>
          <div className="fr-stats">
            <div className="wr-stat-pill mm-stat-amber">
              <span>Upcoming</span>
              <strong>{upcomingEvents.length}</strong>
            </div>
            <div className="wr-stat-pill wr-stat-green">
              <span>Registered</span>
              <strong>{registeredEvents.length}</strong>
            </div>
          </div>
        </header>

        <nav className="wr-seg-nav fr-filters" aria-label="Event views">
          {TABS.map(({ id, label }) => {
            const count = id === 'upcoming' ? upcomingEvents.length : registeredEvents.length
            return (
              <button
                key={id}
                type="button"
                className={`wr-seg-nav-btn${tab === id ? ' active' : ''}`}
                onClick={() => setTab(id)}
              >
                {label}
                <span className="fr-filter-count">{count}</span>
              </button>
            )
          })}
        </nav>

        {visibleEvents.length === 0 ? (
          <div className="ws-empty fe-empty">
            <span className="ws-empty-icon">📅</span>
            <p>
              {tab === 'registered'
                ? 'You have not registered for any events yet. Browse upcoming events to register.'
                : 'No upcoming events at the moment. Check back soon.'}
            </p>
            {tab === 'registered' && upcomingEvents.length > 0 && (
              <Button variant="secondary" onClick={() => setTab('upcoming')}>
                View upcoming events
              </Button>
            )}
          </div>
        ) : (
          <div className="ws-list">
            {visibleEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                registered={registeredIds.includes(event.id)}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
