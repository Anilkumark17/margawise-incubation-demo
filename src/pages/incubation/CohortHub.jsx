import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Button, Card, PageHeader } from '../../components/ui'
import { MILESTONE_COLUMNS, MOCK_MILESTONES } from '../../data/incubationPrototypeData'
import { useApp } from '../../context/AppProvider'

const STAGE_FLOW = {
  'To Do': 'In Progress',
  'In Progress': 'Validated',
  Validated: 'Validated',
  Blocked: 'In Progress',
}

export default function CohortHub() {
  const { data } = useApp()
  const [selectedStartupId, setSelectedStartupId] = useState(data.startups[0]?.id ?? null)
  const [milestones, setMilestones] = useState(MOCK_MILESTONES)
  const [flagged, setFlagged] = useState([])

  const selectedStartup = data.startups.find((s) => s.id === selectedStartupId) ?? data.startups[0]
  const milestoneCols = useMemo(
    () =>
      MILESTONE_COLUMNS.map((col) => ({
        column: col,
        items: milestones.filter((m) => m.status === col),
      })),
    [milestones]
  )

  const moveMilestone = (id) => {
    setMilestones((curr) =>
      curr.map((m) => (m.id === id ? { ...m, status: STAGE_FLOW[m.status] ?? m.status } : m))
    )
  }

  const flagStartup = () => {
    if (!selectedStartup) return
    setFlagged((curr) =>
      curr.some((f) => f.id === selectedStartup.id)
        ? curr
        : [...curr, { id: selectedStartup.id, name: selectedStartup.name, reason: 'Missed 2 milestones this cycle' }]
    )
  }

  return (
    <DashboardLayout role="incubation">
      <PageHeader
        title="Cohort Tracker"
        subtitle="Onboarding -> Active Program -> Validation execution monitoring"
      />

      <Card className="section-card">
        <div className="section-header">
          <h3>Select Startup</h3>
          <div className="ic-startup-tabs">
            {data.startups.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`ic-startup-tab ${selectedStartupId === s.id ? 'active' : ''}`}
                onClick={() => setSelectedStartupId(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {flagged.length > 0 && (
        <Card className="section-card ic-risk-banner">
          <h3>Flagged for Review</h3>
          <div className="alerts-list">
            {flagged.map((f) => (
              <div key={f.id} className="alert-item alert-warning">
                ⚠ {f.name}: {f.reason}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="section-card">
        <div className="section-header">
          <div>
            <h3>Milestone & Validation Board — {selectedStartup?.name}</h3>
            <p className="text-muted sm">Click "Move to Next" to simulate progress flow.</p>
          </div>
          <div className="table-actions">
            <Button variant="secondary">Add Milestone</Button>
            <Button variant="danger" onClick={flagStartup}>
              Flag for Review
            </Button>
          </div>
        </div>
        <div className="ic-kanban-grid">
          {milestoneCols.map((col) => (
            <div key={col.column} className="ic-kanban-col">
              <div className="ic-kanban-head">
                <strong>{col.column}</strong>
                <Badge status={col.column === 'Blocked' ? 'At Risk' : col.column} />
              </div>
              {col.items.map((m) => (
                <div key={m.id} className="ic-mile-card">
                  <h4>{m.title}</h4>
                  <p className="text-muted sm">Owner: {m.owner}</p>
                  <p className="text-muted sm">Due: {m.dueDate}</p>
                  <div className="ic-mile-actions">
                    <Badge status={m.status} />
                    <Button size="sm" variant="secondary" onClick={() => moveMilestone(m.id)}>
                      Move to Next
                    </Button>
                  </div>
                </div>
              ))}
              {col.items.length === 0 && <p className="text-muted sm">No milestones in this lane.</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="section-card">
        <h3>Shared Mentor Session Log</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Startup</th>
                <th>Mentor</th>
                <th>Session Note</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-06-21</td>
                <td>{selectedStartup?.name}</td>
                <td>Dr. Priya Sharma</td>
                <td>Founder needs tighter evidence before feature expansion.</td>
                <td>
                  <Badge status="At Risk" />
                </td>
              </tr>
              <tr>
                <td>2026-06-18</td>
                <td>{selectedStartup?.name}</td>
                <td>James Okafor</td>
                <td>GTM narrative improved after ICP narrowing exercise.</td>
                <td>
                  <Badge status="On Track" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  )
}

