import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Button, Card, PageHeader, Select } from '../../components/ui'
import Modal from '../../components/ui/Modal'
import { MOCK_APPLICATIONS } from '../../data/incubationPrototypeData'

const STAGES = ['All', 'New', 'Under Review', 'Shortlisted', 'Rejected']
const SECTORS = ['All', ...new Set(MOCK_APPLICATIONS.map((a) => a.sector))]
const SCORE_BANDS = ['All', '80+', '65-79', '<65']

function scoreMatches(score, band) {
  if (band === '80+') return score >= 80
  if (band === '65-79') return score >= 65 && score < 80
  if (band === '<65') return score < 65
  return true
}

export default function ApplicationsHub() {
  const [applications, setApplications] = useState(MOCK_APPLICATIONS)
  const [selectedId, setSelectedId] = useState(MOCK_APPLICATIONS[0]?.id ?? null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stageFilter, setStageFilter] = useState('All')
  const [sectorFilter, setSectorFilter] = useState('All')
  const [scoreFilter, setScoreFilter] = useState('All')
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const getDecisionScore = (app) => {
    const traction = (app.scorecard?.traction || 0) * 10
    const validation = app.validationEvidence || 0
    return Math.round(app.fitScore * 0.4 + validation * 0.4 + traction * 0.2)
  }

  const getRanked = (list) =>
    [...list].sort((a, b) => {
      const scoreDiff = getDecisionScore(b) - getDecisionScore(a)
      if (scoreDiff !== 0) return scoreDiff
      return b.fitScore - a.fitScore
    })

  const filtered = useMemo(
    () => {
      const filteredList = applications.filter(
        (a) =>
          (stageFilter === 'All' || a.stage === stageFilter) &&
          (sectorFilter === 'All' || a.sector === sectorFilter) &&
          scoreMatches(a.fitScore, scoreFilter)
      )
      return getRanked(filteredList)
    },
    [applications, stageFilter, sectorFilter, scoreFilter]
  )

  useEffect(() => {
    if (selectedId && !applications.some((app) => app.id === selectedId)) {
      setSelectedId(applications[0]?.id ?? null)
    }
  }, [applications, selectedId])

  const selected = applications.find((a) => a.id === selectedId) || null

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

  const getShortlistMailLink = (app) => {
    const subject = encodeURIComponent(`Margawise Update: ${app.startupName} shortlisted`)
    const recipients = [app.founderEmail, ...(app.teamEmails || [])].filter(Boolean).join(',')
    const body = encodeURIComponent(
      `Hi ${app.founderName} and team,\n\nGreat news — ${app.startupName} is shortlisted for Margawise incubation.\n\nMargawise Decision Score: ${getDecisionScore(app)}\nAI Fit Score: ${app.fitScore}\nValidation Evidence: ${app.validationEvidence || 0}\n\nNext step:\n- Please confirm your interview slot in the next 48 hours.\n\nBest,\nMargawise Incubation Team`
    )
    return `mailto:${recipients}?subject=${subject}&body=${body}`
  }

  const sendShortlistMail = (app) => {
    if (!app) return
    updateStage(app.id, 'Shortlisted')
    showToast(`Shortlist email draft ready for ${app.startupName}`, 'success')
    window.location.href = getShortlistMailLink(app)
  }

  const rejectApplication = (app) => {
    if (!app) return
    updateStage(app.id, 'Rejected')
    showToast(`${app.startupName} marked as rejected`, 'danger')
  }

  const openApplicationModal = (appId) => {
    setSelectedId(appId)
    setIsModalOpen(true)
  }

  return (
    <DashboardLayout role="incubation">
      <PageHeader
        title="Shortlist Startups"
        subtitle="Review all applications, rank by Margawise Score, and send shortlist emails directly to founder teams"
      />

      <Card className="section-card shortlist-header-card">
        <div className="section-header">
          <h3>Applications Queue</h3>
          <Badge status="In Progress">{filtered.length} visible applications</Badge>
        </div>
        <div className="shortlist-filters">
          <Select label="Sector" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select label="Stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select label="AI Fit Score" value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}>
            {SCORE_BANDS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="section-card shortlist-list-card">
        <div className="section-header">
          <h3>Ranked by Margawise Score</h3>
          <p className="text-muted sm">Highest score shown first.</p>
        </div>
        <div className="table-wrap">
          <table className="data-table shortlist-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Startup</th>
                <th>Sector</th>
                <th>Margawise Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, index) => (
                <tr
                  key={app.id}
                  className={selected?.id === app.id ? 'ic-row-selected' : ''}
                  onClick={() => openApplicationModal(app.id)}
                >
                  <td>
                    <span className="shortlist-rank">#{index + 1}</span>
                  </td>
                  <td>
                    <strong>{app.startupName}</strong>
                    <p className="text-muted sm">{app.founderName}</p>
                  </td>
                  <td>{app.sector}</td>
                  <td>
                    <span
                      className={`fit-score fit-${getDecisionScore(app) >= 80 ? 'high' : getDecisionScore(app) >= 65 ? 'mid' : 'low'}`}
                    >
                      {getDecisionScore(app)}
                    </span>
                  </td>
                  <td>
                    <Badge status={app.stage} />
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        openApplicationModal(app.id)
                      }}
                    >
                      View Application
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Application Details">
        {selected ? (
          <div className="shortlist-application-view">
            <div className="shortlist-title-row">
              <div>
                <p className="step-eyebrow">APPLICATION FORM</p>
                <h4>{selected.startupName}</h4>
                <p className="text-muted sm">{selected.oneLiner}</p>
              </div>
              <span
                className={`fit-score fit-${getDecisionScore(selected) >= 80 ? 'high' : getDecisionScore(selected) >= 65 ? 'mid' : 'low'}`}
              >
                Score {getDecisionScore(selected)}
              </span>
            </div>

            <div className="shortlist-field-grid">
              <div className="shortlist-field">
                <label>Founder name</label>
                <p>{selected.founderName}</p>
              </div>
              <div className="shortlist-field">
                <label>Founder email</label>
                <p>{selected.founderEmail}</p>
              </div>
              <div className="shortlist-field">
                <label>Startup website</label>
                <p>{selected.website}</p>
              </div>
              <div className="shortlist-field">
                <label>Sector / stage</label>
                <p>
                  {selected.sector} · {selected.startupStage}
                </p>
              </div>
              <div className="shortlist-field">
                <label>Location</label>
                <p>{selected.location}</p>
              </div>
              <div className="shortlist-field">
                <label>Team emails</label>
                <p>{[selected.founderEmail, ...(selected.teamEmails || [])].join(', ')}</p>
              </div>
            </div>

            <div className="shortlist-field-block">
              <label>Problem statement</label>
              <p>{selected.application?.problemStatement}</p>
            </div>
            <div className="shortlist-field-block">
              <label>Solution</label>
              <p>{selected.application?.solution}</p>
            </div>
            <div className="shortlist-field-block">
              <label>Target customer</label>
              <p>{selected.application?.targetCustomer}</p>
            </div>
            <div className="shortlist-field-block">
              <label>Market size</label>
              <p>{selected.application?.marketSize}</p>
            </div>
            <div className="shortlist-field-block">
              <label>Business model</label>
              <p>{selected.application?.businessModel}</p>
            </div>
            <div className="shortlist-field-block">
              <label>Traction</label>
              <p>{selected.application?.traction}</p>
            </div>
            <div className="shortlist-field-block">
              <label>Ask from incubator</label>
              <p>{selected.application?.askFromIncubator}</p>
            </div>

            <div className="ic-score-grid">
              {Object.entries(selected.scorecard || {}).map(([k, v]) => (
                <div key={k} className="ic-score-box">
                  <span>{k}</span>
                  <strong>{v}/10</strong>
                </div>
              ))}
            </div>

            <div className="shortlist-bottom-actions">
              <Button
                variant="danger"
                onClick={() => {
                  rejectApplication(selected)
                  setIsModalOpen(false)
                }}
              >
                Reject
              </Button>
              <Button onClick={() => sendShortlistMail(selected)}>Send Shortlist Mail</Button>
            </div>
          </div>
        ) : (
          <p className="text-muted">No application selected.</p>
        )}
      </Modal>

      {toast && <div className={`mw-toast ${toast.type}`}>{toast.message}</div>}
    </DashboardLayout>
  )
}

