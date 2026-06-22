import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Avatar, Button } from '../../components/ui'

/* ── seed data ── */
const SEED_WORKSHOPS = [
  {
    id: 'ws-1',
    name: 'From Idea to MVP: Build Fast, Fail Faster',
    date: '2026-07-05',
    time: '10:00',
    theme: 'Product Development',
    schedule: '10:00 AM – 1:00 PM IST',
    description: 'A hands-on workshop covering rapid prototyping, MVP scoping, and how to get to first user in under four weeks. Includes live breakout sessions.',
    guestName: 'Dr. Priya Sharma',
    guestLinkedin: 'linkedin.com/in/priyasharma',
    status: 'Upcoming',
  },
  {
    id: 'ws-2',
    name: 'Fundraising 101: Pitching to Angel Investors',
    date: '2026-06-15',
    time: '14:00',
    theme: 'Fundraising',
    schedule: '2:00 PM – 4:30 PM IST',
    description: 'Learn how to craft a compelling investor narrative, structure your deck, and handle due diligence questions. Real pitch simulations included.',
    guestName: 'Robert Kim',
    guestLinkedin: 'linkedin.com/in/robertkim-vc',
    status: 'Completed',
  },
  {
    id: 'ws-3',
    name: 'GTM Strategy for Early-Stage B2B Startups',
    date: '2026-07-18',
    time: '11:00',
    theme: 'Go-to-Market',
    schedule: '11:00 AM – 1:00 PM IST',
    description: 'Deep dive into ICP definition, outbound playbooks, and channel mix for B2B founders targeting SMEs and enterprise accounts.',
    guestName: 'James Okafor',
    guestLinkedin: 'linkedin.com/in/jamesokafor',
    status: 'Upcoming',
  },
]

const BLANK_WORKSHOP = { name: '', date: '', time: '', theme: '', schedule: '', description: '', guestName: '', guestLinkedin: '' }

const THEME_COLORS = {
  'Product Development': { bg: 'rgba(99,102,241,0.1)',  color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  'Fundraising':         { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  'Go-to-Market':        { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
  'Marketing':           { bg: 'rgba(236,72,153,0.1)',  color: '#f472b6', border: 'rgba(236,72,153,0.25)' },
  'Legal & Finance':     { bg: 'rgba(6,182,212,0.1)',   color: '#22d3ee', border: 'rgba(6,182,212,0.25)'  },
}

function themeStyle(theme) {
  return THEME_COLORS[theme] || { bg: 'rgba(120,120,120,0.1)', color: '#9ca3af', border: 'rgba(120,120,120,0.25)' }
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ── Workshop Form Modal ── */
function WorkshopFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || BLANK_WORKSHOP)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.name.trim() && form.date && form.theme.trim()
  return (
    <div className="wr-modal-overlay" onClick={onClose}>
      <div className="wr-modal mm-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wr-modal-header">
          <h3>{initial ? 'Edit Workshop' : 'Create Workshop'}</h3>
          <button type="button" className="wr-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wr-modal-body mm-form-grid">
          <div className="mm-form-col mm-form-full">
            <label className="form-label">Workshop Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Fundraising 101: Pitching to Angels" />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Date *</label>
            <input className="form-input" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Time</label>
            <input className="form-input" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Theme *</label>
            <input className="form-input" list="ws-themes" value={form.theme} onChange={(e) => set('theme', e.target.value)} placeholder="e.g. Fundraising" />
            <datalist id="ws-themes">
              {Object.keys(THEME_COLORS).map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div className="mm-form-col">
            <label className="form-label">Schedule</label>
            <input className="form-input" value={form.schedule} onChange={(e) => set('schedule', e.target.value)} placeholder="e.g. 10:00 AM – 1:00 PM IST" />
          </div>
          <div className="mm-form-col mm-form-full">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What will attendees learn or do?" />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Guest / Speaker Name</label>
            <input className="form-input" value={form.guestName} onChange={(e) => set('guestName', e.target.value)} placeholder="e.g. Dr. Priya Sharma" />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Guest LinkedIn</label>
            <input className="form-input" value={form.guestLinkedin} onChange={(e) => set('guestLinkedin', e.target.value)} placeholder="linkedin.com/in/username" />
          </div>
        </div>
        <div className="wr-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} onClick={() => onSave(form)}>{initial ? 'Save Changes' : 'Create Workshop'}</Button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   Main Page
══════════════════════════════════════ */
export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState(SEED_WORKSHOPS)
  const [filter, setFilter]       = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editWs, setEditWs]       = useState(null)

  const saveWorkshop = (form) => {
    if (editWs) {
      setWorkshops((p) => p.map((w) => w.id === editWs.id ? { ...w, ...form } : w))
      setEditWs(null)
    } else {
      setWorkshops((p) => [...p, { ...form, id: `ws-${Date.now()}`, status: 'Upcoming' }])
      setShowModal(false)
    }
  }

  const deleteWorkshop = (id) => setWorkshops((p) => p.filter((w) => w.id !== id))
  const setStatus      = (id, status) => setWorkshops((p) => p.map((w) => w.id === id ? { ...w, status } : w))

  const statuses       = ['All', 'Upcoming', 'Completed', 'Cancelled']
  const upcomingCount  = workshops.filter((w) => w.status === 'Upcoming').length
  const visible        = workshops.filter((w) => filter === 'All' || w.status === filter)

  return (
    <DashboardLayout role="incubation">
      {(showModal || editWs) && (
        <WorkshopFormModal
          initial={editWs}
          onSave={saveWorkshop}
          onClose={() => { setShowModal(false); setEditWs(null) }}
        />
      )}

      {/* header */}
      <div className="mm-page-header">
        <div>
          <h2 className="mm-page-title">Workshops</h2>
          <p className="text-muted sm">Schedule and manage incubation workshops and speaker sessions</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Create Workshop</Button>
      </div>

      {/* summary pills */}
      <div className="mm-stats-row">
        <div className="mm-stat-pill"><span>Total</span><strong>{workshops.length}</strong></div>
        <div className="mm-stat-pill mm-stat-amber"><span>Upcoming</span><strong>{upcomingCount}</strong></div>
        <div className="mm-stat-pill mm-stat-green"><span>Completed</span><strong>{workshops.filter((w) => w.status === 'Completed').length}</strong></div>
      </div>

      {/* filter pills */}
      <div className="ws-filter-row">
        {statuses.map((s) => (
          <button key={s} type="button" className={`ws-filter-pill${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s}
            {s === 'Upcoming' && upcomingCount > 0 && <span className="ws-pill-count">{upcomingCount}</span>}
          </button>
        ))}
        <span className="text-muted sm" style={{ marginLeft: 'auto' }}>{visible.length} workshop{visible.length !== 1 ? 's' : ''}</span>
      </div>

      {/* empty state */}
      {visible.length === 0 && (
        <div className="ws-empty">
          <span className="ws-empty-icon">📅</span>
          <p>No workshops here. Click <strong>+ Create Workshop</strong> to add one.</p>
        </div>
      )}

      {/* workshop cards */}
      <div className="ws-list">
        {visible.map((w) => {
          const ts    = themeStyle(w.theme)
          const isPast = w.date && new Date(w.date) < new Date()
          return (
            <div key={w.id} className={`ws-card${w.status === 'Cancelled' ? ' ws-cancelled' : ''}`}>

              {/* top strip */}
              <div className="ws-card-top">
                <div className="ws-card-badges">
                  <span className="ws-theme-badge" style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>{w.theme}</span>
                  <span className={`ws-status-badge ws-status-${w.status.toLowerCase()}`}>{w.status}</span>
                </div>
                <div className="ws-card-menu">
                  {w.status === 'Upcoming' && isPast && (
                    <button type="button" className="ws-action-chip ws-action-complete" onClick={() => setStatus(w.id, 'Completed')}>Mark Complete</button>
                  )}
                  {w.status !== 'Cancelled' && (
                    <button type="button" className="ws-action-chip" onClick={() => setStatus(w.id, 'Cancelled')}>Cancel</button>
                  )}
                  <button type="button" className="ws-icon-btn" title="Edit" onClick={() => setEditWs(w)}>✎</button>
                  <button type="button" className="ws-icon-btn ws-icon-del" title="Delete" onClick={() => deleteWorkshop(w.id)}>🗑</button>
                </div>
              </div>

              {/* name */}
              <h3 className="ws-name">{w.name}</h3>

              {/* date + schedule */}
              <div className="ws-meta-row">
                {w.date     && <span className="ws-meta-item">📅 {fmtDate(w.date)}</span>}
                {w.schedule && <span className="ws-meta-item">🕐 {w.schedule}</span>}
              </div>

              {/* description */}
              {w.description && <p className="ws-description">{w.description}</p>}

              {/* guest */}
              {w.guestName && (
                <div className="ws-guest-row">
                  <Avatar name={w.guestName} size={32} />
                  <div className="ws-guest-info">
                    <span className="ws-guest-label">Guest Speaker</span>
                    <span className="ws-guest-name">{w.guestName}</span>
                  </div>
                  {w.guestLinkedin && (
                    <a
                      className="ws-linkedin-btn"
                      href={`https://${w.guestLinkedin.replace(/^https?:\/\//, '')}`}
                      target="_blank" rel="noreferrer"
                    >
                      in LinkedIn →
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
