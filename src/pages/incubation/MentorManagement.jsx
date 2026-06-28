import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Avatar, Badge, Button, Card } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

const SEED_REQUESTS = [
  { id: 'req-1', startup: 'AgriConnect', founder: 'Ananya Mehta', mentorId: 'mentor-3', mentorName: 'Elena Vasquez', type: '60 min', topic: 'B2B SaaS go-to-market strategy for rural India', status: 'Pending', date: '2026-06-20', paymentStatus: 'Unpaid' },
  { id: 'req-2', startup: 'HealthPulse', founder: 'Rajan Nair', mentorId: 'mentor-3', mentorName: 'Elena Vasquez', type: '90 min', topic: 'Integrating AI diagnostics into our mobile app', status: 'Pending', date: '2026-06-21', paymentStatus: 'Unpaid' },
  { id: 'req-3', startup: 'FinBridge', founder: 'Sneha Pillai', mentorId: 'mentor-4', mentorName: 'Robert Kim', type: '30 min', topic: 'Fundraising pitch review before Series A', status: 'Accepted', date: '2026-06-18', paymentStatus: 'Paid' },
  { id: 'req-4', startup: 'EduSpark', founder: 'Dev Khanna', mentorId: 'mentor-2', mentorName: 'James Okafor', type: '60 min', topic: 'Product-led growth for EdTech', status: 'Rejected', date: '2026-06-17', paymentStatus: 'Unpaid' },
  { id: 'req-5', startup: 'LogiFlow', founder: 'Preet Sharma', mentorId: 'mentor-4', mentorName: 'Robert Kim', type: '60 min', topic: 'Validating logistics SaaS assumptions with early customers', status: 'Pending', date: '2026-06-22', paymentStatus: 'Unpaid' },
]

const RATE_MAP = { 'mentor-1': 200, 'mentor-2': 175, 'mentor-3': 250, 'mentor-4': 300 }
const SESSION_PRICE = { '30 min': 0.5, '60 min': 1, '90 min': 1.5 }
const TYPE_FILTERS = [
  { id: 'all', label: 'All Mentors' },
  { id: 'internal', label: 'Internal Mentors' },
  { id: 'external', label: 'External Mentors' },
]

const EMPTY_PROJECT = { title: '', domain: '', outcome: '' }
const EMPTY_WORK = { company: '', role: '', duration: '', summary: '' }
const EMPTY_DOMAIN_ENTRY = { domain: '', startups: '' }

const EXTERNAL_ONBOARD_BLANK = {
  mentorId: '',
  mentorName: '',
  email: '',
  linkedin: '',
  designation: '',
  industryExpertise: '',
  expertiseNeeded: '',
  yearsExperience: '',
  compensationOffer: '',
  cohortNeed: '',
  details: '',
}

const SENT_REQUEST_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Awaiting Mentor' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'closed', label: 'Rejected / Cancelled' },
]

const PAGE_TABS = [
  { id: 'mentors', label: 'Mentors' },
  { id: 'requests', label: 'Requests' },
]

const REQUEST_TYPE_TABS = [
  { id: 'onboard', label: 'Onboard Requests' },
  { id: 'sessions', label: 'Session Requests' },
]

const SEED_ONBOARD_REQUESTS = [
  {
    id: 'ob-1',
    mentorId: 'mentor-3',
    mentorName: 'Elena Vasquez',
    email: 'elena.vasquez@aimentor.io',
    linkedin: 'linkedin.com/in/elenavasquez',
    designation: 'AI Research Lead',
    industryExpertise: 'AI/ML, Enterprise',
    expertiseNeeded: 'AI, Product Management, Startup Validation',
    yearsExperience: 12,
    compensationOffer: '$250/hr · 6 sessions/month',
    cohortNeed: 'HealthPulse, AgriConnect',
    details: 'Need weekly AI product mentoring for two startups in our current cohort.',
    status: 'Pending',
    date: '2026-06-19',
  },
  {
    id: 'ob-2',
    mentorId: 'mentor-4',
    mentorName: 'Robert Kim',
    email: 'robert.kim@sequoia.com',
    linkedin: 'linkedin.com/in/robertkim',
    designation: 'Partner, Sequoia Scout',
    industryExpertise: 'Venture Capital',
    expertiseNeeded: 'Fundraising, Sales, B2B Sales',
    yearsExperience: 20,
    compensationOffer: '$300/hr · 4 sessions',
    cohortNeed: 'FinBridge',
    details: 'Fundraising prep and pitch review for our fintech cohort.',
    status: 'Accepted',
    mentorRespondedAt: '2026-06-17',
    date: '2026-06-14',
  },
  {
    id: 'ob-3',
    mentorId: 'mentor-3',
    mentorName: 'Elena Vasquez',
    email: 'elena.vasquez@aimentor.io',
    linkedin: 'linkedin.com/in/elenavasquez',
    designation: 'AI Research Lead',
    industryExpertise: 'AI/ML, Enterprise',
    expertiseNeeded: 'AI, Product Management',
    yearsExperience: 12,
    compensationOffer: '$200/hr · 3 sessions',
    cohortNeed: 'EduSpark',
    details: 'One-time workshop on responsible AI for edtech founders.',
    status: 'Rejected',
    mentorRespondedAt: '2026-06-16',
    date: '2026-06-10',
  },
]

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
function matchesMentorFilters(m, search, domainFilter, expertiseFilter) {
  const s = search.toLowerCase()
  const ok1 = !s || m.name.toLowerCase().includes(s) || (m.designation || '').toLowerCase().includes(s)
  const ok2 = domainFilter === 'All' || (m.industryExpertise || '').toLowerCase().includes(domainFilter.toLowerCase())
  const ok3 = expertiseFilter === 'All' || toArr(m.expertise).some((e) => e.toLowerCase() === expertiseFilter.toLowerCase())
  return ok1 && ok2 && ok3
}

function calcMentorSuccessRate(mentor) {
  const entries = mentor.previousStartupsByDomain || []
  const guidedCount = entries.reduce(
    (n, e) => n + (e.startups || '').split(',').map((s) => s.trim()).filter(Boolean).length,
    0
  )
  const revenue = mentor.revenue || 0
  if (!guidedCount || !revenue) return { rate: null, revenue, guidedCount }
  const benchmark = 120000
  const rate = Math.min(100, Math.round((revenue / (guidedCount * benchmark)) * 100))
  return { rate, revenue, guidedCount }
}

function getMentorRequestDisplay(mentor) {
  if (!mentor) return {}
  return {
    mentorName: mentor.name || mentor.mentorName || '',
    email: mentor.email || '',
    designation: mentor.designation || '',
    industryExpertise: mentor.industryExpertise || '',
    expertiseNeeded: toArr(mentor.expertise).join(', ') || mentor.expertiseNeeded || '',
    yearsExperience: mentor.yearsExperience ?? '',
    linkedin: mentor.linkedin || '',
  }
}

function InternalOnboardModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    email: initial?.email || '',
    designation: initial?.designation || '',
    industryExpertise: initial?.industryExpertise || '',
    expertise: initial?.expertise || '',
    yearsExperience: initial?.yearsExperience ?? '',
    hourlyCharge: initial?.hourlyCharge ?? '',
    bio: initial?.bio || '',
    linkedin: initial?.linkedin || '',
  }))
  const [projects, setProjects] = useState(
    initial?.projectHighlights?.length ? initial.projectHighlights : [{ ...EMPTY_PROJECT }]
  )
  const [workExperience, setWorkExperience] = useState(
    initial?.workExperience?.length ? initial.workExperience : [{ ...EMPTY_WORK }]
  )
  const [workedStartups, setWorkedStartups] = useState(
    initial?.previousStartupsByDomain?.length ? initial.previousStartupsByDomain : [{ ...EMPTY_DOMAIN_ENTRY }]
  )

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const cleanAndSave = () => {
    onSave({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      designation: form.designation.trim(),
      industryExpertise: form.industryExpertise.trim(),
      expertise: toArr(form.expertise),
      yearsExperience: Number(form.yearsExperience) || 0,
      hourlyCharge: Number(form.hourlyCharge) || 0,
      bio: form.bio.trim(),
      linkedin: form.linkedin.trim(),
      projectHighlights: projects
        .map((p) => ({ title: p.title.trim(), domain: p.domain.trim(), outcome: p.outcome.trim() }))
        .filter((p) => p.title || p.domain || p.outcome),
      workExperience: workExperience
        .map((w) => ({
          company: w.company.trim(),
          role: w.role.trim(),
          duration: w.duration.trim(),
          summary: w.summary.trim(),
        }))
        .filter((w) => w.company || w.role || w.duration || w.summary),
      previousStartupsByDomain: workedStartups
        .map((e) => ({ domain: e.domain.trim(), startups: e.startups.trim() }))
        .filter((e) => e.domain || e.startups),
    })
  }

  return (
    <div className="wr-modal-overlay" onClick={onClose}>
      <div className="wr-modal mm-form-modal mm-onboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wr-modal-header">
          <div>
            <p className="wr-modal-eyebrow">Internal onboarding</p>
            <h3>{initial ? 'Edit Internal Mentor' : 'Onboard Internal Mentor'}</h3>
          </div>
          <button type="button" className="wr-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wr-modal-body mm-onboard-body">
          <div className="mm-onboard-section">
            <h4>Account & Profile</h4>
            <div className="mm-form-grid">
              <div className="mm-form-col">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Dr. Priya Sharma" />
              </div>
              <div className="mm-form-col">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="mentor@incubator.com" />
              </div>
              <div className="mm-form-col">
                <label className="form-label">Designation</label>
                <input className="form-input" value={form.designation} onChange={(e) => set('designation', e.target.value)} placeholder="Former VP Product, Stripe" />
              </div>
              <div className="mm-form-col">
                <label className="form-label">Years of Experience</label>
                <input className="form-input" type="number" value={form.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value)} placeholder="10" />
              </div>
              <div className="mm-form-col">
                <label className="form-label">Industry / Domain *</label>
                <input className="form-input" value={form.industryExpertise} onChange={(e) => set('industryExpertise', e.target.value)} placeholder="SaaS, FinTech" />
              </div>
              <div className="mm-form-col">
                <label className="form-label">Expertise <span className="wr-label-hint">(comma-separated)</span></label>
                <input className="form-input" value={form.expertise} onChange={(e) => set('expertise', e.target.value)} placeholder="GTM, Product Management" />
              </div>
              <div className="mm-form-col">
                <label className="form-label">Hourly Rate (USD)</label>
                <input className="form-input" type="number" value={form.hourlyCharge} onChange={(e) => set('hourlyCharge', e.target.value)} placeholder="200" />
              </div>
              <div className="mm-form-col">
                <label className="form-label">LinkedIn</label>
                <input className="form-input" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/username" />
              </div>
              <div className="mm-form-col mm-form-full">
                <label className="form-label">Bio</label>
                <textarea className="form-input form-textarea" rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Background and mentoring focus…" />
              </div>
            </div>
          </div>

          <div className="mm-onboard-section">
            <div className="mm-onboard-section-head">
              <h4>Key Projects</h4>
              <Button size="sm" variant="secondary" onClick={() => setProjects((p) => [...p, { ...EMPTY_PROJECT }])}>+ Add Project</Button>
            </div>
            {projects.map((project, index) => (
              <div key={`project-${index}`} className="mm-repeat-card">
                <div className="mm-form-grid">
                  <div className="mm-form-col">
                    <label className="form-label">Project Title</label>
                    <input className="form-input" value={project.title} onChange={(e) => setProjects((p) => p.map((row, i) => i === index ? { ...row, title: e.target.value } : row))} />
                  </div>
                  <div className="mm-form-col">
                    <label className="form-label">Domain</label>
                    <input className="form-input" value={project.domain} onChange={(e) => setProjects((p) => p.map((row, i) => i === index ? { ...row, domain: e.target.value } : row))} />
                  </div>
                  <div className="mm-form-col mm-form-full">
                    <label className="form-label">Outcome / Impact</label>
                    <input className="form-input" value={project.outcome} onChange={(e) => setProjects((p) => p.map((row, i) => i === index ? { ...row, outcome: e.target.value } : row))} />
                  </div>
                </div>
                <Button size="sm" variant="danger" onClick={() => setProjects((p) => p.length === 1 ? [{ ...EMPTY_PROJECT }] : p.filter((_, i) => i !== index))}>Remove</Button>
              </div>
            ))}
          </div>

          <div className="mm-onboard-section">
            <div className="mm-onboard-section-head">
              <h4>Work Experience</h4>
              <Button size="sm" variant="secondary" onClick={() => setWorkExperience((p) => [...p, { ...EMPTY_WORK }])}>+ Add Experience</Button>
            </div>
            {workExperience.map((job, index) => (
              <div key={`work-${index}`} className="mm-repeat-card">
                <div className="mm-form-grid">
                  <div className="mm-form-col">
                    <label className="form-label">Company</label>
                    <input className="form-input" value={job.company} onChange={(e) => setWorkExperience((p) => p.map((row, i) => i === index ? { ...row, company: e.target.value } : row))} />
                  </div>
                  <div className="mm-form-col">
                    <label className="form-label">Role</label>
                    <input className="form-input" value={job.role} onChange={(e) => setWorkExperience((p) => p.map((row, i) => i === index ? { ...row, role: e.target.value } : row))} />
                  </div>
                  <div className="mm-form-col">
                    <label className="form-label">Duration</label>
                    <input className="form-input" value={job.duration} onChange={(e) => setWorkExperience((p) => p.map((row, i) => i === index ? { ...row, duration: e.target.value } : row))} placeholder="2018 – 2023" />
                  </div>
                  <div className="mm-form-col mm-form-full">
                    <label className="form-label">Summary</label>
                    <input className="form-input" value={job.summary} onChange={(e) => setWorkExperience((p) => p.map((row, i) => i === index ? { ...row, summary: e.target.value } : row))} />
                  </div>
                </div>
                <Button size="sm" variant="danger" onClick={() => setWorkExperience((p) => p.length === 1 ? [{ ...EMPTY_WORK }] : p.filter((_, i) => i !== index))}>Remove</Button>
              </div>
            ))}
          </div>

          <div className="mm-onboard-section">
            <div className="mm-onboard-section-head">
              <h4>Previously Mentored Startups (by Domain)</h4>
              <Button size="sm" variant="secondary" onClick={() => setWorkedStartups((p) => [...p, { ...EMPTY_DOMAIN_ENTRY }])}>+ Add Domain</Button>
            </div>
            {workedStartups.map((entry, index) => (
              <div key={`domain-${index}`} className="mm-repeat-card">
                <div className="mm-form-grid">
                  <div className="mm-form-col">
                    <label className="form-label">Domain</label>
                    <input className="form-input" value={entry.domain} onChange={(e) => setWorkedStartups((p) => p.map((row, i) => i === index ? { ...row, domain: e.target.value } : row))} />
                  </div>
                  <div className="mm-form-col">
                    <label className="form-label">Startups</label>
                    <input className="form-input" value={entry.startups} onChange={(e) => setWorkedStartups((p) => p.map((row, i) => i === index ? { ...row, startups: e.target.value } : row))} placeholder="Startup A, Startup B" />
                  </div>
                </div>
                <Button size="sm" variant="danger" onClick={() => setWorkedStartups((p) => p.length === 1 ? [{ ...EMPTY_DOMAIN_ENTRY }] : p.filter((_, i) => i !== index))}>Remove</Button>
              </div>
            ))}
          </div>
        </div>
        <div className="wr-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!form.name.trim() || !form.email.trim() || !form.industryExpertise.trim()} onClick={cleanAndSave}>
            {initial ? 'Save Changes' : 'Create Internal Account'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ExternalOnboardModal({ mentor, form, setForm, onClose, onSubmit }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const display = getMentorRequestDisplay(mentor)

  return (
    <div className="wr-modal-overlay" onClick={onClose}>
      <div className="wr-modal mm-form-modal mm-onboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wr-modal-header">
          <div>
            <p className="wr-modal-eyebrow">Send request to external mentor</p>
            <h3>Request {display.mentorName || 'External Mentor'}</h3>
          </div>
          <button type="button" className="wr-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wr-modal-body mm-onboard-body">
          <div className="mm-onboard-section">
            <h4>Mentor Details</h4>
            <div className="mm-readonly-grid">
              <div className="mm-readonly-field">
                <span className="mm-readonly-label">Name</span>
                <span className="mm-readonly-value">{display.mentorName || '—'}</span>
              </div>
              <div className="mm-readonly-field">
                <span className="mm-readonly-label">Email</span>
                <span className="mm-readonly-value">{display.email || '—'}</span>
              </div>
              <div className="mm-readonly-field">
                <span className="mm-readonly-label">Designation</span>
                <span className="mm-readonly-value">{display.designation || '—'}</span>
              </div>
              <div className="mm-readonly-field">
                <span className="mm-readonly-label">Industry / Domain</span>
                <span className="mm-readonly-value">{display.industryExpertise || '—'}</span>
              </div>
              <div className="mm-readonly-field mm-readonly-full">
                <span className="mm-readonly-label">Expertise</span>
                <span className="mm-readonly-value">{display.expertiseNeeded || '—'}</span>
              </div>
              {display.yearsExperience !== '' && display.yearsExperience != null ? (
                <div className="mm-readonly-field">
                  <span className="mm-readonly-label">Experience</span>
                  <span className="mm-readonly-value">{display.yearsExperience} years</span>
                </div>
              ) : null}
              {display.linkedin ? (
                <div className="mm-readonly-field mm-readonly-full">
                  <span className="mm-readonly-label">LinkedIn</span>
                  <span className="mm-readonly-value">{display.linkedin}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mm-onboard-section">
            <h4>Your Request</h4>
            <div className="mm-form-grid">
              <div className="mm-form-col mm-form-full">
                <label className="form-label">Compensation Offer *</label>
                <input className="form-input" value={form.compensationOffer} onChange={(e) => set('compensationOffer', e.target.value)} placeholder="$200/hr · 6 sessions" />
              </div>
              <div className="mm-form-col mm-form-full">
                <label className="form-label">Cohort / Startups Needing Support</label>
                <input className="form-input" value={form.cohortNeed} onChange={(e) => set('cohortNeed', e.target.value)} placeholder="Which startups or cohort batch?" />
              </div>
              <div className="mm-form-col mm-form-full">
                <label className="form-label">Detailed Requirements *</label>
                <textarea className="form-input form-textarea" rows={4} value={form.details} onChange={(e) => set('details', e.target.value)} placeholder="Describe mentorship scope, expectations, deliverables…" />
              </div>
            </div>
          </div>
        </div>
        <div className="wr-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!form.compensationOffer.trim() || !form.details.trim()}
            onClick={onSubmit}
          >
            Send Request
          </Button>
        </div>
      </div>
    </div>
  )
}

function OnboardRequestViewModal({ request, onClose }) {
  if (!request) return null
  return (
    <div className="wr-modal-overlay" onClick={onClose}>
      <div className="wr-modal mm-form-modal mm-onboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wr-modal-header">
          <div>
            <p className="wr-modal-eyebrow">Sent request details</p>
            <h3>{request.mentorName}</h3>
          </div>
          <button type="button" className="wr-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wr-modal-body mm-onboard-body">
          <div className="mm-onboard-section">
            <h4>Mentor</h4>
            <div className="mm-readonly-grid">
              <div className="mm-readonly-field"><span className="mm-readonly-label">Name</span><span className="mm-readonly-value">{request.mentorName}</span></div>
              <div className="mm-readonly-field"><span className="mm-readonly-label">Email</span><span className="mm-readonly-value">{request.email || '—'}</span></div>
              <div className="mm-readonly-field"><span className="mm-readonly-label">Domain</span><span className="mm-readonly-value">{request.industryExpertise || '—'}</span></div>
              <div className="mm-readonly-field mm-readonly-full"><span className="mm-readonly-label">Expertise</span><span className="mm-readonly-value">{request.expertiseNeeded || '—'}</span></div>
            </div>
          </div>
          <div className="mm-onboard-section">
            <h4>Your Request</h4>
            <div className="mm-readonly-grid">
              <div className="mm-readonly-field mm-readonly-full"><span className="mm-readonly-label">Compensation Offer</span><span className="mm-readonly-value">{request.compensationOffer}</span></div>
              <div className="mm-readonly-field mm-readonly-full"><span className="mm-readonly-label">Cohort / Startups</span><span className="mm-readonly-value">{request.cohortNeed || '—'}</span></div>
              <div className="mm-readonly-field mm-readonly-full"><span className="mm-readonly-label">Requirements</span><span className="mm-readonly-value">{request.details}</span></div>
              <div className="mm-readonly-field"><span className="mm-readonly-label">Sent</span><span className="mm-readonly-value">{request.date}</span></div>
              <div className="mm-readonly-field"><span className="mm-readonly-label">Status</span><span className="mm-readonly-value">{request.status}</span></div>
              {request.mentorRespondedAt && (
                <div className="mm-readonly-field"><span className="mm-readonly-label">Mentor responded</span><span className="mm-readonly-value">{request.mentorRespondedAt}</span></div>
              )}
            </div>
          </div>
        </div>
        <div className="wr-modal-footer">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

function ProfileModal({ mentor, payments, onClose, onMarkPaid, onEdit, onRequestExternal, assignedStartups, mentorRequests, onboardRequestsForMentor, onRequestAction, onMarkRequestPaid, onViewOnboardRequest, onCancelOnboardRequest }) {
  const rate = RATE_MAP[mentor.id] || Number(mentor.hourlyCharge) || 0
  const sessions = mentor.completedSessions || mentor.totalSessions || 0
  const total = sessions * rate
  const paid = payments[mentor.id]?.paid || 0
  const due = Math.max(0, total - paid)
  const success = calcMentorSuccessRate(mentor)
  const projects = mentor.projectHighlights || []
  const workExperience = mentor.workExperience || []
  const guidedStartups = mentor.previousStartupsByDomain || []
  return (
    <div className="wr-modal-overlay" onClick={onClose}>
      <div className="mm-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wr-modal-header">
          <div className="mm-modal-title">
            <Avatar name={mentor.name} size={44} />
            <div>
              <h3>
                {mentor.isInternal && <span className="mm-internal-badge mm-inline-badge" title="Internal">I</span>}
                {mentor.name}
              </h3>
              <p className="text-muted sm">{mentor.designation}{mentor.yearsExperience ? ` · ${mentor.yearsExperience}y exp` : ''}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {mentor.isInternal && <Button size="sm" variant="secondary" onClick={() => onEdit(mentor)}>Edit</Button>}
            {!mentor.isInternal && (
              <Button size="sm" onClick={() => { onClose(); onRequestExternal(mentor) }}>Request External</Button>
            )}
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
            {guidedStartups.length > 0 && (
              <div className="mm-section">
                <span className="mm-section-label">Startups Guided</span>
                <div className="mm-guided-list">
                  {guidedStartups.map((entry) => (
                    <div key={entry.domain} className="mm-guided-row">
                      <span className="mm-guided-domain">{entry.domain}</span>
                      <span className="mm-guided-startups">{entry.startups}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {projects.length > 0 && (
              <div className="mm-section">
                <span className="mm-section-label">Key Projects</span>
                <div className="mm-project-list">
                  {projects.map((p) => (
                    <div key={p.title} className="mm-project-row">
                      <strong>{p.title}</strong>
                      <span className="text-muted sm">{p.domain}{p.outcome ? ` · ${p.outcome}` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {workExperience.length > 0 && (
              <div className="mm-section">
                <span className="mm-section-label">Work Experience</span>
                <div className="mm-work-list">
                  {workExperience.map((job, i) => (
                    <div key={`${job.company}-${i}`} className="mm-work-row">
                      <div className="mm-work-head">
                        <strong>{job.role}</strong>
                        <span className="text-muted sm">{job.duration}</span>
                      </div>
                      <span className="mm-work-company">{job.company}</span>
                      {job.summary && <p className="text-muted sm mm-work-summary">{job.summary}</p>}
                    </div>
                  ))}
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
            {onboardRequestsForMentor?.length > 0 && (
              <div className="mm-section">
                <span className="mm-section-label">Requests You Sent</span>
                <div className="mm-req-list mm-req-list-compact">
                  {onboardRequestsForMentor.map((req) => (
                    <div key={req.id} className={`mm-req-row mm-req-${req.status.toLowerCase()}`}>
                      <div className="mm-req-left">
                        <div className="mm-req-top">
                          <span className="mm-req-startup">{req.compensationOffer}</span>
                          <Badge status={req.status} />
                        </div>
                        <p className="mm-req-topic">{req.details}</p>
                        <div className="mm-req-meta">
                          {req.cohortNeed && <span>Cohort: {req.cohortNeed}</span>}
                          <span>Sent {req.date}</span>
                          {req.status === 'Pending' && <span className="text-muted sm">Awaiting mentor response</span>}
                          {req.status === 'Accepted' && (
                            <span className="mm-internal-note">Mentor accepted · now internal <span className="mm-internal-badge mm-inline-badge">I</span></span>
                          )}
                          {req.mentorRespondedAt && req.status !== 'Pending' && (
                            <span>Mentor responded {req.mentorRespondedAt}</span>
                          )}
                        </div>
                      </div>
                      <div className="mm-req-actions">
                        <Button size="sm" variant="secondary" onClick={() => onViewOnboardRequest(req)}>View</Button>
                        {req.status === 'Pending' && (
                          <Button size="sm" variant="danger" onClick={() => onCancelOnboardRequest(req.id)}>Cancel</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mentorRequests?.length > 0 && (
              <div className="mm-section">
                <span className="mm-section-label">Session Requests</span>
                <div className="mm-req-list mm-req-list-compact">
                  {mentorRequests.map((req) => {
                    const cost = Math.round((req.rate || RATE_MAP[req.mentorId] || 0) * (SESSION_PRICE[req.type] || 1))
                    return (
                      <div key={req.id} className={`mm-req-row mm-req-${req.status.toLowerCase()}`}>
                        <div className="mm-req-left">
                          <div className="mm-req-top">
                            <span className="mm-req-startup">{req.startup}</span>
                            <Badge status={req.status} />
                          </div>
                          <p className="mm-req-topic">"{req.topic}"</p>
                          <div className="mm-req-meta">
                            <span>{req.type} · ${cost} · {req.date}</span>
                          </div>
                        </div>
                        <div className="mm-req-actions">
                          {req.status === 'Pending' && (
                            <>
                              <Button size="sm" onClick={() => onRequestAction(req.id, 'Accepted')}>Accept</Button>
                              <Button size="sm" variant="danger" onClick={() => onRequestAction(req.id, 'Rejected')}>Reject</Button>
                            </>
                          )}
                          {req.status === 'Accepted' && req.paymentStatus !== 'Paid' && (
                            <button type="button" className="mm-pay-btn" onClick={() => onMarkRequestPaid(req.id)}>Mark Paid</button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="mm-profile-side">
            <div className="mm-stat-block"><span className="mm-stat-label">Sessions</span><span className="mm-stat-value">{sessions}</span></div>
            {mentor.rating && <div className="mm-stat-block"><span className="mm-stat-label">Rating</span><span className="mm-stat-value">⭐ {mentor.rating}</span></div>}
            <div className="mm-stat-block"><span className="mm-stat-label">Rate / hr</span><span className="mm-stat-value">${rate || '—'}</span></div>
            {success.rate != null && (
              <>
                <hr className="mm-divider" />
                <div className="mm-stat-block">
                  <span className="mm-stat-label">Success Rate</span>
                  <span className="mm-stat-value mm-success-rate">{success.rate}%</span>
                  <span className="text-muted sm mm-success-sub">
                    Based on ${success.revenue.toLocaleString()} mentored startup revenue · {success.guidedCount} startups
                  </span>
                </div>
              </>
            )}
            {mentor.isInternal && (
              <>
                <hr className="mm-divider" />
                <div className="mm-payment-block">
                  <div className="mm-payment-row"><span>Total Earned</span><strong>${total.toLocaleString()}</strong></div>
                  <div className="mm-payment-row"><span>Paid Out</span><strong className="mm-paid">${paid.toLocaleString()}</strong></div>
                  <div className="mm-payment-row mm-due-row"><span>Due</span><strong className="mm-due">${due.toLocaleString()}</strong></div>
                  {due > 0 && <Button onClick={() => onMarkPaid(mentor.id, total)} style={{ marginTop: 10, width: '100%' }}>Mark Fully Paid</Button>}
                </div>
              </>
            )}
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

function RequestModal({ mentor, form, setForm, onClose, onSubmit }) {
  const rate = RATE_MAP[mentor.id] || Number(mentor.hourlyCharge) || 0
  return (
    <div className="wr-modal-overlay" onClick={onClose}>
      <div className="wr-modal mm-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wr-modal-header">
          <div>
            <p className="wr-modal-eyebrow">Request a Session</p>
            <h3>{mentor.name}</h3>
          </div>
          <button type="button" className="wr-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wr-modal-body mm-form-grid">
          <div className="mm-form-col">
            <label className="form-label">Startup Name *</label>
            <input className="form-input" value={form.startup} onChange={(e) => setForm((f) => ({ ...f, startup: e.target.value }))} placeholder="e.g. AgriConnect" />
          </div>
          <div className="mm-form-col">
            <label className="form-label">Founder Name</label>
            <input className="form-input" value={form.founder} onChange={(e) => setForm((f) => ({ ...f, founder: e.target.value }))} placeholder="e.g. Ananya Mehta" />
          </div>
          <div className="mm-form-col mm-form-full">
            <label className="form-label">Session Duration</label>
            <select className="form-input form-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="30 min">30 min — ${Math.round(rate * 0.5)}</option>
              <option value="60 min">60 min — ${rate}</option>
              <option value="90 min">90 min — ${Math.round(rate * 1.5)}</option>
            </select>
          </div>
          <div className="mm-form-col mm-form-full">
            <label className="form-label">What do you need help with? *</label>
            <textarea className="form-input form-textarea" rows={3} value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="Describe the specific challenge or topic…" />
          </div>
        </div>
        <div className="wr-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!form.startup.trim() || !form.topic.trim()} onClick={onSubmit}>Send Request</Button>
        </div>
      </div>
    </div>
  )
}

export default function MentorManagement() {
  const { data, updateMentorStatus, updateMentor } = useApp()

  const [payments, setPayments] = useState(() => initPayments(data.mentors))
  const [extraMentors, setExtraMentors] = useState([])
  const [assignments, setAssignments] = useState({})
  const [requests, setRequests] = useState(SEED_REQUESTS)
  const [onboardRequests, setOnboardRequests] = useState(SEED_ONBOARD_REQUESTS)

  const [profileOpen, setProfileOpen] = useState(null)
  const [showInternalOnboard, setShowInternalOnboard] = useState(false)
  const [showExternalOnboard, setShowExternalOnboard] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [assignTarget, setAssignTarget] = useState(null)
  const [sendRequestModal, setSendRequestModal] = useState(null)
  const [reqForm, setReqForm] = useState({ startup: '', founder: '', type: '60 min', topic: '' })
  const [externalOnboardForm, setExternalOnboardForm] = useState({ ...EXTERNAL_ONBOARD_BLANK })
  const [externalOnboardTarget, setExternalOnboardTarget] = useState(null)
  const [sentRequestsTab, setSentRequestsTab] = useState('all')
  const [viewOnboardRequest, setViewOnboardRequest] = useState(null)
  const [activePage, setActivePage] = useState('mentors')
  const [requestTypeTab, setRequestTypeTab] = useState('onboard')
  const appliedAcceptanceRef = useRef(new Set())

  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('All')
  const [expertiseFilter, setExpertiseFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('all')

  const allMentors = useMemo(() => [...(data.mentors || []).filter(Boolean), ...extraMentors], [data.mentors, extraMentors])
  const domains = useMemo(() => getDomains(allMentors), [allMentors])
  const expertiseTags = useMemo(() => getExpertiseTags(allMentors), [allMentors])

  const requestsByMentor = useMemo(() => {
    const map = {}
    requests.forEach((req) => {
      if (!map[req.mentorId]) map[req.mentorId] = []
      map[req.mentorId].push(req)
    })
    Object.values(map).forEach((list) => list.sort((a, b) => b.date.localeCompare(a.date)))
    return map
  }, [requests])

  const onboardByMentor = useMemo(() => {
    const map = {}
    onboardRequests.forEach((req) => {
      if (!req.mentorId) return
      if (!map[req.mentorId]) map[req.mentorId] = []
      map[req.mentorId].push(req)
    })
    Object.values(map).forEach((list) => list.sort((a, b) => b.date.localeCompare(a.date)))
    return map
  }, [onboardRequests])

  const filteredMentors = useMemo(() => {
    let list = allMentors.filter((m) => matchesMentorFilters(m, search, domainFilter, expertiseFilter))
    if (typeFilter === 'internal') list = list.filter((m) => m.isInternal)
    if (typeFilter === 'external') list = list.filter((m) => !m.isInternal)
    return list.sort((a, b) => {
      if (a.isInternal && !b.isInternal) return -1
      if (!a.isInternal && b.isInternal) return 1
      return a.name.localeCompare(b.name)
    })
  }, [allMentors, search, domainFilter, expertiseFilter, typeFilter])

  const internalCount = allMentors.filter((m) => m.isInternal).length
  const externalCount = allMentors.filter((m) => !m.isInternal).length
  const pendingRequests = requests.filter((r) => r.status === 'Pending').length
  const totalSessions = allMentors.reduce((s, m) => s + (m.completedSessions || 0), 0)
  const totalDue = allMentors.reduce((s, m) => {
    const r = RATE_MAP[m.id] || Number(m.hourlyCharge) || 0
    return s + Math.max(0, (m.completedSessions || 0) * r - (payments[m.id]?.paid || 0))
  }, 0)

  const pendingOnboardRequests = onboardRequests.filter((r) => r.status === 'Pending').length
  const sortedOnboardRequests = useMemo(
    () => [...onboardRequests].sort((a, b) => b.date.localeCompare(a.date)),
    [onboardRequests]
  )

  const filteredSentRequests = useMemo(() => {
    if (sentRequestsTab === 'pending') return sortedOnboardRequests.filter((r) => r.status === 'Pending')
    if (sentRequestsTab === 'accepted') return sortedOnboardRequests.filter((r) => r.status === 'Accepted')
    if (sentRequestsTab === 'closed') return sortedOnboardRequests.filter((r) => r.status === 'Rejected' || r.status === 'Cancelled')
    return sortedOnboardRequests
  }, [sortedOnboardRequests, sentRequestsTab])

  const sentTabCounts = useMemo(() => ({
    all: onboardRequests.length,
    pending: onboardRequests.filter((r) => r.status === 'Pending').length,
    accepted: onboardRequests.filter((r) => r.status === 'Accepted').length,
    closed: onboardRequests.filter((r) => r.status === 'Rejected' || r.status === 'Cancelled').length,
  }), [onboardRequests])

  const promoteMentorToInternal = (req) => {
    if (!req.mentorId) return
    const mentor = allMentors.find((m) => m.id === req.mentorId)
    if (mentor?.isInternal) return

    const rateMatch = req.compensationOffer.match(/\$(\d+)/)
    const hourlyCharge = rateMatch ? Number(rateMatch[1]) : 0
    const patch = { isInternal: true, ...(hourlyCharge ? { hourlyCharge } : {}) }

    if (req.mentorId.startsWith('mentor-custom-') || req.mentorId.startsWith('mentor-ext-')) {
      setExtraMentors((p) => p.map((m) => m.id !== req.mentorId ? m : { ...m, ...patch }))
    } else {
      updateMentor(req.mentorId, patch)
    }
    setProfileOpen((p) => (p && p.id === req.mentorId ? { ...p, ...patch } : p))
  }

  useEffect(() => {
    onboardRequests
      .filter((r) => r.status === 'Accepted' && r.mentorId && !appliedAcceptanceRef.current.has(r.id))
      .forEach((req) => {
        appliedAcceptanceRef.current.add(req.id)
        promoteMentorToInternal(req)
      })
  }, [onboardRequests, allMentors])

  const handleInternalOnboard = (payload) => {
    const id = `mentor-custom-${Date.now()}`
    setExtraMentors((p) => [...p, {
      id,
      name: payload.name,
      email: payload.email,
      designation: payload.designation,
      industryExpertise: payload.industryExpertise,
      expertise: payload.expertise,
      yearsExperience: payload.yearsExperience,
      hourlyCharge: payload.hourlyCharge,
      bio: payload.bio,
      linkedin: payload.linkedin,
      projectHighlights: payload.projectHighlights,
      workExperience: payload.workExperience,
      previousStartupsByDomain: payload.previousStartupsByDomain,
      totalSessions: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      rating: null,
      status: 'Approved',
      revenue: 0,
      earnings: 0,
      isInternal: true,
    }])
    setPayments((p) => ({ ...p, [id]: { paid: 0 } }))
    setShowInternalOnboard(false)
  }

  const handleInternalEdit = (payload) => {
    if (!editTarget) return
    const id = editTarget.id
    const patch = {
      name: payload.name,
      email: payload.email,
      designation: payload.designation,
      industryExpertise: payload.industryExpertise,
      expertise: payload.expertise,
      yearsExperience: payload.yearsExperience,
      hourlyCharge: payload.hourlyCharge,
      bio: payload.bio,
      linkedin: payload.linkedin,
      projectHighlights: payload.projectHighlights,
      workExperience: payload.workExperience,
      previousStartupsByDomain: payload.previousStartupsByDomain,
    }
    if (id.startsWith('mentor-custom-')) {
      setExtraMentors((p) => p.map((m) => m.id !== id ? m : { ...m, ...patch }))
    } else {
      updateMentor(id, patch)
    }
    setEditTarget(null)
    setProfileOpen(null)
  }

  const submitExternalOnboard = () => {
    if (!externalOnboardTarget) return
    const mentor = externalOnboardTarget
    const display = getMentorRequestDisplay(mentor)
    setOnboardRequests((p) => [...p, {
      id: `ob-${Date.now()}`,
      mentorId: mentor.id,
      mentorName: display.mentorName,
      email: display.email,
      linkedin: display.linkedin,
      designation: display.designation,
      industryExpertise: display.industryExpertise,
      expertiseNeeded: display.expertiseNeeded,
      yearsExperience: display.yearsExperience,
      compensationOffer: externalOnboardForm.compensationOffer.trim(),
      cohortNeed: externalOnboardForm.cohortNeed.trim(),
      details: externalOnboardForm.details.trim(),
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    }])
    setShowExternalOnboard(false)
    setExternalOnboardTarget(null)
    setExternalOnboardForm({ ...EXTERNAL_ONBOARD_BLANK })
    setSentRequestsTab('pending')
    setActivePage('requests')
    setRequestTypeTab('onboard')
  }

  const cancelOnboardRequest = (reqId) => {
    setOnboardRequests((list) => list.map((r) => r.id === reqId ? { ...r, status: 'Cancelled' } : r))
  }

  const openEdit = (mentor) => {
    setProfileOpen(null)
    setEditTarget({
      ...mentor,
      expertise: toArr(mentor.expertise).join(', '),
      projectHighlights: mentor.projectHighlights || [],
      workExperience: mentor.workExperience || [],
      previousStartupsByDomain: mentor.previousStartupsByDomain || [],
    })
  }

  const markPaid = (mentorId, amount) => {
    setPayments((p) => ({ ...p, [mentorId]: { paid: amount } }))
    setProfileOpen(null)
  }

  const toggleAssignment = (mentorId, startupId) => {
    setAssignments((prev) => {
      const current = prev[mentorId] || []
      const next = current.includes(startupId) ? current.filter((id) => id !== startupId) : [...current, startupId]
      return { ...prev, [mentorId]: next }
    })
  }

  const updateRequest = (id, status) => setRequests((p) => p.map((r) => r.id === id ? { ...r, status } : r))
  const markRequestPaid = (id) => setRequests((p) => p.map((r) => r.id === id ? { ...r, paymentStatus: 'Paid' } : r))

  const submitRequest = () => {
    if (!sendRequestModal || !reqForm.startup.trim() || !reqForm.topic.trim()) return
    const rate = RATE_MAP[sendRequestModal.id] || Number(sendRequestModal.hourlyCharge) || 0
    setRequests((p) => [...p, {
      id: `req-${Date.now()}`,
      startup: reqForm.startup.trim(),
      founder: reqForm.founder.trim() || '—',
      mentorId: sendRequestModal.id,
      mentorName: sendRequestModal.name,
      type: reqForm.type,
      topic: reqForm.topic.trim(),
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      paymentStatus: 'Unpaid',
      rate,
    }])
    setSendRequestModal(null)
    setReqForm({ startup: '', founder: '', type: '60 min', topic: '' })
  }

  const openExternalOnboardFor = (mentor) => {
    const display = getMentorRequestDisplay(mentor)
    setExternalOnboardTarget(mentor)
    setExternalOnboardForm({
      ...EXTERNAL_ONBOARD_BLANK,
      mentorId: mentor.id,
      ...display,
    })
    setShowExternalOnboard(true)
  }

  const goToMentorRequests = (mentorId) => {
    setActivePage('requests')
    setRequestTypeTab('onboard')
    const mentorReqs = onboardRequests.filter((r) => r.mentorId === mentorId)
    if (mentorReqs.length) setSentRequestsTab(mentorReqs.some((r) => r.status === 'Pending') ? 'pending' : 'all')
  }

  const closeExternalOnboard = () => {
    setShowExternalOnboard(false)
    setExternalOnboardTarget(null)
    setExternalOnboardForm({ ...EXTERNAL_ONBOARD_BLANK })
  }

  return (
    <DashboardLayout role="incubation">
      {showInternalOnboard && (
        <InternalOnboardModal onSave={handleInternalOnboard} onClose={() => setShowInternalOnboard(false)} />
      )}
      {editTarget && (
        <InternalOnboardModal initial={editTarget} onSave={handleInternalEdit} onClose={() => setEditTarget(null)} />
      )}
      {showExternalOnboard && externalOnboardTarget && (
        <ExternalOnboardModal
          mentor={externalOnboardTarget}
          form={externalOnboardForm}
          setForm={setExternalOnboardForm}
          onClose={closeExternalOnboard}
          onSubmit={submitExternalOnboard}
        />
      )}
      {viewOnboardRequest && (
        <OnboardRequestViewModal request={viewOnboardRequest} onClose={() => setViewOnboardRequest(null)} />
      )}
      {profileOpen && (
        <ProfileModal
          mentor={profileOpen}
          payments={payments}
          onClose={() => setProfileOpen(null)}
          onMarkPaid={markPaid}
          onEdit={openEdit}
          onRequestExternal={openExternalOnboardFor}
          assignedStartups={(assignments[profileOpen.id] || []).map((id) => data.startups.find((s) => s.id === id)).filter(Boolean)}
          mentorRequests={requestsByMentor[profileOpen.id] || []}
          onboardRequestsForMentor={onboardByMentor[profileOpen.id] || []}
          onRequestAction={updateRequest}
          onMarkRequestPaid={markRequestPaid}
          onViewOnboardRequest={setViewOnboardRequest}
          onCancelOnboardRequest={cancelOnboardRequest}
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
      {sendRequestModal && (
        <RequestModal
          mentor={sendRequestModal}
          form={reqForm}
          setForm={setReqForm}
          onClose={() => setSendRequestModal(null)}
          onSubmit={submitRequest}
        />
      )}

      <div className="mm-shell">
        <div className="mm-shell-head">
          <div>
            <h1 className="mm-shell-title">Mentor Management</h1>
            <p className="mm-shell-sub">Network, onboard requests, and session bookings</p>
          </div>
          <div className="mm-shell-head-right">
            <div className="mm-shell-stats">
              {activePage === 'mentors' ? (
                <>
                  <div className="wr-stat-pill"><span>Total</span><strong>{allMentors.length}</strong></div>
                  <div className="wr-stat-pill"><span>Internal</span><strong>{internalCount}</strong></div>
                  <div className="wr-stat-pill"><span>External</span><strong>{externalCount}</strong></div>
                  <div className="wr-stat-pill"><span>Due</span><strong>${totalDue.toLocaleString()}</strong></div>
                </>
              ) : (
                <>
                  <div className="wr-stat-pill"><span>Awaiting</span><strong>{sentTabCounts.pending}</strong></div>
                  <div className="wr-stat-pill wr-stat-green"><span>Accepted</span><strong>{sentTabCounts.accepted}</strong></div>
                  <div className="wr-stat-pill"><span>Sessions</span><strong>{pendingRequests}</strong></div>
                </>
              )}
            </div>
            {activePage === 'mentors' && (
              <Button onClick={() => setShowInternalOnboard(true)}>+ Onboard Internal</Button>
            )}
          </div>
        </div>

        <nav className="mm-seg-nav" aria-label="Mentor sections">
          {PAGE_TABS.map((tab) => {
            const pending = tab.id === 'requests' ? pendingOnboardRequests + pendingRequests : 0
            return (
              <button
                key={tab.id}
                type="button"
                className={`mm-seg-nav-btn${activePage === tab.id ? ' active' : ''}`}
                onClick={() => setActivePage(tab.id)}
              >
                {tab.label}
                {pending > 0 && <span className="mm-seg-badge">{pending}</span>}
              </button>
            )
          })}
        </nav>

        <div className="ic-app-stack mm-stack">
          {activePage === 'mentors' && (
            <>
              <Card className="section-card mm-panel">
                <div className="mm-toolbar-min">
                  <input
                    className="form-input"
                    placeholder="Search mentors…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select className="form-input form-select" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
                    {domains.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <select className="form-input form-select" value={expertiseFilter} onChange={(e) => setExpertiseFilter(e.target.value)}>
                    {expertiseTags.map((e) => <option key={e}>{e}</option>)}
                  </select>
                  <div className="mm-type-toggle">
                    {TYPE_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`mm-type-btn${typeFilter === f.id ? ' active' : ''}`}
                        onClick={() => setTypeFilter(f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="section-card mm-panel mm-panel-list">
                <div className="mm-list-head">
                  <span>{filteredMentors.length} mentors</span>
                  <span className="text-muted sm">Internal <span className="mm-internal-badge mm-inline-badge">I</span></span>
                </div>

                {filteredMentors.length === 0 ? (
                  <div className="mm-empty">
                    <p>No mentors match your filters.</p>
                    <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setTypeFilter('all'); setDomainFilter('All'); setExpertiseFilter('All') }}>Clear filters</Button>
                  </div>
                ) : (
                  <div className="mm-mentor-list">
                    {filteredMentors.map((m) => {
                      const rate = RATE_MAP[m.id] || Number(m.hourlyCharge) || 0
                      const sessions = m.completedSessions || m.totalSessions || 0
                      const total = sessions * rate
                      const paid = payments[m.id]?.paid || 0
                      const due = Math.max(0, total - paid)
                      const assignedIds = assignments[m.id] || []
                      const assignedStartups = assignedIds.map((id) => data.startups?.find((s) => s.id === id)).filter(Boolean)
                      const pendingOnboardForMentor = (onboardByMentor[m.id] || []).filter((r) => r.status === 'Pending').length

                      return (
                        <article key={m.id} className={`mm-list-row${m.isInternal ? ' mm-list-row-internal' : ''}`}>
                          <div className="mm-list-main">
                            <Avatar name={m.name} size={40} />
                            <div className="mm-list-body">
                              <div className="mm-list-title">
                                {m.isInternal && <span className="mm-internal-badge" title="Internal">I</span>}
                                <strong>{m.name}</strong>
                                <Badge status={m.status} />
                              </div>
                              <p className="mm-list-meta">{m.designation || 'Mentor'} · {m.industryExpertise || 'General'}</p>
                              <p className="mm-list-sub">
                                {sessions} sessions{m.rating ? ` · ${m.rating}★` : ''} · ${rate || '—'}/hr
                                {m.isInternal && due > 0 && <span className="mm-due-inline"> · Due ${due.toLocaleString()}</span>}
                                {!m.isInternal && pendingOnboardForMentor > 0 && (
                                  <button type="button" className="mm-inline-link" onClick={() => goToMentorRequests(m.id)}>
                                    · {pendingOnboardForMentor} pending request{pendingOnboardForMentor !== 1 ? 's' : ''}
                                  </button>
                                )}
                              </p>
                              {m.isInternal && assignedStartups.length > 0 && (
                                <p className="mm-list-sub">{assignedStartups.map((s) => s.name).join(', ')}</p>
                              )}
                            </div>
                          </div>
                          <div className="mm-list-actions">
                            <Button size="sm" variant="secondary" onClick={() => setProfileOpen(m)}>Profile</Button>
                            {m.isInternal ? (
                              <>
                                <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>Edit</Button>
                                <Button size="sm" variant="secondary" onClick={() => setAssignTarget(m)}>Assign</Button>
                                {due > 0 && <Button size="sm" onClick={() => markPaid(m.id, total)}>Mark paid</Button>}
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="secondary" onClick={() => setSendRequestModal(m)}>Session</Button>
                                <Button size="sm" onClick={() => openExternalOnboardFor(m)}>Request</Button>
                              </>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </Card>
            </>
          )}

          {activePage === 'requests' && (
            <>
              <Card className="section-card mm-panel">
                <div className="mm-request-nav">
                  {REQUEST_TYPE_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`mm-type-btn${requestTypeTab === tab.id ? ' active' : ''}`}
                      onClick={() => setRequestTypeTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {requestTypeTab === 'onboard' && (
                  <div className="mm-status-nav">
                    {SENT_REQUEST_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`mm-status-btn${sentRequestsTab === tab.id ? ' active' : ''}`}
                        onClick={() => setSentRequestsTab(tab.id)}
                      >
                        {tab.label}
                        <span className="mm-status-count">{sentTabCounts[tab.id]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {requestTypeTab === 'onboard' && (
                <Card className="section-card mm-panel mm-panel-list">
                  {filteredSentRequests.length === 0 ? (
                    <div className="mm-empty">
                      <p>No requests in this view.</p>
                      <Button variant="secondary" size="sm" onClick={() => setActivePage('mentors')}>Browse mentors</Button>
                    </div>
                  ) : (
                    <div className="mm-request-list">
                      {filteredSentRequests.map((req) => (
                        <article key={req.id} className={`mm-list-row mm-list-row-req mm-req-${req.status.toLowerCase()}`}>
                          <div className="mm-list-main">
                            <Avatar name={req.mentorName} size={40} />
                            <div className="mm-list-body">
                              <div className="mm-list-title">
                                {req.status === 'Accepted' && <span className="mm-internal-badge">I</span>}
                                <strong>{req.mentorName}</strong>
                                <Badge status={req.status} />
                              </div>
                              <p className="mm-list-meta">{req.compensationOffer}{req.cohortNeed ? ` · ${req.cohortNeed}` : ''}</p>
                              <p className="mm-list-sub">{req.details}</p>
                              <p className="mm-list-sub text-muted sm">
                                Sent {req.date}
                                {req.mentorRespondedAt && ` · Mentor responded ${req.mentorRespondedAt}`}
                              </p>
                            </div>
                          </div>
                          <div className="mm-list-actions">
                            <Button size="sm" variant="secondary" onClick={() => setViewOnboardRequest(req)}>View</Button>
                            {req.status === 'Pending' && (
                              <Button size="sm" variant="danger" onClick={() => cancelOnboardRequest(req.id)}>Cancel</Button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {requestTypeTab === 'sessions' && (
                <Card className="section-card mm-panel mm-panel-list">
                  {requests.length === 0 ? (
                    <div className="mm-empty"><p>No session requests yet.</p></div>
                  ) : (
                    <div className="mm-request-list">
                      {[...requests].sort((a, b) => b.date.localeCompare(a.date)).map((req) => {
                        const cost = Math.round((req.rate || RATE_MAP[req.mentorId] || 0) * (SESSION_PRICE[req.type] || 1))
                        return (
                          <article key={req.id} className={`mm-list-row mm-list-row-req mm-req-${req.status.toLowerCase()}`}>
                            <div className="mm-list-main">
                              <div className="mm-list-body mm-list-body-full">
                                <div className="mm-list-title">
                                  <strong>{req.startup}</strong>
                                  <Badge status={req.status} />
                                </div>
                                <p className="mm-list-meta">{req.mentorName} · {req.type} · ${cost} · {req.founder}</p>
                                <p className="mm-list-sub">&ldquo;{req.topic}&rdquo;</p>
                                <p className="mm-list-sub text-muted sm">{req.date}</p>
                              </div>
                            </div>
                            <div className="mm-list-actions">
                              {req.status === 'Pending' && (
                                <>
                                  <Button size="sm" onClick={() => updateRequest(req.id, 'Accepted')}>Accept</Button>
                                  <Button size="sm" variant="danger" onClick={() => updateRequest(req.id, 'Rejected')}>Reject</Button>
                                </>
                              )}
                              {req.status === 'Accepted' && req.paymentStatus !== 'Paid' && (
                                <Button size="sm" variant="secondary" onClick={() => markRequestPaid(req.id)}>Mark paid</Button>
                              )}
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
