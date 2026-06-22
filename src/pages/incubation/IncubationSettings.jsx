import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Card, PageHeader } from '../../components/ui'

export default function IncubationSettings() {
  return (
    <DashboardLayout role="incubation">
      <PageHeader
        title="Program Settings"
        subtitle="Configure intake targets, reviewer workflow, mentor matching, and reporting cadence"
      />

      <div className="section-grid">
        <Card className="section-card">
          <h3>Cohort Setup Defaults</h3>
          <div className="list-item">
            <span>Intake target</span>
            <strong>24 startups</strong>
          </div>
          <div className="list-item">
            <span>Application window</span>
            <strong>45 days</strong>
          </div>
          <div className="list-item">
            <span>Reviewer quorum</span>
            <strong>3 reviewers / application</strong>
          </div>
          <div className="table-actions mt-lg">
            <Button variant="secondary">Edit Defaults</Button>
          </div>
        </Card>

        <Card className="section-card">
          <h3>Automation Rules</h3>
          <div className="list-item">
            <span>At-risk trigger</span>
            <strong>Miss 2 milestones</strong>
          </div>
          <div className="list-item">
            <span>Quarterly alumni prompt</span>
            <strong>Enabled</strong>
          </div>
          <div className="list-item">
            <span>Auto impact report cadence</span>
            <strong>Monthly</strong>
          </div>
          <div className="table-actions mt-lg">
            <Button variant="secondary">Manage Rules</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

