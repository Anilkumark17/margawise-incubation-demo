import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Avatar, Badge, Button, Card } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

/* ── seed external session requests ── */
const SEED_REQUESTS = [
  { id: 'req-1', startup: 'AgriConnect', founder: 'Ananya Mehta', mentorId: 'mentor-1', mentorName: 'Dr. Priya Sharma', type: '60 min', topic: 'B2B SaaS go-to-market strategy for rural India', status: 'Pending', date: '2026-06-20', paymentStatus: 'Unpaid' },
  { id: 'req-2', startup: 'HealthPulse', founder: 'Rajan Nair', mentorId: 'mentor-3', mentorName: 'Elena Vasquez', type: '90 min', topic: 'Integrating AI diagnostics into our mobile app', status: 'Pending', date: '2026-06-21', paymentStatus: 'Unpaid' },
  { id: 'req-3', startup: 'FinBridge', founder: 'Sneha Pillai', mentorId: 'mentor-4', mentorName: 'Robert Kim', type: '30 min', topic: 'Fundraising pitch review before Series A', status: 'Accepted', date: '2026-06-18', paymentStatus: 'Paid' },
  { id: 'req-4', startup: 'EduSpark', founder: 'Dev Khanna', mentorId: 'mentor-2', mentorName: 'James Okafor', type: '60 min', topic: 'Product-led growth for EdTech', status: 'Rejected', date: '2026-06-17', paymentStatus: 'Unpaid' },
  { id: 'req-5', startup: 'LogiFlow', founder: 'Preet Sharma', mentorId: 'mentor-1', mentorName: 'Dr. Priya Sharma', type: '60 min', topic: 'Validating logistics SaaS assumptions with early customers', status: 'Pending', date: '2026-06-22', paymentStatus: 'Unpaid' },
]

const RATE_MAP = { 'mentor-1': 200, 'mentor-2': 175, 'mentor-3': 250, 'mentor-4': 300 }
const SESSION_PRICE = { '30 min': 0.5, '60 min': 1, '90 min': 1.5 }

function initPayments(mentors) {
  const map = {}
  ;(mentors || []).filter(Boolean).forEach((m) => { map[m.id] = { paid: 0 } })
  return map
}
function getDomains(mentors) {
  const s = new Set()
  mentors.forEach((m) => (m.industryExpertise || '').split(/,\s*/).forEach((d) => d && s.add(d.trim())))
  return ['All', ...Array.from(s)]
}
function getExpertiseTags(mentors) {
  const s = new Set()
  mentors.forEach((m) => (m.expertise || []).forEach((e) => s.add(e)))
  return ['All', ...Array.from(s)]
}
function toArr(expertise) {
  return Array.isArray(expertise) ? expertise : (expertise || '').split(/,\s*/).filter(Boolean)
}

const BLANK = { name: '', designation: '', industryExpertise: '', expertise: '', yearsExperience: '', hourlyCharge: '', bio: '', linkedin: '' }

/* ─────────────────────────────────────
   Modals
───────────────────────────────────── */
function MentorFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || BLANK)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  return (
    <div className="wr-modal-overlay" onClick={onClose}>
      <div className="wr-modal mm-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wr-modal-header">
          <h3>{initial ? 'Edit Mentor' : 'Add Mentor'}</h3>
          <button type="button" className="wr-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wr-modal-body mm-form-grid">
          <div className="mm-form-col">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Dr. Priya Sharma" />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Designation</label>
            <input className="form-input" value={form.designation} onChange={(e) => set('designation', e.target.value)} placeholder="e.g. Former VP Product, Stripe" />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Industry / Domain *</label>
            <input className="form-input" value={form.industryExpertise} onChange={(e) => set('industryExpertise', e.target.value)} placeholder="e.g. SaaS, FinTech" />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Expertise <span className="wr-label-hint">(comma-separated)</span></label>
            <input className="form-input" value={form.expertise} onChange={(e) => set('expertise', e.target.value)} placeholder="e.g. GTM, Product Management, AI" />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Years of Experience</label>
            <input className="form-input" type="number" value={form.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value)} placeholder="10" />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Hourly Rate (USD)</label>
            <input className="form-input" type="number" value={form.hourlyCharge} onChange={(e) => set('hourlyCharge', e.target.value)} placeholder="200" />
          </div>
          <div className="mm-form-col mm-form-full">
            <label className="form-label">LinkedIn URL</label>
            <input className="form-input" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/username" />
          </div>
          <div className="mm-form-col mm-form-full">
            <label className="form-label">Short Bio</label>
            <textarea className="form-input form-textarea" rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Briefly describe background and what they help with…" />
          </div>
        </div>
        <div className="wr-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!form.name.trim() || !form.industryExpertise.trim()} onClick={() => onSave(form)}>
            {initial ? 'Save Changes' : 'Add Mentor'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProfileModal({ mentor, payments, onClose, onMarkPaid, onEdit, assignedStartups }) {
  const rate = RATE_MAP[mentor.id] || Number(mentor.hourlyCharge) || 0
  const sessions = mentor.completedSessions || mentor.totalSessions || 0
  const total = sessions * rate
  const paid = payments[mentor.id]?.paid || 0
  const due = Math.max(0, total - paid)
  return (
    <div className="wr-modal-overlay" onClick={onClose}>
      <div className="mm-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wr-modal-header">
          <div className="mm-modal-title">
            <Avatar name={mentor.name} size={44} />
            <div>
              <h3>{mentor.name}</h3>
              <p className="text-muted sm">{mentor.designation}{mentor.yearsExperience ? ` · ${mentor.yearsExperience}y exp` : ''}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="secondary" onClick={() => onEdit(mentor)}>Edit</Button>
            <button type="button" className="wr-modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="mm-profile-body">
          <div className="mm-profile-main">
            {mentor.bio && <p className="mm-bio">{mentor.bio}</p>}
            <div className="mm-section">
              <span className="mm-section-label">Domain</span>
              <div className="mm-tag-row">
                {(mentor.industryExpertise || '').split(/,\s*/).filter(Boolean).map((d) => (
                  <span key={d} className="mm-tag mm-tag-domain">{d}</span>
                ))}
              </div>
            </div>
            <div className="mm-section">
              <span className="mm-section-label">Expertise</span>
              <div className="mm-tag-row">
                {toArr(mentor.expertise).map((e) => <span key={e} className="mm-tag">{e}</span>)}
              </div>
            </div>
            {mentor.techStack?.length > 0 && (
              <div className="mm-section">
                <span className="mm-section-label">Tech / Tools</span>
                <div className="mm-tag-row">
                  {mentor.techStack.map((t) => <span key={t} className="mm-tag mm-tag-tech">{t}</span>)}
                </div>
              </div>
            )}
            {assignedStartups?.length > 0 && (
              <div className="mm-section">
                <span className="mm-section-label">Assigned Startups</span>
                <div className="mm-tag-row">
                  {assignedStartups.map((s) => <span key={s.id} className="mm-tag mm-tag-startup">{s.name}</span>)}
                </div>
              </div>
            )}
            {mentor.linkedin && (
              <div className="mm-section">
                <span className="mm-section-label">LinkedIn</span>
                <a className="mm-link" href={`https://${mentor.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">🔗 {mentor.linkedin}</a>
              </div>
            )}
          </div>
          <div className="mm-profile-side">
            <div className="mm-stat-block"><span className="mm-stat-label">Sessions</span><span className="mm-stat-value">{sessions}</span></div>
            <div className="mm-stat-block"><span className="mm-stat-label">Upcoming</span><span className="mm-stat-value">{mentor.upcomingSessions || 0}</span></div>
            {mentor.rating && <div className="mm-stat-block"><span className="mm-stat-label">Rating</span><span className="mm-stat-value">⭐ {mentor.rating}</span></div>}
            <div className="mm-stat-block"><span className="mm-stat-label">Rate / hr</span><span className="mm-stat-value">${rate || '—'}</span></div>
            <hr className="mm-divider" />
            <div className="mm-payment-block">
              <div className="mm-payment-row"><span>Total Earned</span><strong>${total.toLocaleString()}</strong></div>
              <div className="mm-payment-row"><span>Paid Out</span><strong className="mm-paid">${paid.toLocaleString()}</strong></div>
              <div className="mm-payment-row mm-due-row"><span>Due</span><strong className="mm-due">${due.toLocaleString()}</strong></div>
              <Badge status={due === 0 ? 'Complete' : 'Pending'} />
              {due > 0 && <Button onClick={() => onMarkPaid(mentor.id, total)} style={{ marginTop: 10, width: '100%' }}>Mark Fully Paid</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssignModal({ mentor, startups, assigned, onToggle, onClose }) {
  const [q, setQ] = useState('')
  const visible = startups.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || (s.founderName || '').toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="wr-modal-overlay" onClick={onClose}>
      <div className="wr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wr-modal-header">
          <div>
            <p className="wr-modal-eyebrow">Assign Startup</p>
            <h3>{mentor.name}</h3>
          </div>
          <button type="button" className="wr-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wr-modal-body" style={{ gap: 10 }}>
          <input className="form-input" placeholder="Search startup…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          <div className="mm-assign-list">
            {visible.length === 0 && <p className="text-muted sm">No startups found.</p>}
            {visible.map((s) => {
              const isAssigned = assigned.includes(s.id)
              return (
                <button key={s.id} type="button" className={`mm-assign-row${isAssigned ? ' assigned' : ''}`} onClick={() => onToggle(s.id)}>
                  <div className="mm-assign-info">
                    <span className="mm-assign-name">{s.name}</span>
                    <span className="mm-assign-meta">{s.founderName} · {s.stage}</span>
                  </div>
                  <span className={`mm-assign-check${isAssigned ? ' on' : ''}`}>{isAssigned ? '✓' : '+'}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="wr-modal-footer">
          <span className="text-muted sm">{assigned.length} startup{assigned.length !== 1 ? 's' : ''} assigned</span>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   Main Page
═══════════════════════════════════ */
export default function MentorManagement() {
  const { data, updateMentorStatus, updateMentor } = useApp()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('internal')
  const [payments, setPayments] = useState(() => initPayments(data.mentors))
  const [extraMentors, setExtraMentors] = useState([])
  const [assignments, setAssignments] = useState({})   // { [mentorId]: startupId[] }
  const [requests, setRequests] = useState(SEED_REQUESTS)

  /* modals */
  const [profileOpen, setProfileOpen] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [assignTarget, setAssignTarget] = useState(null)   // mentor object

  /* internal filters */
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('All')
  const [expertiseFilter, setExpertiseFilter] = useState('All')

  /* external tab */
  const [extView, setExtView] = useState('database')
  const [extSearch, setExtSearch] = useState('')
  const [extProfileOpen, setExtProfileOpen] = useState(null)
  const [sendRequestModal, setSendRequestModal] = useState(null)
  const [reqForm, setReqForm] = useState({ startup: '', founder: '', type: '60 min', topic: '' })

  const allMentors = useMemo(() => [...(data.mentors || []).filter(Boolean), ...extraMentors], [data.mentors, extraMentors])
  const domains = useMemo(() => getDomains(allMentors), [allMentors])
  const expertiseTags = useMemo(() => getExpertiseTags(allMentors), [allMentors])

  /* ── CRUD ── */
  const handleCreate = (form) => {
    const id = `mentor-custom-${Date.now()}`
    setExtraMentors((p) => [...p, { id, name: form.name.trim(), designation: form.designation.trim(), industryExpertise: form.industryExpertise.trim(), expertise: toArr(form.expertise), yearsExperience: Number(form.yearsExperience) || 0, hourlyCharge: Number(form.hourlyCharge) || 0, bio: form.bio.trim(), linkedin: form.linkedin.trim(), totalSessions: 0, completedSessions: 0, upcomingSessions: 0, rating: null, status: 'Approved', revenue: 0, earnings: 0 }])
    setPayments((p) => ({ ...p, [id]: { paid: 0 } }))
    setShowCreateModal(false)
  }

  const handleEdit = (form) => {
    if (!editTarget) return
    const id = editTarget.id
    const patch = { name: form.name.trim(), designation: form.designation.trim(), industryExpertise: form.industryExpertise.trim(), expertise: typeof form.expertise === 'string' ? toArr(form.expertise) : form.expertise, yearsExperience: Number(form.yearsExperience) || editTarget.yearsExperience, hourlyCharge: Number(form.hourlyCharge) || editTarget.hourlyCharge, bio: form.bio.trim(), linkedin: form.linkedin.trim() }
    if (id.startsWith('mentor-custom-')) setExtraMentors((p) => p.map((m) => m.id !== id ? m : { ...m, ...patch }))
    else updateMentor(id, patch)
    setEditTarget(null)
    setProfileOpen(null)
  }

  const openEdit = (mentor) => {
    setProfileOpen(null)
    setEditTarget({ ...mentor, expertise: toArr(mentor.expertise).join(', ') })
  }

  const markPaid = (mentorId, amount) => {
    setPayments((p) => ({ ...p, [mentorId]: { paid: amount } }))
    setProfileOpen(null)
  }

  /* ── assignments ── */
  const toggleAssignment = (mentorId, startupId) => {
    setAssignments((prev) => {
      const current = prev[mentorId] || []
      const next = current.includes(startupId) ? current.filter((id) => id !== startupId) : [...current, startupId]
      return { ...prev, [mentorId]: next }
    })
  }

  /* ── requests ── */
  const updateRequest = (id, status) => setRequests((p) => p.map((r) => r.id === id ? { ...r, status } : r))
  const markRequestPaid = (id) => setRequests((p) => p.map((r) => r.id === id ? { ...r, paymentStatus: 'Paid' } : r))
  const submitRequest = () => {
    if (!sendRequestModal || !reqForm.startup.trim() || !reqForm.topic.trim()) return
    const rate = RATE_MAP[sendRequestModal.id] || Number(sendRequestModal.hourlyCharge) || 0
    setRequests((p) => [...p, { id: `req-${Date.now()}`, startup: reqForm.startup.trim(), founder: reqForm.founder.trim() || '—', mentorId: sendRequestModal.id, mentorName: sendRequestModal.name, type: reqForm.type, topic: reqForm.topic.trim(), status: 'Pending', date: new Date().toISOString().split('T')[0], paymentStatus: 'Unpaid', rate }])
    setSendRequestModal(null)
    setReqForm({ startup: '', founder: '', type: '60 min', topic: '' })
    setExtProfileOpen(null)
    setExtView('requests')
  }

  /* ── filtered ── */
  const filtered = useMemo(() => allMentors.filter((m) => {
    const s = search.toLowerCase()
    const ok1 = !s || m.name.toLowerCase().includes(s) || (m.designation || '').toLowerCase().includes(s)
    const ok2 = domainFilter === 'All' || (m.industryExpertise || '').toLowerCase().includes(domainFilter.toLowerCase())
    const ok3 = expertiseFilter === 'All' || toArr(m.expertise).some((e) => e.toLowerCase() === expertiseFilter.toLowerCase())
    return ok1 && ok2 && ok3
  }), [allMentors, search, domainFilter, expertiseFilter])

  /* ── stats ── */
  const totalSessions = allMentors.reduce((s, m) => s + (m.completedSessions || 0), 0)
  const totalDue = allMentors.reduce((s, m) => { const r = RATE_MAP[m.id] || Number(m.hourlyCharge) || 0; return s + Math.max(0, (m.completedSessions || 0) * r - (payments[m.id]?.paid || 0)) }, 0)
  const totalPaid = allMentors.reduce((s, m) => s + (payments[m.id]?.paid || 0), 0)
  const pendingRequests = requests.filter((r) => r.status === 'Pending').length

  return (
    <DashboardLayout role="incubation">

      {showCreateModal && <MentorFormModal onSave={handleCreate} onClose={() => setShowCreateModal(false)} />}
      {editTarget && <MentorFormModal initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} />}
      {profileOpen && (
        <ProfileModal
          mentor={profileOpen} payments={payments}
          onClose={() => setProfileOpen(null)}
          onMarkPaid={markPaid} onEdit={openEdit}
          assignedStartups={(assignments[profileOpen.id] || []).map((id) => data.startups.find((s) => s.id === id)).filter(Boolean)}
        />
      )}
      {assignTarget && (
        <AssignModal
          mentor={assignTarget}
          startups={data.startups || []}
          assigned={assignments[assignTarget.id] || []}
          onToggle={(sid) => toggleAssignment(assignTarget.id, sid)}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="mm-page-header">
        <div>
          <h2 className="mm-page-title">Mentorship</h2>
          <p className="text-muted sm">Manage mentors, assignments and external session requests</p>
        </div>
        {activeTab === 'internal' && <Button onClick={() => setShowCreateModal(true)}>+ Add Mentor</Button>}
      </div>

      {/* ── Stats ── */}
      <div className="mm-stats-row">
        <div className="mm-stat-pill"><span>Mentors</span><strong>{allMentors.length}</strong></div>
        <div className="mm-stat-pill"><span>Sessions</span><strong>{totalSessions}</strong></div>
        <div className="mm-stat-pill mm-stat-orange"><span>Due</span><strong>${totalDue.toLocaleString()}</strong></div>
        <div className="mm-stat-pill mm-stat-green"><span>Paid</span><strong>${totalPaid.toLocaleString()}</strong></div>
        <div className="mm-stat-pill mm-stat-amber"><span>Pending Requests</span><strong>{pendingRequests}</strong></div>
      </div>

      {/* ── Tabs ── */}
      <div className="mm-tabs">
        <button type="button" className={`mm-tab${activeTab === 'internal' ? ' active' : ''}`} onClick={() => setActiveTab('internal')}>
          Our Mentors <span className="mm-tab-count">{allMentors.length}</span>
        </button>
        <button type="button" className={`mm-tab${activeTab === 'external' ? ' active' : ''}`} onClick={() => setActiveTab('external')}>
          External Requests <span className="mm-tab-count">{pendingRequests}</span>
        </button>
      </div>

      {/* ══════════════════
          OUR MENTORS
      ══════════════════ */}
      {activeTab === 'internal' && (
        <>
          {/* compact filter bar */}
          <div className="mm-int-filters">
            <input className="form-input mm-search" placeholder="Search name or designation…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="form-input form-select" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
              {domains.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="form-input form-select" value={expertiseFilter} onChange={(e) => setExpertiseFilter(e.target.value)}>
              {expertiseTags.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>

          {filtered.length === 0
            ? <p className="text-muted sm" style={{ marginTop: 20 }}>No mentors match the current filters.</p>
            : (
            <div className="mm-mentor-grid">
              {filtered.map((m) => {
                const rate = RATE_MAP[m.id] || Number(m.hourlyCharge) || 0
                const sessions = m.completedSessions || m.totalSessions || 0
                const total = sessions * rate
                const paid = payments[m.id]?.paid || 0
                const due = Math.max(0, total - paid)
                const expertiseArr = toArr(m.expertise)
                const assignedIds = assignments[m.id] || []
                const assignedStartups = assignedIds.map((id) => data.startups?.find((s) => s.id === id)).filter(Boolean)

                return (
                  <div key={m.id} className="mm-card">

                    {/* ── head ── */}
                    <div className="mm-card-head">
                      <Avatar name={m.name} size={52} />
                      <div className="mm-card-info">
                        <span className="mm-card-name">{m.name}</span>
                        <span className="mm-card-desig">{m.designation || 'Mentor'}</span>
                        <div className="mm-card-domains">
                          {(m.industryExpertise || '').split(/,\s*/).filter(Boolean).map((d) => (
                            <span key={d} className="mm-tag mm-tag-domain">{d}</span>
                          ))}
                        </div>
                      </div>
                      <Badge status={m.status} />
                    </div>

                    {/* ── expertise chips ── */}
                    {expertiseArr.length > 0 && (
                      <div className="mm-card-expertise">
                        {expertiseArr.slice(0, 5).map((e) => <span key={e} className="mm-tag">{e}</span>)}
                        {expertiseArr.length > 5 && <span className="mm-tag-more">+{expertiseArr.length - 5}</span>}
                      </div>
                    )}

                    {/* ── metric row ── */}
                    <div className="mm-card-metrics">
                      <div className="mm-metric">
                        <span className="mm-metric-val">{sessions}</span>
                        <span className="mm-metric-key">Sessions</span>
                      </div>
                      <div className="mm-metric-sep" />
                      <div className="mm-metric">
                        <span className="mm-metric-val">{m.rating ? `⭐ ${m.rating}` : '—'}</span>
                        <span className="mm-metric-key">Rating</span>
                      </div>
                      <div className="mm-metric-sep" />
                      <div className="mm-metric">
                        <span className="mm-metric-val">${rate || '—'}</span>
                        <span className="mm-metric-key">per hour</span>
                      </div>
                    </div>

                    {/* ── assigned startups ── */}
                    <div className="mm-card-assigned">
                      <span className="mm-assigned-label">Assigned startups</span>
                      <div className="mm-assigned-chips">
                        {assignedStartups.length > 0
                          ? assignedStartups.map((s) => <span key={s.id} className="mm-tag mm-tag-startup">{s.name}</span>)
                          : <span className="mm-none-text">None assigned</span>
                        }
                        <button type="button" className="mm-assign-btn" onClick={() => setAssignTarget(m)}>
                          {assignedStartups.length > 0 ? '✎ Edit' : '+ Assign'}
                        </button>
                      </div>
                    </div>

                    {/* ── footer ── */}
                    <div className="mm-card-footer">
                      <div className="mm-card-payment">
                        {due === 0
                          ? <span className="mm-paid-label">✓ Fully paid</span>
                          : <><span className="mm-due-label">Due ${due.toLocaleString()}</span><button type="button" className="mm-pay-btn" onClick={() => markPaid(m.id, total)}>Mark Paid</button></>
                        }
                      </div>
                      <div className="mm-card-actions">
                        <button type="button" className="mm-action-btn" onClick={() => setProfileOpen(m)}>Profile</button>
                        <button type="button" className="mm-action-btn" onClick={() => openEdit(m)}>Edit</button>
                        {m.status !== 'Approved' && (
                          <button type="button" className="mm-action-btn mm-action-approve" onClick={() => updateMentorStatus(m.id, 'Approved')}>Approve</button>
                        )}
                        {m.status === 'Approved' && (
                          <button type="button" className="mm-action-btn mm-action-danger" onClick={() => updateMentorStatus(m.id, 'Suspended')}>Suspend</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════════
          EXTERNAL REQUESTS
      ══════════════════ */}
      {activeTab === 'external' && (
        <div className="mm-requests-section">

          {/* Send Request Modal */}
          {sendRequestModal && (
            <div className="wr-modal-overlay" onClick={() => setSendRequestModal(null)}>
              <div className="wr-modal mm-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wr-modal-header">
                  <div>
                    <p className="wr-modal-eyebrow">Request a Session</p>
                    <h3>{sendRequestModal.name}</h3>
                  </div>
                  <button type="button" className="wr-modal-close" onClick={() => setSendRequestModal(null)}>✕</button>
                </div>
                <div className="wr-modal-body mm-form-grid">
                  <div className="mm-form-col">
                    <label className="form-label">Startup Name *</label>
                    <input className="form-input" value={reqForm.startup} onChange={(e) => setReqForm((f) => ({ ...f, startup: e.target.value }))} placeholder="e.g. AgriConnect" />
                  </div>
                  <div className="mm-form-col">
                    <label className="form-label">Founder Name</label>
                    <input className="form-input" value={reqForm.founder} onChange={(e) => setReqForm((f) => ({ ...f, founder: e.target.value }))} placeholder="e.g. Ananya Mehta" />
                  </div>
                  <div className="mm-form-col mm-form-full">
                    <label className="form-label">Session Duration</label>
                    <select className="form-input form-select" value={reqForm.type} onChange={(e) => setReqForm((f) => ({ ...f, type: e.target.value }))}>
                      <option value="30 min">30 min — ${Math.round((RATE_MAP[sendRequestModal.id] || 0) * 0.5)}</option>
                      <option value="60 min">60 min — ${RATE_MAP[sendRequestModal.id] || 0}</option>
                      <option value="90 min">90 min — ${Math.round((RATE_MAP[sendRequestModal.id] || 0) * 1.5)}</option>
                    </select>
                  </div>
                  <div className="mm-form-col mm-form-full">
                    <label className="form-label">What do you need help with? *</label>
                    <textarea className="form-input form-textarea" rows={3} value={reqForm.topic} onChange={(e) => setReqForm((f) => ({ ...f, topic: e.target.value }))} placeholder="Describe the specific challenge or topic…" />
                  </div>
                </div>
                <div className="wr-modal-footer">
                  <Button variant="secondary" onClick={() => setSendRequestModal(null)}>Cancel</Button>
                  <Button disabled={!reqForm.startup.trim() || !reqForm.topic.trim()} onClick={submitRequest}>Send Request</Button>
                </div>
              </div>
            </div>
          )}

          {/* External Profile Modal */}
          {extProfileOpen && (
            <div className="wr-modal-overlay" onClick={() => setExtProfileOpen(null)}>
              <div className="mm-profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wr-modal-header">
                  <div className="mm-modal-title">
                    <Avatar name={extProfileOpen.name} size={44} />
                    <div>
                      <h3>{extProfileOpen.name}</h3>
                      <p className="text-muted sm">{extProfileOpen.designation}{extProfileOpen.yearsExperience ? ` · ${extProfileOpen.yearsExperience}y exp` : ''}</p>
                    </div>
                  </div>
                  <button type="button" className="wr-modal-close" onClick={() => setExtProfileOpen(null)}>✕</button>
                </div>
                <div className="mm-profile-body">
                  <div className="mm-profile-main">
                    {extProfileOpen.bio && <p className="mm-bio">{extProfileOpen.bio}</p>}
                    <div className="mm-section">
                      <span className="mm-section-label">Domain</span>
                      <div className="mm-tag-row">{(extProfileOpen.industryExpertise || '').split(/,\s*/).filter(Boolean).map((d) => <span key={d} className="mm-tag mm-tag-domain">{d}</span>)}</div>
                    </div>
                    <div className="mm-section">
                      <span className="mm-section-label">Expertise</span>
                      <div className="mm-tag-row">{toArr(extProfileOpen.expertise).map((e) => <span key={e} className="mm-tag">{e}</span>)}</div>
                    </div>
                    {extProfileOpen.linkedin && (
                      <div className="mm-section">
                        <span className="mm-section-label">LinkedIn</span>
                        <a className="mm-link" href={`https://${extProfileOpen.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">🔗 {extProfileOpen.linkedin}</a>
                      </div>
                    )}
                  </div>
                  <div className="mm-profile-side">
                    <div className="mm-stat-block"><span className="mm-stat-label">Sessions Done</span><span className="mm-stat-value">{extProfileOpen.completedSessions || extProfileOpen.totalSessions || 0}</span></div>
                    {extProfileOpen.rating && <div className="mm-stat-block"><span className="mm-stat-label">Rating</span><span className="mm-stat-value">⭐ {extProfileOpen.rating}</span></div>}
                    <div className="mm-stat-block"><span className="mm-stat-label">Rate / hr</span><span className="mm-stat-value">${RATE_MAP[extProfileOpen.id] || extProfileOpen.hourlyCharge || '—'}</span></div>
                    <hr className="mm-divider" />
                    <Button style={{ width: '100%' }} onClick={() => { setSendRequestModal(extProfileOpen); setExtProfileOpen(null) }}>Request a Session →</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tabs */}
          <div className="mm-sub-tabs">
            <button type="button" className={`mm-sub-tab${extView === 'database' ? ' active' : ''}`} onClick={() => setExtView('database')}>Mentor Database</button>
            <button type="button" className={`mm-sub-tab${extView === 'requests' ? ' active' : ''}`} onClick={() => setExtView('requests')}>
              All Requests <span className="mm-tab-count">{requests.length}</span>
            </button>
          </div>

          {extView === 'database' && (() => {
            const approved = allMentors.filter((m) => m.status === 'Approved')
            const q = extSearch.toLowerCase()
            const dbFiltered = approved.filter((m) => !q || m.name.toLowerCase().includes(q) || (m.designation || '').toLowerCase().includes(q) || (m.industryExpertise || '').toLowerCase().includes(q))
            return (
              <>
                <div className="mm-ext-search-row">
                  <input className="form-input mm-ext-search" placeholder="Search by name, designation or domain…" value={extSearch} onChange={(e) => setExtSearch(e.target.value)} />
                  <span className="text-muted sm">{dbFiltered.length} mentor{dbFiltered.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="mm-ext-grid">
                  {dbFiltered.map((m) => {
                    const rate = RATE_MAP[m.id] || m.hourlyCharge || 0
                    return (
                      <div key={m.id} className="mm-ext-card">
                        <div className="mm-ext-card-top">
                          <Avatar name={m.name} size={44} />
                          <div className="mm-ext-card-info">
                            <span className="mm-card-name">{m.name}</span>
                            <span className="mm-card-desig">{m.designation}</span>
                            {m.rating && <span className="mm-ext-rating">⭐ {m.rating}</span>}
                          </div>
                        </div>
                        <div className="mm-ext-domains">{(m.industryExpertise || '').split(/,\s*/).filter(Boolean).map((d) => <span key={d} className="mm-tag mm-tag-domain">{d}</span>)}</div>
                        <div className="mm-ext-expertise">{toArr(m.expertise).slice(0, 4).map((e) => <span key={e} className="mm-tag">{e}</span>)}</div>
                        <div className="mm-ext-footer">
                          <span className="mm-ext-rate">${rate}/hr</span>
                          <div className="mm-ext-actions">
                            <button type="button" className="mm-ext-profile-btn" onClick={() => setExtProfileOpen(m)}>View Profile</button>
                            <button type="button" className="mm-ext-req-btn" onClick={() => setSendRequestModal(m)}>Request Session</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {dbFiltered.length === 0 && <p className="text-muted sm" style={{ gridColumn: '1/-1', padding: '20px 0' }}>No mentors match your search.</p>}
                </div>
              </>
            )
          })()}

          {extView === 'requests' && (
            <Card className="section-card">
              <div className="section-header">
                <h3>All Session Requests</h3>
                <span className="text-muted sm">{requests.length} total · {pendingRequests} pending</span>
              </div>
              {requests.length === 0
                ? <p className="text-muted sm" style={{ padding: '16px 0' }}>No requests yet.</p>
                : (
                <div className="mm-req-list">
                  {requests.map((req) => {
                    const rate = req.rate || RATE_MAP[req.mentorId] || 0
                    const cost = Math.round(rate * (SESSION_PRICE[req.type] || 1))
                    return (
                      <div key={req.id} className={`mm-req-row mm-req-${req.status.toLowerCase()}`}>
                        <div className="mm-req-left">
                          <div className="mm-req-top">
                            <span className="mm-req-startup">{req.startup}</span>
                            <span className="mm-req-founder">by {req.founder}</span>
                            <Badge status={req.status} />
                          </div>
                          <p className="mm-req-topic">"{req.topic}"</p>
                          <div className="mm-req-meta">
                            <span>→ {req.mentorName}</span>
                            <span>· {req.type}</span>
                            <span>· ${cost}</span>
                            <span>· {req.date}</span>
                            {req.status === 'Accepted' && (
                              <span className={`mm-pay-status ${req.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}`}>
                                {req.paymentStatus === 'Paid' ? '✓ Payment received' : '⏳ Pending payment'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mm-req-actions">
                          {req.status === 'Pending' && (
                            <><Button size="sm" onClick={() => updateRequest(req.id, 'Accepted')}>Accept</Button><Button size="sm" variant="danger" onClick={() => updateRequest(req.id, 'Rejected')}>Reject</Button></>
                          )}
                          {req.status === 'Accepted' && req.paymentStatus !== 'Paid' && (
                            <button type="button" className="mm-pay-btn" onClick={() => markRequestPaid(req.id)}>Mark Paid</button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
