import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, MetricCard, Card, Button, Badge, Select } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { getStartupIncubationSnapshot } from '../../data/incubationMilestones'

const PREVIOUS_INCUBATED_STARTUPS = [
  {
    id: 'prev-1',
    founderName: 'Ritika Sharma',
    startupName: 'CropLens',
    problemStatement: 'Small farms lack affordable tools to detect pest outbreaks before crop loss.',
    contact: 'ritika@croplens.in | +91 98765 43210',
  },
  {
    id: 'prev-2',
    founderName: 'Imran Khan',
    startupName: 'SkillPort',
    problemStatement: 'Blue-collar workers struggle to access job-ready skilling with verified placement support.',
    contact: 'imran@skillport.in | +91 99887 22110',
  },
  {
    id: 'prev-3',
    founderName: 'Nandini Rao',
    startupName: 'MediBridge',
    problemStatement: 'Tier-2 and tier-3 clinics face delays in specialist referrals and patient follow-ups.',
    contact: 'nandini@medibridge.health | +91 99110 55443',
  },
]

export default function IncubationDashboard() {
  const { data } = useApp()
  const navigate = useNavigate()
  const { startups } = data
  const [directoryTab, setDirectoryTab] = useState('active')
  const [search, setSearch] = useState('')
  const [cohortFilter, setCohortFilter] = useState('All')
  const [stageFilter, setStageFilter] = useState('All')
  const [healthFilter, setHealthFilter] = useState('All')

  const getSelectionCohort = (startup) => {
    const c = (startup.cohort || '').toLowerCase()
    if (c.includes('winter')) return 'Winter Selection'
    if (c.includes('spring')) return 'Spring Selection'
    if (c.includes('alpha')) return 'Spring Selection'
    if (c.includes('beta') || c.includes('gamma')) return 'Winter Selection'
    return 'Spring Selection'
  }

  const cohorts = useMemo(
    () => ['All', ...new Set(startups.map((s) => getSelectionCohort(s)).filter(Boolean))],
    [startups]
  )
  const stages = useMemo(
    () => ['All', ...new Set(startups.map((s) => s.stage).filter(Boolean))],
    [startups]
  )
  const healthStates = useMemo(
    () => ['All', ...new Set(startups.map((s) => s.status).filter(Boolean))],
    [startups]
  )

  const startupRows = useMemo(
    () =>
      startups.map((startup) => {
        const { metrics, milestone, completedSubtasks, recommendation } = getStartupIncubationSnapshot(startup)
        return { startup, metrics, milestone, completedSubtasks, recommendation }
      }),
    [startups]
  )

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return startupRows
      .filter(({ startup }) => {
        const matchSearch =
          !q ||
          startup.name.toLowerCase().includes(q) ||
          getSelectionCohort(startup).toLowerCase().includes(q) ||
          (startup.industry || '').toLowerCase().includes(q)
        return (
          matchSearch &&
          (cohortFilter === 'All' || getSelectionCohort(startup) === cohortFilter) &&
          (stageFilter === 'All' || startup.stage === stageFilter) &&
          (healthFilter === 'All' || startup.status === healthFilter)
        )
      })
      .sort((a, b) => b.metrics.score - a.metrics.score)
  }, [startupRows, search, cohortFilter, stageFilter, healthFilter])

  return (
    <DashboardLayout role="incubation">
      <PageHeader
        title="Incubation Manager Dashboard"
        subtitle="Startup stage tracking, milestone execution, validation evidence, and mentor feedback"
      />

      <div className="metrics-row">
        <MetricCard label="Applied Startups" value={startups.length} accent />
        <MetricCard
          label="Avg Mentorship Sessions"
          value={
            startups.length
              ? Math.round(startups.reduce((sum, s) => sum + (s.mentorSessions || 0), 0) / startups.length)
              : 0
          }
          accent
        />
        <MetricCard
          label="Avg Interviews Completed"
          value={
            startups.length
              ? Math.round(startupRows.reduce((sum, s) => sum + s.metrics.completed, 0) / startups.length)
              : 0
          }
          accent
        />
        <MetricCard
          label="Assumptions Validated"
          value={startupRows.reduce((sum, s) => sum + s.metrics.validated, 0)}
          accent
        />
      </div>

      <Card className="section-card">
        <div className="section-header">
          <div>
            <h3>Startup Directory</h3>
            <p className="text-muted sm">
              {directoryTab === 'active'
                ? 'Complete cohort view ranked by validation score'
                : 'Archive of previously incubated startups'}
            </p>
          </div>
          <span className="text-muted sm">
            {directoryTab === 'active' ? `${filteredRows.length} startups` : `${PREVIOUS_INCUBATED_STARTUPS.length} startups`}
          </span>
        </div>
        <div className="ic-app-tabs" style={{ marginBottom: 14 }}>
          <button
            type="button"
            className={`ic-app-tab ${directoryTab === 'active' ? 'active' : ''}`}
            onClick={() => setDirectoryTab('active')}
          >
            Current Startups
          </button>
          <button
            type="button"
            className={`ic-app-tab ${directoryTab === 'previous' ? 'active' : ''}`}
            onClick={() => setDirectoryTab('previous')}
          >
            Previous Incubated Startups
          </button>
        </div>
        {directoryTab === 'active' ? (
          <div className="ic-startups-toolbar">
            <input
              className="form-input ic-startups-search"
              placeholder="Search by startup, cohort, or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="shortlist-filters">
              <Select label="Cohort" value={cohortFilter} onChange={(e) => setCohortFilter(e.target.value)}>
                {cohorts.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select label="Stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                {stages.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Select label="Health" value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)}>
                {healthStates.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
        ) : null}
        <div className="table-wrap">
          {directoryTab === 'active' ? (
            <table className="data-table ic-startups-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Startup</th>
                  <th>Selection Cohort</th>
                  <th>Stage</th>
                  <th>Health</th>
                  <th>Interviews</th>
                  <th>Assumptions Validated</th>
                  <th>Mentorship Sessions</th>
                  <th>Current Milestone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => {
                  const s = row.startup
                  return (
                    <tr key={s.id}>
                      <td><span className="shortlist-rank">#{index + 1}</span></td>
                      <td><strong>{s.name}</strong></td>
                      <td>{getSelectionCohort(s)}</td>
                      <td><Badge status={s.stage} /></td>
                      <td><Badge status={s.status || 'Active'} /></td>
                      <td>{row.metrics.completed}</td>
                      <td>{row.metrics.validated}</td>
                      <td>{s.mentorSessions || 0}</td>
                      <td>{row.milestone?.name || '—'}</td>
                      <td>
                        <div className="table-actions">
                          <Button size="sm" onClick={() => navigate(`/incubation/startup/${s.id}/report`)}>
                            Report
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-muted sm" style={{ padding: '16px 12px' }}>
                      No startups match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="data-table ic-startups-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Founder Name</th>
                  <th>Startup Name</th>
                  <th>Problem Statement</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {PREVIOUS_INCUBATED_STARTUPS.map((startup, index) => (
                  <tr key={startup.id}>
                    <td><span className="shortlist-rank">#{index + 1}</span></td>
                    <td>{startup.founderName}</td>
                    <td><strong>{startup.startupName}</strong></td>
                    <td>{startup.problemStatement}</td>
                    <td>{startup.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </DashboardLayout>
  )
}
