import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Badge, Button, MetricCard } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

const TODAY = '2026-06-18'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function inferMentorshipNeed(req, startup) {
  return (
    req.mentorshipNeed ||
    req.topic ||
    req.requestTopic ||
    req.requestType ||
    req.reason ||
    (startup ? `Guidance for ${startup.stage} stage` : 'General mentorship guidance')
  )
}

export default function MentorRequests() {
  const { getCurrentMentor, data, respondToRequest, saveMentorRequestReply } = useApp()
  const mentor = getCurrentMentor()
  const [replyDrafts, setReplyDrafts] = useState({})
  if (!mentor) return null

  const mentorRequests = useMemo(
    () =>
      (data.sessionRequests || [])
        .filter((r) => r.mentorId === mentor.id)
        .sort((a, b) => b.requestedDate.localeCompare(a.requestedDate)),
    [data.sessionRequests, mentor.id]
  )
  const upcomingBookings = useMemo(
    () =>
      (data.bookings || [])
        .filter((b) => b.mentorId === mentor.id && b.date >= TODAY && b.status !== 'completed')
        .sort((a, b) => a.date.localeCompare(b.date)),
    [data.bookings, mentor.id]
  )

  useEffect(() => {
    setReplyDrafts((prev) => {
      const next = { ...prev }
      mentorRequests.forEach((r) => {
        if (next[r.id] === undefined) next[r.id] = r.mentorReply || ''
      })
      return next
    })
  }, [mentorRequests])

  const pending = mentorRequests.filter((r) => r.status === 'pending').length
  const accepted = mentorRequests.filter((r) => r.status === 'accepted').length
  const rejected = mentorRequests.filter((r) => r.status === 'rejected').length

  return (
    <DashboardLayout role="mentor">
      <PageHeader
        title="Mentorship Requests"
        subtitle="All requests you received with founder details, mentorship needs, actions, and replies"
      />

      <div className="metrics-row">
        <MetricCard label="Total Requests" value={mentorRequests.length} accent />
        <MetricCard label="Pending" value={pending} accent />
        <MetricCard label="Accepted" value={accepted} accent />
        <MetricCard label="Rejected" value={rejected} accent />
        <MetricCard label="Upcoming Sessions" value={upcomingBookings.length} accent />
      </div>

      <Card className="section-card">
        <div className="section-header">
          <h3>Upcoming Sessions</h3>
          <span className="text-muted sm">{upcomingBookings.length} scheduled</span>
        </div>
        {upcomingBookings.length === 0 ? (
          <p className="text-muted empty-hint">No upcoming sessions.</p>
        ) : (
          <div className="booked-sessions-list">
            {upcomingBookings.map((booking) => {
              const startup = data.startups.find((s) => s.id === booking.startupId)
              return (
                <div key={booking.id} className="booked-session-row upcoming">
                  <div className="booked-session-main">
                    <div className="booked-session-top">
                      <strong>{booking.startupName}</strong>
                      <Badge status="Active" />
                    </div>
                    <p className="text-muted sm">
                      Founder: {startup?.founderName || '—'} · {booking.startupStage} Stage · {booking.duration} min
                    </p>
                    <div className="booked-session-meta">
                      <span className="booked-date">{formatDate(booking.date)}</span>
                      <span className="booked-time">{booking.time}</span>
                    </div>
                  </div>
                  <span className="booked-status-pill">Booked</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="section-card">
        <div className="section-header">
          <h3>All Requests</h3>
          <span className="text-muted sm">{pending} pending action</span>
        </div>

        {mentorRequests.length === 0 ? (
          <p className="text-muted empty-hint">No requests received yet.</p>
        ) : (
          <div className="mentor-requests-list">
            {mentorRequests.map((req) => {
              const startup = data.startups.find((s) => s.id === req.startupId)
              const founderName = startup?.founderName || req.founderName || req.founder || '—'
              const need = inferMentorshipNeed(req, startup)
              const draftReply = replyDrafts[req.id] || ''
              const isPending = req.status === 'pending'
              return (
                <div key={req.id} className="mentor-request-card-full">
                  <div className="mentor-request-full-head">
                    <div>
                      <h4>{req.startupName || startup?.name || 'Startup'}</h4>
                      <p className="text-muted sm">
                        Founder: {founderName} · Requested: {formatDate(req.requestedDate)}
                      </p>
                    </div>
                    <Badge status={req.status} />
                  </div>

                  <div className="mentor-request-meta-grid">
                    <div>
                      <span className="mentor-request-meta-label">Startup Name</span>
                      <strong>{req.startupName || startup?.name || '—'}</strong>
                    </div>
                    <div>
                      <span className="mentor-request-meta-label">Founder Name</span>
                      <strong>{founderName}</strong>
                    </div>
                    <div>
                      <span className="mentor-request-meta-label">Stage</span>
                      <strong>{req.startupStage || startup?.stage || '—'}</strong>
                    </div>
                  </div>

                  <div className="mentor-request-need">
                    <span className="mentor-request-meta-label">What kind of mentorship they need</span>
                    <p>{need}</p>
                  </div>

                  <div className="mentor-request-reply-wrap">
                    <label className="form-label">Reply</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={3}
                      value={draftReply}
                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [req.id]: e.target.value }))}
                      placeholder="Write your reply to the founder..."
                    />
                    {req.mentorReply && (
                      <p className="text-muted sm">Last saved reply: {req.mentorReply}</p>
                    )}
                  </div>

                  <div className="mentor-request-actions-row">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => saveMentorRequestReply(req.id, draftReply)}
                      disabled={!draftReply.trim()}
                    >
                      Save Reply
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => respondToRequest(req.id, true, draftReply)}
                      disabled={!isPending}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => respondToRequest(req.id, false, draftReply)}
                      disabled={!isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}

