import { Button } from '../../ui'
import { AiSectionHeader, EditableText } from './shared'

function ScopeList({ title, items, onUpdate, addLabel }) {
  return (
    <section className="wizard-section">
      <h4>{title}</h4>
      <ul className="scope-list">
        {items.map((item, i) => (
          <li key={i}>
            <EditableText
              value={item}
              onChange={(v) => {
                const next = [...items]
                next[i] = v
                onUpdate(next)
              }}
              rows={1}
            />
          </li>
        ))}
      </ul>
      <Button variant="secondary" size="sm" onClick={() => onUpdate([...items, ''])}>
        Add item
      </Button>
    </section>
  )
}

export default function SolutionStep({ data, onUpdate }) {
  const vp = data.valueProposition || {}
  const updateVp = (field, val) =>
    onUpdate({ valueProposition: { ...vp, [field]: val } })

  return (
    <div className="explore-step">
      <div className="explore-step-header">
        <span className="step-badge">Step 6 — Solution</span>
        <h2>What are you actually building?</h2>
        <p className="section-desc">{data.intro}</p>
      </div>

      <section className="wizard-section">
        <AiSectionHeader title="Value Proposition" onRegenerate={() => {}} />
        <p className="hint-text">One sentence the founder can repeat in any room. Edit until it&apos;s the version you&apos;d say out loud.</p>
        <EditableText value={vp.sentence || ''} onChange={(v) => updateVp('sentence', v)} rows={3} />

        <div className="vp-grid">
          <div className="vp-field">
            <label>Customer</label>
            <EditableText value={vp.customer || ''} onChange={(v) => updateVp('customer', v)} rows={2} />
          </div>
          <div className="vp-field">
            <label>Outcome</label>
            <EditableText value={vp.outcome || ''} onChange={(v) => updateVp('outcome', v)} rows={2} />
          </div>
          <div className="vp-field">
            <label>Mechanism</label>
            <EditableText value={vp.mechanism || ''} onChange={(v) => updateVp('mechanism', v)} rows={2} />
          </div>
          <div className="vp-field">
            <label>Unlike</label>
            <EditableText value={vp.unlike || ''} onChange={(v) => updateVp('unlike', v)} rows={2} />
          </div>
        </div>
      </section>

      <section className="wizard-section">
        <AiSectionHeader title="Why now" onRegenerate={() => {}} />
        <p className="hint-text">The market shift that makes this winnable today and not five years ago.</p>
        <EditableText value={data.whyNow || ''} onChange={(v) => onUpdate({ whyNow: v })} rows={4} />
      </section>

      <section className="wizard-section">
        <div className="ai-section-header">
          <h4>Why you</h4>
          <span className="inline-label-sm">Founder voice</span>
        </div>
        <p className="hint-text">What unique insights or experiences make you uniquely capable of solving this?</p>
        <EditableText
          value={data.whyYou || ''}
          onChange={(v) => onUpdate({ whyYou: v })}
          rows={4}
          placeholder="Your honest answer…"
        />
      </section>

      <p className="phase-note">{data.phaseNote}</p>

      <ScopeList
        title="Scope — In scope (v1)"
        items={data.scopeIn || []}
        onUpdate={(items) => onUpdate({ scopeIn: items })}
      />

      <ScopeList
        title="Out of scope (deferred)"
        items={data.scopeOut || []}
        onUpdate={(items) => onUpdate({ scopeOut: items })}
      />

      <section className="wizard-section flagged-section">
        <h4>Assumptions flagged</h4>
        {(data.assumptionsFlagged || []).map((a, i) => (
          <div key={i} className="flagged-item">
            <span className="flag-icon">⚑</span>
            <span>{a.text}</span>
            <span className={`severity-badge ${a.severity}`}>{a.severity}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
