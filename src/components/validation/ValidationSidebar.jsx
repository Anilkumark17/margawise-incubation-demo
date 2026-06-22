import { useEffect, useState } from 'react'
import { VALIDATION_PHASES } from '../../data/validation'
import { EXPLORE_STEPS } from '../../data/exploreWizardSeed'

const VAL_SIDEBAR_KEY = 'margawise_val_sidebar_collapsed'

export default function ValidationSidebar({
  activePhase,
  activeExploreStep,
  validateTab,
  wizard,
  onPhaseChange,
  onExploreStepChange,
  onValidateTabChange,
}) {
  const exploreDone = (stepId) => wizard[stepId]?.complete
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(VAL_SIDEBAR_KEY) === 'true'
  )

  useEffect(() => {
    localStorage.setItem(VAL_SIDEBAR_KEY, String(collapsed))
  }, [collapsed])

  return (
    <aside className={`validation-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="vs-sidebar-head">
        {!collapsed && <span className="vs-head-title">Journey</span>}
        <button
          type="button"
          className="sidebar-toggle sm"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
          aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <div className="vs-phase">
        {!collapsed && <span className="vs-phase-label">Phase 1 — Explore</span>}
        {collapsed && <span className="vs-phase-label compact">1</span>}
        <ul className="vs-steps">
          {EXPLORE_STEPS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                title={collapsed ? s.title : undefined}
                className={`vs-step ${activePhase === 'explore' && activeExploreStep === s.id ? 'active' : ''}`}
                onClick={() => {
                  onPhaseChange('explore')
                  onExploreStepChange(s.id)
                }}
              >
                {exploreDone(s.id) ? <span className="vs-check">✓</span> : <span className="vs-dot" />}
                {!collapsed && <span className="vs-step-label">{s.title}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="vs-phase">
        {!collapsed && <span className="vs-phase-label">Phase 2 — Assumed</span>}
        {collapsed && <span className="vs-phase-label compact">2</span>}
        <ul className="vs-steps">
          <li>
            <button
              type="button"
              title={collapsed ? 'Assumptions' : undefined}
              className={`vs-step ${activePhase === 'assumed' ? 'active' : ''}`}
              onClick={() => onPhaseChange('assumed')}
            >
              <span className="vs-check">✓</span>
              {!collapsed && <span className="vs-step-label">Assumptions</span>}
            </button>
          </li>
        </ul>
      </div>

      <div className="vs-phase">
        {!collapsed && <span className="vs-phase-label">Phase 3 — Validate</span>}
        {collapsed && <span className="vs-phase-label compact">3</span>}
        <ul className="vs-steps">
          {VALIDATION_PHASES[2].steps.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                title={collapsed ? s.label : undefined}
                className={`vs-step ${activePhase === 'validate' && validateTab === s.id ? 'active' : ''}`}
                onClick={() => {
                  onPhaseChange('validate')
                  onValidateTabChange(s.id)
                }}
              >
                <span className="vs-dot" />
                {!collapsed && <span className="vs-step-label">{s.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="vs-phase">
        {!collapsed && <span className="vs-phase-label">Phase 4 — Next Steps</span>}
        {collapsed && <span className="vs-phase-label compact">4</span>}
        <ul className="vs-steps">
          <li>
            <button
              type="button"
              title={collapsed ? 'Decision' : undefined}
              className={`vs-step ${activePhase === 'next' ? 'active' : ''}`}
              onClick={() => onPhaseChange('next')}
            >
              <span className="vs-dot" />
              {!collapsed && <span className="vs-step-label">Decision</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
