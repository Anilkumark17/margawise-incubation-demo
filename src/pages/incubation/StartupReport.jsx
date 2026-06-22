import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, MetricCard, Badge, Button, SimpleBarChart } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { calcValidationMetrics } from '../../data/seed'
import { getStartupIncubationSnapshot } from '../../data/incubationMilestones'

export default function StartupReport() {
  const { id } = useParams()
  const { getStartup } = useApp()
  const navigate = useNavigate()
  const startup = getStartup(id)

  if (!startup) return null

  const metrics = calcValidationMetrics(startup)
  const snapshot = getStartupIncubationSnapshot(startup)
  const segments = [...new Set(startup.interviews.map((i) => i.role))]
  const [milestones, setMilestones] = useState(() => [
    {
      id: `ms-default-${startup.id}`,
      title: snapshot.milestone.name,
      mentorFeedback: snapshot.milestone.mentorFeedback,
      recommendation: snapshot.recommendation,
      tasks: snapshot.milestone.tasks.map((task, i) => ({
        id: `task-default-${i}`,
        title: task,
        done: i < snapshot.completedSubtasks,
      })),
    },
  ])
  const [activeMilestoneId, setActiveMilestoneId] = useState(`ms-default-${startup.id}`)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newTaskText, setNewTaskText] = useState('')

  const validationProgress = [
    { label: 'Interviews', value: metrics.completed },
    { label: 'Assumptions Tested', value: metrics.tested },
    { label: 'Assumptions Validated', value: metrics.validated },
    { label: 'Validation Score', value: metrics.score },
  ]

  const weeklyActivity = [
    { label: 'Week 1', value: 3 },
    { label: 'Week 2', value: 5 },
    { label: 'Week 3', value: 2 },
    { label: 'Week 4', value: metrics.completed },
  ]

  const activeMilestone = milestones.find((m) => m.id === activeMilestoneId) || milestones[0]

  const addMilestone = () => {
    const title = newMilestoneTitle.trim()
    if (!title) return
    const id = `ms-${Date.now()}`
    setMilestones((curr) => [
      ...curr,
      {
        id,
        title,
        mentorFeedback: snapshot.milestone.mentorFeedback,
        recommendation: snapshot.recommendation,
        tasks: [],
      },
    ])
    setActiveMilestoneId(id)
    setNewMilestoneTitle('')
  }

  const addTaskToMilestone = () => {
    const task = newTaskText.trim()
    if (!task || !activeMilestoneId) return
    setMilestones((curr) =>
      curr.map((m) =>
        m.id === activeMilestoneId
          ? { ...m, tasks: [...m.tasks, { id: `task-${Date.now()}`, title: task, done: false }] }
          : m
      )
    )
    setNewTaskText('')
  }

  const toggleTask = (taskId) => {
    setMilestones((curr) =>
      curr.map((m) =>
        m.id === activeMilestoneId
          ? {
              ...m,
              tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
            }
          : m
      )
    )
  }

  const completedTasks = activeMilestone?.tasks.filter((t) => t.done).length || 0
  const totalTasks = activeMilestone?.tasks.length || 0

  return (
    <DashboardLayout role="incubation">
      <PageHeader
        title={`${startup.name} — Report`}
        subtitle={`${startup.founderName} · ${startup.stage} Stage`}
        action={<Button variant="secondary" onClick={() => navigate('/incubation/dashboard')}>← Back</Button>}
      />

      <div className="report-section">
        <h2>Validation Metrics</h2>
        <div className="metrics-row">
          <MetricCard label="Interviews Completed" value={metrics.completed} accent />
          <MetricCard label="Customer Segments" value={segments.length} accent />
          <MetricCard label="Assumptions Tested" value={metrics.tested} accent />
          <MetricCard label="Assumptions Validated" value={metrics.validated} accent />
        </div>
        <div className="chart-grid">
          <Card>
            <h3>Validation Progress</h3>
            <SimpleBarChart data={validationProgress} />
          </Card>
          <Card>
            <h3>Weekly Activity</h3>
            <SimpleBarChart data={weeklyActivity} />
          </Card>
        </div>
      </div>

      <div className="report-section">
        <h2>MVP Metrics</h2>
        <div className="metrics-row">
          <MetricCard label="Features Completed" value={startup.features.filter((f) => f.status === 'Released').length} />
          <MetricCard label="User Testing Sessions" value={startup.userTesting.testUsers} />
          <MetricCard label="Feedback Collected" value={startup.userTesting.feedbackCollected} />
        </div>
      </div>

      <div className="report-section">
        <h2>GTM Metrics</h2>
        <div className="metrics-row">
          <MetricCard label="Leads" value={startup.gtm.leads} />
          <MetricCard label="Customers" value={startup.gtm.customers} />
          <MetricCard label="Revenue" value={`$${startup.gtm.revenue.toLocaleString()}`} />
        </div>
      </div>

      <div className="report-section">
        <h2>Mentor Engagement</h2>
        <Card>
          <div className="detail-row"><span>Sessions Booked</span><span>{startup.mentorSessions}</span></div>
          <div className="detail-row"><span>Session Outcomes</span><span>Positive — strong product-market fit signals</span></div>
          <div className="detail-row"><span>Mentor Feedback</span><span>"Founder shows strong customer discovery discipline."</span></div>
        </Card>
      </div>

      <div className="report-section">
        <h2>Incubation Milestone Review</h2>
        <Card>
          <div className="section-header">
            <h3>Milestones for {startup.name}</h3>
          </div>

          <div className="ic-milestone-controls">
            <input
              className="form-input"
              placeholder="Create milestone (e.g. GTM Traction Sprint - Week 2)"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
            />
            <Button onClick={addMilestone}>Create Milestone</Button>
          </div>

          <div className="ic-startup-tabs">
            {milestones.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`ic-startup-tab ${activeMilestoneId === m.id ? 'active' : ''}`}
                onClick={() => setActiveMilestoneId(m.id)}
              >
                {m.title}
              </button>
            ))}
          </div>

          {activeMilestone ? (
            <>
              <div className="ic-milestone-head">
                <div>
                  <span className="step-eyebrow">{startup.stage} STAGE</span>
                  <h4>{activeMilestone.title}</h4>
                </div>
                <Badge status={activeMilestone.recommendation.status} />
              </div>

              <div className="ic-milestone-controls">
                <input
                  className="form-input"
                  placeholder="Add task under this milestone"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                />
                <Button variant="secondary" onClick={addTaskToMilestone}>Add Task</Button>
              </div>

              <div className="ic-milestone-grid">
                <div>
                  <p className="text-muted sm">Milestone Tasks</p>
                  {activeMilestone.tasks.length === 0 ? (
                    <p className="text-muted sm">No tasks added yet.</p>
                  ) : (
                    <ul className="wizard-bullet-list">
                      {activeMilestone.tasks.map((task) => (
                        <li key={task.id} className="ic-task-item">
                          <label className="ic-task-check">
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => toggleTask(task.id)}
                            />
                            <span>{task.title}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="text-muted sm">Progress Snapshot</p>
                  <div className="ic-mini-metrics">
                    <div>
                      <span>Subtasks completed</span>
                      <strong>{completedTasks}/{totalTasks}</strong>
                    </div>
                    <div>
                      <span>Interviews completed</span>
                      <strong>{snapshot.metrics.completed}</strong>
                    </div>
                    <div>
                      <span>Assumptions validated</span>
                      <strong>{snapshot.metrics.validated}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ic-milestone-note">
                <p><strong>Margawise Suggestion:</strong> {activeMilestone.recommendation.decision}</p>
                <p className="text-muted sm">{activeMilestone.recommendation.reason}</p>
              </div>

              <div className="ic-milestone-note mentor">
                <p><strong>Mentor Feedback:</strong></p>
                <p className="text-muted sm">{activeMilestone.mentorFeedback}</p>
              </div>
            </>
          ) : (
            <p className="text-muted sm">Create a milestone to start tracking tasks.</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
