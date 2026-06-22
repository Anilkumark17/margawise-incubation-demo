import { EXPLORE_STEPS } from '../../../data/exploreWizardSeed'
import ProblemStep from './ProblemStep'
import CustomerStep from './CustomerStep'
import MarketStep from './MarketStep'
import ChannelStep from './ChannelStep'
import EconomicsStep from './EconomicsStep'
import SolutionStep from './SolutionStep'

export default function ExploreWizard({
  wizard,
  onSetStep,
  onUpdateStep,
  onAddPainSignal,
  onRemovePainSignal,
  onUpdatePainSignal,
}) {
  const stepIndex = EXPLORE_STEPS.findIndex((s) => s.id === wizard.activeStep)
  const current = EXPLORE_STEPS[stepIndex]

  return (
    <div className="explore-wizard">
      <nav className="explore-wizard-nav">
        {EXPLORE_STEPS.map((s, i) => {
          const done = wizard[s.id]?.complete
          const active = wizard.activeStep === s.id
          return (
            <button
              key={s.id}
              type="button"
              className={`wizard-nav-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}
              onClick={() => onSetStep(s.id)}
            >
              <span className="wizard-nav-num">{done ? '✓' : s.step}</span>
              <span className="wizard-nav-label">{s.title}</span>
            </button>
          )
        })}
      </nav>

      <div className="explore-wizard-body">
        <header className="content-header">
          <span className="step-eyebrow">
            STEP {current?.step} — {current?.title?.toUpperCase()}
          </span>
          <h1>{current?.question}</h1>
        </header>
        {wizard.activeStep === 'problem' && (
          <ProblemStep
            data={wizard.problem}
            onUpdate={(patch) => onUpdateStep('problem', patch)}
            onAddSignal={onAddPainSignal}
            onRemoveSignal={onRemovePainSignal}
            onUpdateSignal={onUpdatePainSignal}
          />
        )}
        {wizard.activeStep === 'customer' && (
          <CustomerStep data={wizard.customer} onUpdate={(patch) => onUpdateStep('customer', patch)} />
        )}
        {wizard.activeStep === 'market' && (
          <MarketStep data={wizard.market} onUpdate={(patch) => onUpdateStep('market', patch)} />
        )}
        {wizard.activeStep === 'channel' && (
          <ChannelStep data={wizard.channel} onUpdate={(patch) => onUpdateStep('channel', patch)} />
        )}
        {wizard.activeStep === 'economics' && (
          <EconomicsStep data={wizard.economics} onUpdate={(patch) => onUpdateStep('economics', patch)} />
        )}
        {wizard.activeStep === 'solution' && (
          <SolutionStep data={wizard.solution} onUpdate={(patch) => onUpdateStep('solution', patch)} />
        )}
      </div>
    </div>
  )
}
