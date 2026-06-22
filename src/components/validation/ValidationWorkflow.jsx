import { useState } from 'react'
import { Badge, Button } from '../ui'
import { VALIDATION_PHASES, getValidation } from '../../data/validation'
import { getExploreWizard } from '../../data/exploreWizardSeed'
import { EXPLORE_STEPS } from '../../data/exploreWizardSeed'
import ValidationSidebar from './ValidationSidebar'
import FloatingStepNav from './FloatingStepNav'
import ExploreWizard from './explore/ExploreWizard'
import AssumptionsBoard from './AssumptionsBoard'
import InterviewsPanel from './InterviewsPanel'

const VALIDATE_STEPS = VALIDATION_PHASES[2].steps
const LAST_EXPLORE = EXPLORE_STEPS[EXPLORE_STEPS.length - 1]

export default function ValidationWorkflow({
  startup,
  onAssumptionUpdate,
  onAddAssumption,
  onMarkSessionEvidence,
  onAddInterview,
  onSetDecision,
  onSetExploreStep,
  onUpdateExploreStep,
  onMarkExploreComplete,
  onAddPainSignal,
  onRemovePainSignal,
  onUpdatePainSignal,
}) {
  const validation = getValidation(startup)
  const wizard = getExploreWizard(startup)
  const [activePhase, setActivePhase] = useState('validate')
  const [validateTab, setValidateTab] = useState('interviews')
  const exploreStep = wizard.activeStep || 'problem'

  const exploreIndex = EXPLORE_STEPS.findIndex((s) => s.id === exploreStep)
  const validateIndex = VALIDATE_STEPS.findIndex((s) => s.id === validateTab)
  const currentExplore = EXPLORE_STEPS[exploreIndex]

  const breadcrumb = () => {
    if (activePhase === 'validate') return `Validate › ${VALIDATE_STEPS.find((s) => s.id === validateTab)?.label}`
    if (activePhase === 'assumed') return 'Assumed › Assumptions'
    if (activePhase === 'explore') return `Explore › ${currentExplore?.title}`
    return 'Next Steps › Decision'
  }

  const goExplorePrev = () => {
    if (exploreIndex > 0) onSetExploreStep(EXPLORE_STEPS[exploreIndex - 1].id)
  }

  const goExploreNext = () => {
    if (exploreIndex < EXPLORE_STEPS.length - 1) {
      onMarkExploreComplete(exploreStep)
      onSetExploreStep(EXPLORE_STEPS[exploreIndex + 1].id)
    } else {
      onMarkExploreComplete(exploreStep)
      setActivePhase('assumed')
    }
  }

  const getFloatingNav = () => {
    if (activePhase === 'explore') {
      const prevExplore = exploreIndex > 0 ? EXPLORE_STEPS[exploreIndex - 1] : null
      const nextExplore = exploreIndex < EXPLORE_STEPS.length - 1 ? EXPLORE_STEPS[exploreIndex + 1] : null
      return {
        prevLabel: prevExplore?.title || 'Start',
        nextLabel: nextExplore?.title || 'Assumptions',
        centerLabel: `STEP ${currentExplore?.step || exploreIndex + 1} / ${EXPLORE_STEPS.length} ${currentExplore?.title}`,
        onPrev: goExplorePrev,
        onNext: goExploreNext,
        prevDisabled: exploreIndex === 0,
        nextDisabled: false,
      }
    }

    if (activePhase === 'assumed') {
      return {
        prevLabel: LAST_EXPLORE.title,
        nextLabel: VALIDATE_STEPS[0].label,
        centerLabel: 'PHASE 2 / 4 — Assumptions',
        onPrev: () => {
          setActivePhase('explore')
          onSetExploreStep(LAST_EXPLORE.id)
        },
        onNext: () => {
          setActivePhase('validate')
          setValidateTab(VALIDATE_STEPS[0].id)
        },
        prevDisabled: false,
        nextDisabled: false,
      }
    }

    if (activePhase === 'validate') {
      const prevValidate = validateIndex > 0 ? VALIDATE_STEPS[validateIndex - 1] : null
      const nextValidate = validateIndex < VALIDATE_STEPS.length - 1 ? VALIDATE_STEPS[validateIndex + 1] : null
      return {
        prevLabel: validateIndex === 0 ? 'Assumptions' : prevValidate?.label,
        nextLabel: nextValidate?.label || 'Decision',
        centerLabel: `STEP ${validateIndex + 1} / ${VALIDATE_STEPS.length} ${VALIDATE_STEPS[validateIndex]?.label}`,
        onPrev: () => {
          if (validateIndex === 0) setActivePhase('assumed')
          else if (prevValidate) setValidateTab(prevValidate.id)
        },
        onNext: () => {
          if (nextValidate) setValidateTab(nextValidate.id)
          else setActivePhase('next')
        },
        prevDisabled: false,
        nextDisabled: false,
      }
    }

    // next / decision phase
    return {
      prevLabel: VALIDATE_STEPS[VALIDATE_STEPS.length - 1].label,
      nextLabel: 'Complete',
      centerLabel: 'PHASE 4 / 4 — Decision',
      onPrev: () => {
        setActivePhase('validate')
        setValidateTab(VALIDATE_STEPS[VALIDATE_STEPS.length - 1].id)
      },
      onNext: () => {},
      prevDisabled: false,
      nextDisabled: true,
    }
  }

  const floatingNav = getFloatingNav()

  return (
    <div className="validation-shell">
      <ValidationSidebar
        activePhase={activePhase}
        activeExploreStep={exploreStep}
        validateTab={validateTab}
        wizard={wizard}
        onPhaseChange={setActivePhase}
        onExploreStepChange={onSetExploreStep}
        onValidateTabChange={setValidateTab}
      />

      <div className="validation-main">
        {activePhase !== 'validate' || validateTab !== 'interviews' ? (
          <nav className="breadcrumb">
            <span>{breadcrumb().split(' › ')[0]}</span>
            <span className="bc-sep">›</span>
            <span className="bc-active">{breadcrumb().split(' › ')[1]}</span>
          </nav>
        ) : null}

        {activePhase === 'explore' && (
          <ExploreWizard
            wizard={wizard}
            onSetStep={(step) => onSetExploreStep(step)}
            onUpdateStep={(stepKey, patch) => onUpdateExploreStep(stepKey, patch)}
            onAddPainSignal={onAddPainSignal}
            onRemovePainSignal={onRemovePainSignal}
            onUpdatePainSignal={onUpdatePainSignal}
          />
        )}

        {activePhase === 'assumed' && (
          <AssumptionsBoard
            startup={startup}
            onUpdateAssumption={onAssumptionUpdate}
            onAddAssumption={onAddAssumption}
          />
        )}

        {activePhase === 'validate' && validateTab === 'interviews' && (
          <InterviewsPanel
            startup={startup}
            onNewInterview={onAddInterview}
            onMarkSessionEvidence={onMarkSessionEvidence}
            onOpenFramework={onAddInterview}
          />
        )}

        {activePhase === 'validate' && validateTab === 'surveys' && (
          <div className="validate-content">
            <header className="content-header">
              <span className="step-eyebrow">SURVEYS</span>
              <h1>Surveys</h1>
              <p>Collect quantitative evidence to complement interview insights.</p>
            </header>
            <div className="survey-grid">
              {validation.surveys.map((s) => (
                <div key={s.id} className="surface-card">
                  <h4>{s.title}</h4>
                  <p className="text-muted">{s.questionCount} questions · {s.responses} responses</p>
                  <Badge status={s.status} />
                  <div className="card-actions">
                    <Button size="sm" variant="secondary">View Results</Button>
                    <Button size="sm">Share Survey</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-lg">+ Create New Survey</Button>
          </div>
        )}

        {activePhase === 'validate' && validateTab === 'experiments' && (
          <div className="validate-content">
            <header className="content-header">
              <span className="step-eyebrow">EXPERIMENTS</span>
              <h1>Experiments</h1>
              <p>Run low-cost tests to validate or invalidate your riskiest assumptions.</p>
            </header>
            <div className="experiment-grid">
              {validation.experiments.map((ex) => (
                <div key={ex.id} className="surface-card">
                  <div className="card-top">
                    <h4>{ex.name}</h4>
                    <Badge status={ex.status} />
                  </div>
                  <p className="experiment-hypothesis"><strong>Hypothesis:</strong> {ex.hypothesis}</p>
                  {ex.result && <p className="text-muted">{ex.result}</p>}
                  <div className="card-actions">
                    <Button size="sm" variant="secondary">View Details</Button>
                    <Button size="sm">Log Result</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-lg">+ Design Experiment</Button>
          </div>
        )}

        {activePhase === 'next' && (
          <div className="validate-content">
            <header className="content-header">
              <span className="step-eyebrow">PHASE 4 — NEXT STEPS</span>
              <h1>Decision</h1>
              <p>Based on your validation evidence, decide how to move forward.</p>
            </header>
            <div className="decision-grid">
              {[
                { label: 'Proceed to MVP', desc: 'Enough validation — start building your minimum viable product.', icon: '→' },
                { label: 'Pivot', desc: 'Key assumptions invalidated — adjust problem, customer, or solution.', icon: '↻' },
                { label: 'Continue Validating', desc: 'More evidence needed — run additional interviews and experiments.', icon: '◷' },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  className={`decision-card ${validation.decision === d.label ? 'selected' : ''}`}
                  onClick={() => onSetDecision(d.label)}
                >
                  <span className="decision-icon">{d.icon}</span>
                  <h4>{d.label}</h4>
                  <p>{d.desc}</p>
                </button>
              ))}
            </div>
            {validation.decision && (
              <div className="decision-confirmed">
                <Badge status="Validated" />
                <span>Decision recorded: <strong>{validation.decision}</strong></span>
              </div>
            )}
          </div>
        )}

        <FloatingStepNav {...floatingNav} />
      </div>
    </div>
  )
}
