import { Button } from '../../ui'
import { AiSectionHeader, EditableText } from './shared'

export default function ProblemStep({ data, onUpdate, onAddSignal, onRemoveSignal, onUpdateSignal }) {
  const update = (field, val) => onUpdate({ [field]: val })
  const updateNested = (parent, field, val) => onUpdate({ [parent]: { ...data[parent], [field]: val } })

  return (
    <div className="explore-step">
      <div className="explore-step-header">
        <span className="step-badge">Step 1 — Problem</span>
        <h2>What problem are you solving?</h2>
        <p className="section-desc">{data.intro}</p>
      </div>

      <section className="wizard-section">
        <AiSectionHeader title="Problem statement" onRegenerate={() => {}} />
        <EditableText
          value={data.problemStatement.content}
          onChange={(v) => updateNested('problemStatement', 'content', v)}
          rows={5}
        />
      </section>

      <section className="wizard-section">
        <AiSectionHeader title="Who feels this pain" onRegenerate={() => {}} />
        <span className="inline-label">{data.whoFeelsPain.label}</span>
        <EditableText
          value={data.whoFeelsPain.content}
          onChange={(v) => updateNested('whoFeelsPain', 'content', v)}
          rows={5}
        />
      </section>

      <section className="wizard-section">
        <AiSectionHeader title="Pain intensity signals" onRegenerate={() => {}} />
        <div className="signal-list">
          {data.painSignals.map((sig) => (
            <div key={sig.id} className="signal-item">
              <EditableText
                value={sig.text}
                onChange={(v) => onUpdateSignal(sig.id, v)}
                rows={2}
              />
              <div className="signal-actions">
                <button type="button" className="btn-text">Save</button>
                <button type="button" className="btn-text danger" onClick={() => onRemoveSignal(sig.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={onAddSignal}>Add a signal</Button>
      </section>

      <section className="wizard-section">
        <div className="diagnostic-header">
          <h4>Problem diagnostic — Frequency · Intensity · Visibility · Replaceability</h4>
          <div className="ai-section-actions">
            <span className="ai-badge">AI generated</span>
            <button type="button" className="btn-text">Regenerate</button>
          </div>
        </div>
        <p className="section-desc">{data.diagnostic.intro}</p>
        <div className="diagnostic-grid">
          {data.diagnostic.dimensions.map((dim) => (
            <div key={dim.id} className="diagnostic-card">
              <div className="diagnostic-card-top">
                <span className="dim-label">{dim.label}</span>
                <span className="dim-score">{dim.score}</span>
              </div>
              <p className="dim-question">{dim.question}</p>
              <EditableText
                value={dim.answer}
                onChange={(v) => {
                  const dimensions = data.diagnostic.dimensions.map((d) =>
                    d.id === dim.id ? { ...d, answer: v } : d
                  )
                  onUpdate({ diagnostic: { ...data.diagnostic, dimensions } })
                }}
                rows={3}
              />
            </div>
          ))}
        </div>
        <div className="diagnostic-summary">
          <EditableText
            value={data.diagnostic.summary}
            onChange={(v) => updateNested('diagnostic', 'summary', v)}
            rows={4}
          />
        </div>
      </section>

      <section className="wizard-section">
        <AiSectionHeader title="Why now" onRegenerate={() => {}} />
        <EditableText value={data.whyNow.content} onChange={(v) => updateNested('whyNow', 'content', v)} rows={4} />
        <div className="flagged-assumptions">
          {data.whyNow.assumptionsFlagged.map((a, i) => (
            <div key={i} className="flagged-item">
              <span className="flag-icon">⚑</span>
              <span>Assumption flagged: "{a}"</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
