import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Button, Card, MetricCard, PageHeader, Select } from '../../components/ui'
import Modal from '../../components/ui/Modal'
import { MOCK_APPLICATIONS, MOCK_MILESTONES } from '../../data/incubationPrototypeData'

const TABS = [
  { id: 'setup', label: 'Call Setup' },
  { id: 'form', label: 'Form Builder' },
  { id: 'rubric', label: 'Evaluation Rubric' },
  { id: 'review', label: 'Review & Selection' },
]

const STAGES = ['All', 'New', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected']
const SECTORS = ['All', ...new Set(MOCK_APPLICATIONS.map((a) => a.sector))]
const SCORE_BANDS = ['All', '80+', '65-79', '<65']
const ANSWER_FORMATS = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'Website URL' },
  { value: 'date', label: 'Date' },
  { value: 'single-select', label: 'Single select' },
  { value: 'multi-select', label: 'Multi select' },
  { value: 'checkbox', label: 'Checkbox list' },
  { value: 'file', label: 'File upload' },
]
const CHOICE_FORMATS = new Set(['single-select', 'multi-select', 'checkbox'])
const DEFAULT_FORM_SECTIONS = [
  {
    id: 'sec-1',
    title: 'Startup Basics',
    questions: [
      { id: 'q-name', label: 'Startup name', key: 'startupName', answerFormat: 'text', required: true, isDocument: false, options: [] },
      { id: 'q-one-liner', label: 'One-liner', key: 'oneLiner', answerFormat: 'textarea', required: true, isDocument: false, options: [] },
      { id: 'q-website', label: 'Website', key: 'website', answerFormat: 'url', required: false, isDocument: false, options: [] },
      { id: 'q-sector', label: 'Sector', key: 'sector', answerFormat: 'single-select', required: true, isDocument: false, options: ['SaaS', 'FinTech', 'HealthTech', 'ClimateTech'] },
    ],
  },
  {
    id: 'sec-2',
    title: 'Founder and Team',
    questions: [
      { id: 'q-founder-name', label: 'Founder name', key: 'founderName', answerFormat: 'text', required: true, isDocument: false, options: [] },
      { id: 'q-founder-email', label: 'Founder email', key: 'founderEmail', answerFormat: 'email', required: true, isDocument: false, options: [] },
      { id: 'q-team-emails', label: 'Team emails', key: 'teamEmails', answerFormat: 'textarea', required: false, isDocument: false, options: [] },
    ],
  },
  {
    id: 'sec-3',
    title: 'Application Narrative',
    questions: [
      { id: 'q-problem', label: 'Problem statement', key: 'problemStatement', answerFormat: 'textarea', required: true, isDocument: false, options: [] },
      { id: 'q-solution', label: 'Solution', key: 'solution', answerFormat: 'textarea', required: true, isDocument: false, options: [] },
      { id: 'q-market', label: 'Market size', key: 'marketSize', answerFormat: 'textarea', required: true, isDocument: false, options: [] },
      { id: 'q-traction', label: 'Traction', key: 'traction', answerFormat: 'textarea', required: true, isDocument: false, options: [] },
      { id: 'q-ask', label: 'Ask from incubator', key: 'askFromIncubator', answerFormat: 'textarea', required: true, isDocument: false, options: [] },
    ],
  },
  {
    id: 'sec-4',
    title: 'Documents',
    questions: [
      { id: 'q-doc-pitch', label: 'Pitch deck', key: 'pitchDeck', answerFormat: 'file', required: true, isDocument: true, options: [] },
      { id: 'q-doc-finance', label: 'Financial model', key: 'financialModel', answerFormat: 'file', required: true, isDocument: true, options: [] },
      { id: 'q-doc-cap', label: 'Cap table', key: 'capTable', answerFormat: 'file', required: false, isDocument: true, options: [] },
    ],
  },
]
const MARGAWISE_RUBRIC = [
  { id: 'team', label: 'Team quality', weight: 30 },
  { id: 'market', label: 'Market opportunity', weight: 25 },
  { id: 'traction', label: 'Traction & validation', weight: 25 },
  { id: 'coachability', label: 'Coachability', weight: 20 },
]

function scoreMatches(score, band) {
  if (band === '80+') return score >= 80
  if (band === '65-79') return score >= 65 && score < 80
  if (band === '<65') return score < 65
  return true
}

function deterministicUpload(appId, key) {
  const source = `${appId}-${key}`
  let hash = 0
  for (let i = 0; i < source.length; i += 1) hash = (hash * 31 + source.charCodeAt(i)) % 997
  return hash % 3 !== 0
}

export default function ApplicationsHub() {
  const [activeTab, setActiveTab] = useState('setup')
  const [applications, setApplications] = useState(MOCK_APPLICATIONS)
  const [selectedId, setSelectedId] = useState(MOCK_APPLICATIONS[0]?.id ?? null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stageFilter, setStageFilter] = useState('All')
  const [sectorFilter, setSectorFilter] = useState('All')
  const [scoreFilter, setScoreFilter] = useState('All')
  const [rankMode, setRankMode] = useState('rubric')
  const [managerRanks, setManagerRanks] = useState({})
  const [formSections, setFormSections] = useState(DEFAULT_FORM_SECTIONS)
  const [rubricMode, setRubricMode] = useState('margawise')
  const [customRubric, setCustomRubric] = useState([
    { id: 'custom-1', label: 'Program fit', weight: 40 },
    { id: 'custom-2', label: 'Innovation depth', weight: 35 },
    { id: 'custom-3', label: 'Execution readiness', weight: 25 },
  ])
  const [callConfig, setCallConfig] = useState({
    roundName: 'Margawise Incubation Round 2026',
    openDate: '2026-07-01',
    closeDate: '2026-08-15',
    maxApplications: 200,
    submissionsEnabled: true,
  })
  const [newQuestionBySection, setNewQuestionBySection] = useState({})
  const [rejectionFeedbackByApp, setRejectionFeedbackByApp] = useState({})
  const [rejectModal, setRejectModal] = useState(null) // { appId, reason }
  const [autoRejectMargawiseLt, setAutoRejectMargawiseLt] = useState(50)
  const [autoRejectRubricLt, setAutoRejectRubricLt] = useState(50)
  const [showOnlyAutoReject, setShowOnlyAutoReject] = useState(false)
  const [autoRejectReason, setAutoRejectReason] = useState('')
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const setCallField = (key, value) => setCallConfig((prev) => ({ ...prev, [key]: value }))

  const getMargawiseScore = (app) => {
    const traction = (app.scorecard?.traction || 0) * 10
    const validation = app.validationEvidence || 0
    return Math.round(app.fitScore * 0.4 + validation * 0.4 + traction * 0.2)
  }

  const activeRubric = rubricMode === 'margawise' ? MARGAWISE_RUBRIC : customRubric
  const activeRubricLabel =
    rubricMode === 'margawise' ? 'Margawise Rubric' : 'IIIT H Rubric'

  const getRubricScore = (app) => {
    const totalWeight = activeRubric.reduce((sum, c) => sum + Number(c.weight || 0), 0) || 1
    const points = activeRubric.reduce((sum, c) => {
      const criterionRaw = app.scorecard?.[c.id]
      const criterionScore = typeof criterionRaw === 'number' ? criterionRaw : Math.round(app.fitScore / 10)
      return sum + ((criterionScore / 10) * Number(c.weight || 0))
    }, 0)
    return Math.round((points / totalWeight) * 100)
  }

  const sortApplications = (list) => {
    const withIdx = list.map((item, idx) => ({ item, idx }))
    return [...withIdx]
      .sort((a, b) => {
        if (rankMode === 'manager') {
          const ar = Number(managerRanks[a.item.id] || 9999)
          const br = Number(managerRanks[b.item.id] || 9999)
          if (ar !== br) return ar - br
          return getRubricScore(b.item) - getRubricScore(a.item)
        }
        const diff = getRubricScore(b.item) - getRubricScore(a.item)
        if (diff !== 0) return diff
        return getMargawiseScore(b.item) - getMargawiseScore(a.item)
      })
      .map((entry) => entry.item)
  }

  const shouldAutoReject = (app) => {
    const rubricFail = getRubricScore(app) < Number(autoRejectRubricLt || 0)
    if (rubricMode === 'custom') return rubricFail
    return (
      getMargawiseScore(app) < Number(autoRejectMargawiseLt || 0) || rubricFail
    )
  }

  const filtered = useMemo(() => {
    const list = applications.filter(
      (a) =>
        (stageFilter === 'All' || a.stage === stageFilter) &&
        (sectorFilter === 'All' || a.sector === sectorFilter) &&
        scoreMatches(getRubricScore(a), scoreFilter)
    )
    const scored = sortApplications(list)
    if (showOnlyAutoReject) return scored.filter(shouldAutoReject)
    return scored
  }, [
    applications,
    stageFilter,
    sectorFilter,
    scoreFilter,
    rankMode,
    managerRanks,
    rubricMode,
    customRubric,
    showOnlyAutoReject,
    autoRejectMargawiseLt,
    autoRejectRubricLt,
  ])

  const selected = applications.find((a) => a.id === selectedId) || null
  const totalRubricWeight = activeRubric.reduce((sum, c) => sum + Number(c.weight || 0), 0)
  const totalMargawiseWeight = MARGAWISE_RUBRIC.reduce((sum, c) => sum + Number(c.weight || 0), 0)
  const today = '2026-07-10'
  const submissionsOpenNow =
    callConfig.submissionsEnabled &&
    today >= callConfig.openDate &&
    today <= callConfig.closeDate &&
    applications.length < Number(callConfig.maxApplications || 0)

  useEffect(() => {
    if (selectedId && !applications.some((app) => app.id === selectedId)) {
      setSelectedId(applications[0]?.id ?? null)
    }
  }, [applications, selectedId])

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    },
    []
  )

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, type })
    toastTimerRef.current = setTimeout(() => setToast(null), 2800)
  }

  const updateStage = (id, nextStage) => {
    setApplications((curr) => curr.map((a) => (a.id === id ? { ...a, stage: nextStage } : a)))
  }

  const shortlistApplication = (app) => {
    if (!app) return
    updateStage(app.id, 'Shortlisted')
    showToast(`${app.startupName} shortlisted`, 'success')
  }
  const getRecipients = (app) => [app.founderEmail, ...(app.teamEmails || [])].filter(Boolean).join(',')
  const getDefaultFailureReason = (app) => {
    const score = getMargawiseScore(app)
    if (score >= 50) return ''
    const weak = Object.entries(app.scorecard || {})
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .map(([k, v]) => `${k} (${v}/10)`)
    return `Margawise baseline assessment identified critical gaps in ${weak.join(' and ')}. Validation evidence is currently below cohort threshold, so the application is not ready for progression in this round.`
  }
  const getAcceptMailLink = (app) => {
    const recipients = getRecipients(app)
    const subject = encodeURIComponent(`Congratulations: ${app.startupName} accepted to next incubation stage`)
    const body = encodeURIComponent(
      `Hi ${app.founderName},\n\nCongratulations — ${app.startupName} has been ACCEPTED to the next stage of our incubation program.\n\nScores:\n- Margawise Score: ${getMargawiseScore(app)}\n- Rubric Score: ${getRubricScore(app)}\n\nNext steps:\n1) Confirm your onboarding slot\n2) Share any pending documents\n3) Prepare for kickoff orientation\n\nBest,\nIncubation Manager`
    )
    return `mailto:${recipients}?subject=${subject}&body=${body}`
  }
  const getFinalRejectReason = (app, feedback) => {
    const defaultReason = getDefaultFailureReason(app)
    const managerReason = (feedback || '').trim()
    return managerReason || defaultReason || 'Your application is promising, but it did not meet the threshold for this round.'
  }
  const getRejectMailLink = (app, feedback) => {
    const recipients = getRecipients(app)
    const subject = encodeURIComponent(`Update on ${app.startupName} incubation application`)
    const finalReason = getFinalRejectReason(app, feedback)
    const body = encodeURIComponent(
      `Hi ${app.founderName},\n\nThank you for applying with ${app.startupName}.\n\nAfter review, we are unable to move this application forward in the current round.\n\nWhy this application did not pass:\n${finalReason}\n\nScores for reference:\n- Margawise Score: ${getMargawiseScore(app)}\n- Rubric Score: ${getRubricScore(app)}\n\nYou are welcome to reapply in the next round after addressing the gaps above.\n\nBest,\nIncubation Manager`
    )
    return `mailto:${recipients}?subject=${subject}&body=${body}`
  }
  const acceptApplication = (app) => {
    if (!app) return
    updateStage(app.id, 'Accepted')
    window.location.href = getAcceptMailLink(app)
    showToast(`Acceptance mail opened for ${app.startupName}`, 'success')
  }
  const rejectApplication = (app, feedbackOverride) => {
    if (!app) return
    const feedback = typeof feedbackOverride === 'string' ? feedbackOverride : (rejectionFeedbackByApp[app.id] || '')
    const cleanFeedback = feedback.trim()
    if (cleanFeedback) {
      setRejectionFeedbackByApp((prev) => ({ ...prev, [app.id]: cleanFeedback }))
    }
    updateStage(app.id, 'Rejected')
    window.location.href = getRejectMailLink(app, cleanFeedback)
    showToast(`Rejection mail opened for ${app.startupName}`, 'danger')
  }
  const openRejectModal = (app) => {
    if (!app) return
    setRejectModal({ appId: app.id, reason: rejectionFeedbackByApp[app.id] || '' })
  }
  const confirmRejectFromModal = () => {
    if (!rejectModal) return
    const app = applications.find((a) => a.id === rejectModal.appId)
    if (!app) {
      setRejectModal(null)
      return
    }
    rejectApplication(app, rejectModal.reason || '')
    setRejectModal(null)
    setIsModalOpen(false)
  }
  const autoRejectFilteredApplications = () => {
    const candidates = filtered.filter(shouldAutoReject).filter((a) => a.stage !== 'Rejected')
    if (candidates.length === 0) {
      showToast('No candidates match current auto-reject thresholds', 'danger')
      return
    }

    setApplications((curr) =>
      curr.map((app) => (candidates.some((c) => c.id === app.id) ? { ...app, stage: 'Rejected' } : app))
    )
    const reason = autoRejectReason.trim()
    if (reason) {
      setRejectionFeedbackByApp((prev) => {
        const next = { ...prev }
        candidates.forEach((app) => {
          next[app.id] = reason
        })
        return next
      })
    }

    candidates.forEach((app, idx) => {
      const mailUrl = getRejectMailLink(app, reason || rejectionFeedbackByApp[app.id] || '')
      setTimeout(() => {
        if (idx === 0) window.location.href = mailUrl
        else window.open(mailUrl, '_blank')
      }, idx * 200)
    })
    showToast(`Auto-reject initiated for ${candidates.length} application(s).`, 'danger')
  }
  const moveToReview = (app) => {
    if (!app) return
    updateStage(app.id, 'Under Review')
    showToast(`${app.startupName} moved to review`, 'success')
  }

  const openApplicationModal = (appId) => {
    setSelectedId(appId)
    setIsModalOpen(true)
  }

  const addSection = () => {
    setFormSections((prev) => [
      ...prev,
      { id: `sec-${Date.now()}`, title: `Custom Section ${prev.length + 1}`, questions: [] },
    ])
  }

  const renameSection = (sectionId, title) => {
    setFormSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title } : s)))
  }
  const removeSection = (sectionId) => {
    setFormSections((prev) => prev.filter((s) => s.id !== sectionId))
  }
  const moveSection = (sectionId, dir) => {
    setFormSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sectionId)
      if (idx < 0) return prev
      const nextIdx = idx + dir
      if (nextIdx < 0 || nextIdx >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(nextIdx, 0, item)
      return copy
    })
  }

  const toggleQuestionRequired = (sectionId, questionId) => {
    setFormSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) => (q.id === questionId ? { ...q, required: !q.required } : q)),
            }
      )
    )
  }

  const updateQuestionLabel = (sectionId, questionId, label) => {
    setFormSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, questions: s.questions.map((q) => (q.id === questionId ? { ...q, label } : q)) }
      )
    )
  }

  const updateQuestionFormat = (sectionId, questionId, answerFormat) => {
    setFormSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) => {
                if (q.id !== questionId) return q
                const nextIsDoc = answerFormat === 'file'
                const nextOptions = CHOICE_FORMATS.has(answerFormat)
                  ? q.options?.length
                    ? q.options
                    : ['Option 1', 'Option 2']
                  : []
                return {
                  ...q,
                  answerFormat,
                  isDocument: nextIsDoc,
                  options: nextOptions,
                }
              }),
            }
      )
    )
  }

  const addQuestionOption = (sectionId, questionId) => {
    setFormSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== questionId
                  ? q
                  : { ...q, options: [...(q.options || []), `Option ${(q.options || []).length + 1}`] }
              ),
            }
      )
    )
  }

  const updateQuestionOption = (sectionId, questionId, optionIdx, optionValue) => {
    setFormSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== questionId
                  ? q
                  : { ...q, options: (q.options || []).map((opt, idx) => (idx === optionIdx ? optionValue : opt)) }
              ),
            }
      )
    )
  }

  const removeQuestionOption = (sectionId, questionId, optionIdx) => {
    setFormSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== questionId
                  ? q
                  : { ...q, options: (q.options || []).filter((_, idx) => idx !== optionIdx) }
              ),
            }
      )
    )
  }

  const removeQuestion = (sectionId, questionId) => {
    setFormSections((prev) =>
      prev.map((s) => (s.id !== sectionId ? s : { ...s, questions: s.questions.filter((q) => q.id !== questionId) }))
    )
  }

  const addQuestion = (sectionId) => {
    const draft = (newQuestionBySection[sectionId] || '').trim()
    if (!draft) return
    const isDoc = draft.toLowerCase().includes('document') || draft.toLowerCase().includes('upload')
    setFormSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: [
                ...s.questions,
                {
                  id: `q-${Date.now()}`,
                  label: draft,
                  key: draft.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  answerFormat: isDoc ? 'file' : 'text',
                  required: false,
                  isDocument: isDoc,
                  options: [],
                },
              ],
            }
      )
    )
    setNewQuestionBySection((prev) => ({ ...prev, [sectionId]: '' }))
  }

  const updateCustomRubric = (id, key, value) => {
    setCustomRubric((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: key === 'label' ? value : Number(value || 0) } : r))
    )
  }
  const addRubricCriteria = () => {
    setCustomRubric((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, label: `Custom criteria ${prev.length + 1}`, weight: 10 },
    ])
  }
  const removeRubricCriteria = (id) => {
    setCustomRubric((prev) => prev.filter((r) => r.id !== id))
  }

  const uploadRequirements = formSections.flatMap((s) =>
    s.questions
      .filter((q) => q.isDocument || q.answerFormat === 'file')
      .map((q) => ({ section: s.title, key: q.key, label: q.label, required: q.required }))
  )

  return (
    <DashboardLayout role="incubation">
      <PageHeader
        title="Application Management"
        subtitle="Flexible incubation applications with Margawise default format, scoring, and customizable review workflow"
      />

      <div className="metrics-row">
        <MetricCard label="Applications Received" value={applications.length} accent />
        <MetricCard label="Submissions Status" value={submissionsOpenNow ? 'Open' : 'Closed'} accent />
        <MetricCard label="Open Until" value={callConfig.closeDate} accent />
        <MetricCard label="Shortlisted" value={applications.filter((a) => a.stage === 'Shortlisted').length} accent />
        <MetricCard label="Accepted" value={applications.filter((a) => a.stage === 'Accepted').length} accent />
      </div>

      <div className="ic-app-stack">
        <Card className="section-card">
          <div className="ic-app-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`ic-app-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {activeTab === 'setup' && (
          <Card className="section-card">
            <div className="section-header">
              <h3>Application Round Management</h3>
              <Badge status={submissionsOpenNow ? 'Open' : 'Closed'} />
            </div>
            <div className="shortlist-field-grid">
            <label className="form-field">
              <span className="form-label">Round Name</span>
              <input className="form-input" value={callConfig.roundName} onChange={(e) => setCallField('roundName', e.target.value)} />
            </label>
            <label className="form-field">
              <span className="form-label">Applications Open Date</span>
              <input className="form-input" type="date" value={callConfig.openDate} onChange={(e) => setCallField('openDate', e.target.value)} />
            </label>
            <label className="form-field">
              <span className="form-label">Applications Close Date</span>
              <input className="form-input" type="date" value={callConfig.closeDate} onChange={(e) => setCallField('closeDate', e.target.value)} />
            </label>
            <label className="form-field">
              <span className="form-label">Max Applications</span>
              <input
                className="form-input"
                type="number"
                min="1"
                value={callConfig.maxApplications}
                onChange={(e) => setCallField('maxApplications', e.target.value)}
              />
            </label>
          </div>
            <div className="shortlist-bottom-actions" style={{ justifyContent: 'space-between', marginTop: 12 }}>
              <div className="text-muted sm">
                Submission cap usage: <strong>{applications.length}/{callConfig.maxApplications}</strong>
              </div>
              <Button
                variant={callConfig.submissionsEnabled ? 'danger' : 'secondary'}
                onClick={() => setCallField('submissionsEnabled', !callConfig.submissionsEnabled)}
              >
                {callConfig.submissionsEnabled ? 'Disable Submissions' : 'Enable Submissions'}
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'form' && (
          <Card className="section-card">
            <div className="section-header">
              <div>
                <h3>Application Form Builder</h3>
                <p className="text-muted sm">Margawise format is default. Customize sections/questions for your center.</p>
              </div>
              <Button variant="secondary" onClick={addSection}>+ Add Section</Button>
            </div>
            <div className="ic-form-builder-list">
            {formSections.map((section, idx) => (
              <div key={section.id} className="ic-form-builder-section">
                <div className="ic-form-builder-head">
                  <input
                    className="form-input"
                    value={section.title}
                    onChange={(e) => renameSection(section.id, e.target.value)}
                  />
                  <div className="ic-form-builder-controls">
                    <Button size="sm" variant="secondary" onClick={() => moveSection(section.id, -1)} disabled={idx === 0}>↑</Button>
                    <Button size="sm" variant="secondary" onClick={() => moveSection(section.id, 1)} disabled={idx === formSections.length - 1}>↓</Button>
                    <Button size="sm" variant="danger" onClick={() => removeSection(section.id)}>Delete</Button>
                  </div>
                </div>
                <div className="ic-form-builder-questions">
                  {section.questions.length === 0 ? (
                    <p className="text-muted sm">No questions yet in this section.</p>
                  ) : (
                    section.questions.map((q) => (
                      <div key={q.id} className="ic-form-q-card">
                        <div className="ic-form-q-top">
                          <input
                            className="form-input"
                            value={q.label}
                            onChange={(e) => updateQuestionLabel(section.id, q.id, e.target.value)}
                          />
                          <select
                            className="form-input form-select"
                            value={q.answerFormat || 'text'}
                            onChange={(e) => updateQuestionFormat(section.id, q.id, e.target.value)}
                          >
                            {ANSWER_FORMATS.map((fmt) => (
                              <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-muted sm ic-form-q-help">
                          {q.isDocument ? 'Document requirement' : 'Question field'} · Key: {q.key}
                        </p>
                        {CHOICE_FORMATS.has(q.answerFormat) && (
                          <div className="ic-form-q-options">
                            {(q.options || []).map((opt, optIdx) => (
                              <div key={`${q.id}-opt-${optIdx}`} className="ic-form-q-option-row">
                                <input
                                  className="form-input"
                                  value={opt}
                                  onChange={(e) => updateQuestionOption(section.id, q.id, optIdx, e.target.value)}
                                />
                                <Button size="sm" variant="danger" onClick={() => removeQuestionOption(section.id, q.id, optIdx)}>✕</Button>
                              </div>
                            ))}
                            <Button size="sm" variant="secondary" onClick={() => addQuestionOption(section.id, q.id)}>+ Add Option</Button>
                          </div>
                        )}
                        <div className="ic-form-builder-question-actions">
                          <Button size="sm" variant="secondary" onClick={() => toggleQuestionRequired(section.id, q.id)}>
                            {q.required ? 'Mandatory' : 'Optional'}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => removeQuestion(section.id, q.id)}>Remove</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="ic-form-builder-add">
                  <input
                    className="form-input"
                    placeholder="Create custom question or document requirement..."
                    value={newQuestionBySection[section.id] || ''}
                    onChange={(e) => setNewQuestionBySection((prev) => ({ ...prev, [section.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addQuestion(section.id)}
                  />
                  <Button size="sm" onClick={() => addQuestion(section.id)}>Add</Button>
                </div>
              </div>
            ))}
            </div>
          </Card>
        )}

        {activeTab === 'rubric' && (
          <div className="ic-rubric-page">
            <Card className="section-card ic-rubric-step">
              <div className="ic-rubric-step-head">
                <span className="ic-rubric-step-num">1</span>
                <div>
                  <h3>Choose your evaluation rubric</h3>
                  <p className="text-muted sm">
                    Pick the Margawise standard rubric or build a program-specific rubric for this cohort.
                  </p>
                </div>
              </div>

              <div className="ic-rubric-mode-grid">
                <button
                  type="button"
                  className={`ic-rubric-mode-card${rubricMode === 'margawise' ? ' active' : ''}`}
                  onClick={() => setRubricMode('margawise')}
                >
                  <span className="ic-rubric-mode-badge">Recommended</span>
                  <h4>Margawise Rubric</h4>
                  <p>Use the fixed Margawise framework. Criteria and weights are locked and cannot be edited.</p>
                  <span className="ic-rubric-mode-meta">{MARGAWISE_RUBRIC.length} criteria · {totalMargawiseWeight}% total</span>
                </button>
                <button
                  type="button"
                  className={`ic-rubric-mode-card${rubricMode === 'custom' ? ' active' : ''}`}
                  onClick={() => setRubricMode('custom')}
                >
                  <h4>Custom Program Rubric</h4>
                  <p>Define your own criteria and weights for this incubation program.</p>
                  <span className="ic-rubric-mode-meta">{customRubric.length} criteria · {totalRubricWeight}% total</span>
                </button>
              </div>
            </Card>

            {rubricMode === 'margawise' ? (
              <Card className="section-card ic-rubric-panel">
                <div className="section-header ic-rubric-panel-head">
                  <div>
                    <h3>Margawise Rubric</h3>
                    <p className="text-muted sm">Fixed evaluation weights used for scoring in Review & Selection.</p>
                  </div>
                  <span className="ic-rubric-lock-badge">Fixed · Read only</span>
                </div>

                <div className="ic-rubric-table">
                  <div className="ic-rubric-table-row ic-rubric-table-head ic-rubric-cols-2">
                    <span className="ic-rubric-col-criteria">Criteria</span>
                    <span className="ic-rubric-col-weight">Weight</span>
                  </div>
                  {MARGAWISE_RUBRIC.map((criterion) => (
                    <div key={criterion.id} className="ic-rubric-table-row ic-rubric-cols-2">
                      <span className="ic-rubric-col-criteria">{criterion.label}</span>
                      <span className="ic-rubric-col-weight">{criterion.weight}%</span>
                    </div>
                  ))}
                  <div className="ic-rubric-table-row ic-rubric-table-foot ic-rubric-cols-2">
                    <span className="ic-rubric-col-criteria">Total</span>
                    <span className={`ic-rubric-col-weight ic-rubric-total ${totalMargawiseWeight === 100 ? 'ic-weight-ok' : 'ic-weight-warn'}`}>
                      {totalMargawiseWeight}%
                    </span>
                  </div>
                </div>

                <p className="ic-rubric-footnote text-muted sm">
                  Active for scoring in Review & Selection. Margawise rubric weights are fixed.
                </p>
              </Card>
            ) : (
              <Card className="section-card ic-rubric-panel">
                <div className="section-header ic-rubric-panel-head">
                  <div>
                    <h3>Custom Program Rubric</h3>
                    <p className="text-muted sm">Define criteria and weights for this cohort. Total must equal 100%.</p>
                  </div>
                  <span className="ic-rubric-edit-badge">Editable</span>
                </div>

                {customRubric.length === 0 ? (
                  <div className="ic-rubric-empty">
                    <p className="ic-rubric-empty-title">Build your program rubric</p>
                    <p className="text-muted sm">Add criteria and assign weights that reflect your selection priorities.</p>
                    <Button size="sm" onClick={addRubricCriteria}>+ Add first criterion</Button>
                  </div>
                ) : (
                  <>
                    <div className="ic-rubric-table ic-rubric-table-custom">
                      <div className="ic-rubric-table-row ic-rubric-table-head ic-rubric-cols-custom">
                        <span className="ic-rubric-col-criteria">Criteria</span>
                        <span className="ic-rubric-col-weight">Weight</span>
                        <span className="ic-rubric-col-remove" aria-hidden="true" />
                      </div>

                      {customRubric.map((criterion, index) => (
                        <div key={criterion.id} className="ic-rubric-table-row ic-rubric-cols-custom ic-rubric-edit-row">
                          <div className="ic-rubric-col-criteria">
                            <input
                              className="form-input ic-rubric-name-input"
                              value={criterion.label}
                              onChange={(e) => updateCustomRubric(criterion.id, 'label', e.target.value)}
                              placeholder={`Criterion ${index + 1}`}
                              aria-label={`Criterion ${index + 1} name`}
                            />
                          </div>
                          <div className="ic-rubric-col-weight">
                            <div className="ic-rubric-weight-wrap">
                              <input
                                className="form-input ic-rubric-weight-input"
                                type="number"
                                min="0"
                                max="100"
                                value={criterion.weight}
                                onChange={(e) => updateCustomRubric(criterion.id, 'weight', e.target.value)}
                                aria-label={`Weight for ${criterion.label || `criterion ${index + 1}`}`}
                              />
                              <span className="ic-rubric-weight-suffix">%</span>
                            </div>
                          </div>
                          <div className="ic-rubric-col-remove">
                            <button
                              type="button"
                              className="ic-rubric-remove-btn"
                              onClick={() => removeRubricCriteria(criterion.id)}
                              disabled={customRubric.length <= 1}
                              title="Remove criterion"
                              aria-label={`Remove ${criterion.label || `criterion ${index + 1}`}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="ic-rubric-table-row ic-rubric-table-foot ic-rubric-cols-custom">
                        <span className="ic-rubric-col-criteria">Total</span>
                        <span className={`ic-rubric-col-weight ic-rubric-total ${totalRubricWeight === 100 ? 'ic-weight-ok' : 'ic-weight-warn'}`}>
                          {totalRubricWeight}%
                        </span>
                        <span className="ic-rubric-col-remove" />
                      </div>

                      <button type="button" className="ic-rubric-add-row" onClick={addRubricCriteria}>
                        + Add criteria
                      </button>
                    </div>

                    <div className="ic-rubric-custom-bar">
                      <p className={`ic-rubric-status ${totalRubricWeight === 100 ? 'ic-rubric-status-ok' : 'ic-rubric-status-warn'}`}>
                        {totalRubricWeight === 100
                          ? 'Weights total 100% — ready for scoring in Review & Selection.'
                          : `Current total is ${totalRubricWeight}%. Adjust weights to reach 100%.`}
                      </p>
                    </div>
                  </>
                )}
              </Card>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <>
            <Card className="section-card shortlist-header-card">
            <div className="section-header">
              <div>
                <h3>Application Review & Selection</h3>
                <p className="text-muted sm">
                  Scoring uses {activeRubricLabel} only — change rubric type in Evaluation Rubric.
                </p>
              </div>
              <Badge status={`${filtered.length} visible applications`} />
            </div>
            <div className="ic-rubric-review-banner">
              <div>
                <span className="ic-rubric-review-label">Active evaluation rubric</span>
                <strong>{activeRubricLabel}</strong>
                <span>
                  Sorted by total rubric score
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setActiveTab('rubric')}>
                Change rubric
              </Button>
            </div>
            <div className="shortlist-filters">
              <Select label="Sector" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Select label="Status" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Select label="Rubric Score" value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}>
                {SCORE_BANDS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="shortlist-filters" style={{ marginTop: 10 }}>
              <Select label="Ranking Mode" value={rankMode} onChange={(e) => setRankMode(e.target.value)}>
                <option value="rubric">Rubric score (default)</option>
                <option value="manager">Manager override</option>
              </Select>
            </div>
            <div className="ic-auto-reject-panel">
              <div className="ic-auto-reject-grid">
                {rubricMode === 'margawise' && (
                  <label className="form-field">
                    <span className="form-label">Auto Reject if Margawise &lt;</span>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      max="100"
                      value={autoRejectMargawiseLt}
                      onChange={(e) => setAutoRejectMargawiseLt(e.target.value)}
                    />
                  </label>
                )}
                <label className="form-field">
                  <span className="form-label">Auto Reject if Rubric &lt;</span>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    max="100"
                    value={autoRejectRubricLt}
                    onChange={(e) => setAutoRejectRubricLt(e.target.value)}
                  />
                </label>
                <label className="form-field ic-auto-reject-toggle">
                  <span className="form-label">View Mode</span>
                  <Button
                    variant={showOnlyAutoReject ? 'primary' : 'secondary'}
                    onClick={() => setShowOnlyAutoReject((v) => !v)}
                  >
                    {showOnlyAutoReject ? 'Showing only auto-reject candidates' : 'Show only auto-reject candidates'}
                  </Button>
                </label>
              </div>
              <label className="form-field">
                <span className="form-label">Auto Reject Reason (optional override)</span>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={autoRejectReason}
                  onChange={(e) => setAutoRejectReason(e.target.value)}
                  placeholder="If empty, each startup gets default Margawise reason (for &lt;50) or its own saved reject reason."
                />
              </label>
              <div className="shortlist-bottom-actions">
                <Button variant="danger" onClick={autoRejectFilteredApplications}>
                  Auto Reject Filtered + Send Mail
                </Button>
              </div>
            </div>
          </Card>

            <Card className="section-card shortlist-list-card">
            <div className="section-header">
              <h3>All Startups Table</h3>
              <p className="text-muted sm">
                {activeRubricLabel} · sorted by total score (highest first)
              </p>
            </div>
            <div className="table-wrap">
              <table className="data-table shortlist-table ic-review-rubric-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    {rankMode === 'manager' && <th>Manager Rank</th>}
                    <th>Startup</th>
                    <th>Sector</th>
                    <th>{activeRubricLabel}</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6 + (rankMode === 'manager' ? 1 : 0)}
                        className="ic-table-empty"
                      >
                        No startups match the current filters.
                      </td>
                    </tr>
                  ) : (
                  filtered.map((app, index) => (
                    <tr
                      key={app.id}
                      className={selected?.id === app.id ? 'ic-row-selected' : ''}
                      onClick={() => openApplicationModal(app.id)}
                    >
                      <td><span className="shortlist-rank">#{index + 1}</span></td>
                      {rankMode === 'manager' && (
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            min="1"
                            value={managerRanks[app.id] || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setManagerRanks((prev) => ({ ...prev, [app.id]: e.target.value }))}
                            placeholder="Set rank"
                          />
                        </td>
                      )}
                      <td>
                        <strong>{app.startupName}</strong>
                        <p className="text-muted sm">{app.founderName}</p>
                      </td>
                      <td>{app.sector}</td>
                      <td>
                        <span className={`fit-score fit-${getRubricScore(app) >= 80 ? 'high' : getRubricScore(app) >= 65 ? 'mid' : 'low'}`}>
                          {getRubricScore(app)}
                        </span>
                      </td>
                      <td><Badge status={app.stage} /></td>
                      <td>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            openApplicationModal(app.id)
                          }}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
            </Card>
          </>
        )}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Application Details">
        {selected ? (
          <div className="shortlist-application-view">
            <div className="shortlist-title-row">
              <div>
                <p className="step-eyebrow">APPLICATION REVIEW</p>
                <h4>{selected.startupName}</h4>
                <p className="text-muted sm">{selected.oneLiner}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`fit-score fit-${getRubricScore(selected) >= 80 ? 'high' : getRubricScore(selected) >= 65 ? 'mid' : 'low'}`}>
                  {activeRubricLabel} {getRubricScore(selected)}
                </span>
              </div>
            </div>

            <div className="shortlist-field-grid">
              <div className="shortlist-field"><label>Founder name</label><p>{selected.founderName}</p></div>
              <div className="shortlist-field"><label>Founder email</label><p>{selected.founderEmail}</p></div>
              <div className="shortlist-field"><label>Startup website</label><p>{selected.website}</p></div>
              <div className="shortlist-field"><label>Sector / stage</label><p>{selected.sector} · {selected.startupStage}</p></div>
              <div className="shortlist-field"><label>Location</label><p>{selected.location}</p></div>
              <div className="shortlist-field"><label>Team emails</label><p>{[selected.founderEmail, ...(selected.teamEmails || [])].join(', ')}</p></div>
            </div>

            <div className="shortlist-field-block"><label>Problem statement</label><p>{selected.application?.problemStatement}</p></div>
            <div className="shortlist-field-block"><label>Solution</label><p>{selected.application?.solution}</p></div>
            <div className="shortlist-field-block"><label>Target customer</label><p>{selected.application?.targetCustomer}</p></div>
            <div className="shortlist-field-block"><label>Market size</label><p>{selected.application?.marketSize}</p></div>
            <div className="shortlist-field-block"><label>Business model</label><p>{selected.application?.businessModel}</p></div>
            <div className="shortlist-field-block"><label>Traction</label><p>{selected.application?.traction}</p></div>
            <div className="shortlist-field-block"><label>Ask from incubator</label><p>{selected.application?.askFromIncubator}</p></div>
            <div className="shortlist-field-block">
              <label>Margawise insight summary</label>
              <p>{selected.summary}</p>
              <p className="text-muted sm" style={{ marginTop: 8 }}>
                Signals: {(selected.validatedIdeaSignals || []).join(' · ')}
              </p>
            </div>

            <div className="shortlist-field-block">
              <label>Uploaded documents (as configured in form builder)</label>
              <div className="ic-form-builder-questions" style={{ marginTop: 6 }}>
                {uploadRequirements.length === 0 ? (
                  <p className="text-muted sm">No document requirements configured.</p>
                ) : (
                  uploadRequirements.map((doc) => {
                    const uploaded = deterministicUpload(selected.id, doc.key)
                    return (
                      <div key={`${selected.id}-${doc.key}`} className="ic-form-builder-question">
                        <div>
                          <strong>{doc.label}</strong>
                          <p className="text-muted sm">{doc.section}</p>
                        </div>
                        <Badge status={uploaded ? 'Uploaded' : doc.required ? 'Missing' : 'Not Submitted'} />
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="shortlist-field-block">
              <label>Assignments and milestone completion</label>
              <div className="ic-form-builder-questions" style={{ marginTop: 6 }}>
                {MOCK_MILESTONES.map((m) => (
                  <div key={m.id} className="ic-form-builder-question">
                    <div>
                      <strong>{m.title}</strong>
                      <p className="text-muted sm">Owner: {m.owner} · Due: {m.dueDate}</p>
                    </div>
                    <Badge status={m.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="shortlist-field-block">
              <label>Rejection feedback (manager)</label>
              <textarea
                className="form-input form-textarea"
                rows={4}
                value={rejectionFeedbackByApp[selected.id] || ''}
                onChange={(e) =>
                  setRejectionFeedbackByApp((prev) => ({ ...prev, [selected.id]: e.target.value }))
                }
                placeholder={
                  getMargawiseScore(selected) < 50
                    ? `Margawise default reason will be sent automatically:\n${getDefaultFailureReason(selected)}`
                    : 'Explain where the startup is currently lacking...'
                }
              />
              {getMargawiseScore(selected) < 50 && (
                <p className="text-muted sm" style={{ marginTop: 8 }}>
                  Margawise auto-failure reason will be used by default for score below 50.
                </p>
              )}
            </div>

            <div className="shortlist-bottom-actions">
              <Button variant="secondary" onClick={() => moveToReview(selected)}>Move to Review</Button>
              <Button variant="secondary" onClick={() => shortlistApplication(selected)}>Shortlist</Button>
              <Button variant="danger" onClick={() => openRejectModal(selected)}>Reject</Button>
              <Button onClick={() => acceptApplication(selected)}>Accept</Button>
            </div>
          </div>
        ) : (
          <p className="text-muted">No application selected.</p>
        )}
      </Modal>

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Application">
        {rejectModal ? (
          <div className="shortlist-application-view">
            <label className="form-label">Why are you rejecting? (optional)</label>
            <textarea
              className="form-input form-textarea"
              rows={4}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((m) => ({ ...m, reason: e.target.value }))}
              placeholder="Example: Validation evidence is still weak and customer traction is not sufficient for this cohort."
            />
            <div className="shortlist-bottom-actions">
              <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmRejectFromModal}>Send Reject Mail</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {toast && <div className={`mw-toast ${toast.type}`}>{toast.message}</div>}
    </DashboardLayout>
  )
}

