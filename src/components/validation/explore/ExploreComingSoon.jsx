import { EXPLORE_STEPS } from '../../../data/exploreWizardSeed'

export default function ExploreComingSoon({ step }) {
  const info = EXPLORE_STEPS.find((s) => s.id === step)
  return (
    <div className="explore-step explore-coming-soon">
      <div className="explore-step-header">
        <span className="step-badge">Step {info?.step} — {info?.title}</span>
        <h2>{info?.question}</h2>
      </div>
      <div className="coming-soon-box">
        <span className="coming-soon-icon">◷</span>
        <h3>Coming in the next update</h3>
        <p>This step will be populated with AI-generated content like Problem, Customer, and Market. Use the wizard nav to review completed steps.</p>
      </div>
    </div>
  )
}
