import { Button } from '../../ui'
import { AiSectionHeader, EditableText } from './shared'

function ListSection({ title, items, onAdd, field, data, onUpdate }) {
  return (
    <section className="wizard-section">
      <AiSectionHeader title={title} onRegenerate={() => {}} />
      <ul className="wizard-bullet-list">
        {items.map((item, i) => (
          <li key={i}>
            <EditableText
              value={item}
              onChange={(v) => {
                const next = [...items]
                next[i] = v
                onUpdate({ [field]: next })
              }}
              rows={2}
            />
          </li>
        ))}
      </ul>
      <Button variant="secondary" size="sm" onClick={onAdd}>
        Add {title.toLowerCase().replace(/^key /, 'a ').replace(/^supporting /, 'a supporting ').replace(/^what /, 'an ')}
      </Button>
    </section>
  )
}

export default function CustomerStep({ data, onUpdate }) {
  const updatePersona = (field, val) =>
    onUpdate({ persona: { ...data.persona, [field]: val } })

  const addToList = (field) => {
    onUpdate({ [field]: [...data[field], ''] })
  }

  return (
    <div className="explore-step">
      <div className="explore-step-header">
        <span className="step-badge">Step 2 — Customer</span>
        <h2>Who has this problem?</h2>
        <p className="section-desc">{data.intro}</p>
      </div>

      <section className="wizard-section persona-card">
        <div className="persona-top">
          <div className="persona-avatar">{data.persona.initials}</div>
          <div>
            <EditableText
              value={data.persona.name}
              onChange={(v) => updatePersona('name', v)}
              rows={1}
            />
            <span className="persona-subtitle">{data.persona.subtitle}</span>
          </div>
        </div>
        <h4>Why we chose this person</h4>
        <EditableText value={data.persona.whyChosen} onChange={(v) => updatePersona('whyChosen', v)} rows={4} />
      </section>

      <section className="wizard-section">
        <AiSectionHeader title="Who they are" onRegenerate={() => {}} />
        <EditableText value={data.whoTheyAre} onChange={(v) => onUpdate({ whoTheyAre: v })} rows={4} />
      </section>

      <section className="wizard-section">
        <AiSectionHeader title="Job to be Done" onRegenerate={() => {}} />
        <EditableText value={data.jobToBeDone} onChange={(v) => onUpdate({ jobToBeDone: v })} rows={4} />
      </section>

      <ListSection
        title="Supporting intentions"
        items={data.supportingIntentions}
        field="supportingIntentions"
        data={data}
        onUpdate={onUpdate}
        onAdd={() => addToList('supportingIntentions')}
      />

      <ListSection
        title="Key frustrations"
        items={data.keyFrustrations}
        field="keyFrustrations"
        data={data}
        onUpdate={onUpdate}
        onAdd={() => addToList('keyFrustrations')}
      />

      <ListSection
        title="What they do today instead"
        items={data.alternatives}
        field="alternatives"
        data={data}
        onUpdate={onUpdate}
        onAdd={() => addToList('alternatives')}
      />

      <section className="wizard-section">
        <div className="ai-section-header">
          <h4>Why they&apos;ll switch</h4>
          <div className="ai-section-actions">
            <span className="inline-label-sm">Switching condition · auto-assumed</span>
            <button type="button" className="btn-text">Regenerate</button>
          </div>
        </div>
        <ul className="wizard-bullet-list">
          {data.switchingConditions.map((item, i) => (
            <li key={i}>
              <EditableText
                value={item}
                onChange={(v) => {
                  const next = [...data.switchingConditions]
                  next[i] = v
                  onUpdate({ switchingConditions: next })
                }}
                rows={2}
              />
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="sm" onClick={() => addToList('switchingConditions')}>
          Add a switching condition
        </Button>
        <p className="hint-text">Each becomes an assumption auto-tested in Phase 2.</p>
      </section>
    </div>
  )
}
