import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import {
  PageHeader,
  Select,
} from '../../components/ui'
import ValidationWorkflow from '../../components/validation/ValidationWorkflow'
import MVPStage from '../../components/founder/MVPStage'
import GTMStage from '../../components/founder/GTMStage'
import FloatingMentorSuggestion from '../../components/founder/FloatingMentorSuggestion'
import { useApp } from '../../context/AppProvider'

function ValidationStage({ startup, onAddInterview, onAssumptionUpdate, onAddAssumption, onMarkSessionEvidence, onSetDecision, exploreHandlers }) {
  return (
    <ValidationWorkflow
      startup={startup}
      onAssumptionUpdate={onAssumptionUpdate}
      onAddAssumption={onAddAssumption}
      onMarkSessionEvidence={onMarkSessionEvidence}
      onAddInterview={onAddInterview}
      onSetDecision={onSetDecision}
      {...exploreHandlers}
    />
  )
}

export default function FounderDashboard() {
  const {
    data,
    getCurrentStartup,
    updateStartup,
    updateAssumption,
    addAssumption,
    markSessionEvidence,
    setValidationDecision,
    setExploreWizardStep,
    updateExploreWizardStep,
    markExploreStepComplete,
    addPainSignal,
    removePainSignal,
    updatePainSignal,
    updateStageNote,
    markStageEntrySeen,
  } = useApp()
  const navigate = useNavigate()
  const startup = getCurrentStartup()

  if (!startup) return null

  const handleStageChange = (e) => {
    updateStartup(startup.id, { stage: e.target.value })
  }

  const isWide = startup.stage === 'Validation'

  return (
    <DashboardLayout role="founder" wide={isWide}>
      {startup.stage !== 'Validation' && (
        <PageHeader
          title={startup.name}
          subtitle={`${startup.industry} · ${startup.stage} Stage`}
          action={
            <Select label="" value={startup.stage} onChange={handleStageChange} className="stage-select">
              <option>Validation</option>
              <option>MVP</option>
              <option>GTM</option>
            </Select>
          }
        />
      )}

      {startup.stage === 'Validation' && (
        <div className="dashboard-topbar">
          <div>
            <span className="startup-name">{startup.name}</span>
            <span className="text-muted sm">{startup.industry}</span>
          </div>
          <Select label="" value={startup.stage} onChange={handleStageChange} className="stage-select">
            <option>Validation</option>
            <option>MVP</option>
            <option>GTM</option>
          </Select>
        </div>
      )}

      {startup.stage === 'Validation' && (
        <ValidationStage
          startup={startup}
          onAddInterview={() => navigate('/founder/interviews/add')}
          onAssumptionUpdate={(id, patch) => updateAssumption(startup.id, id, patch)}
          onAddAssumption={(payload) => addAssumption(startup.id, payload)}
          onMarkSessionEvidence={(sessionId) => markSessionEvidence(startup.id, sessionId)}
          onSetDecision={(decision) => setValidationDecision(startup.id, decision)}
          exploreHandlers={{
            onSetExploreStep: (step) => setExploreWizardStep(startup.id, step),
            onUpdateExploreStep: (stepKey, patch) => updateExploreWizardStep(startup.id, stepKey, patch),
            onMarkExploreComplete: (step) => markExploreStepComplete(startup.id, step),
            onAddPainSignal: () => addPainSignal(startup.id),
            onRemovePainSignal: (id) => removePainSignal(startup.id, id),
            onUpdatePainSignal: (id, text) => updatePainSignal(startup.id, id, text),
          }}
        />
      )}

      {startup.stage === 'MVP' && (
        <MVPStage
          startup={startup}
          onUpdateNote={(note) => updateStageNote(startup.id, 'mvp', note)}
          onMarkEntrySeen={() => markStageEntrySeen(startup.id, 'mvp')}
        />
      )}

      {startup.stage === 'GTM' && (
        <GTMStage
          startup={startup}
          mentors={data.mentors}
          onUpdateNote={(note) => updateStageNote(startup.id, 'gtm', note)}
        />
      )}

      <FloatingMentorSuggestion
        stage={startup.stage}
        startup={startup}
        mentors={data.mentors}
        onBook={(id) => navigate(`/founder/mentors/${id}/book`)}
        onViewProfile={(id) => navigate(`/founder/mentors/${id}`)}
      />
    </DashboardLayout>
  )
}
