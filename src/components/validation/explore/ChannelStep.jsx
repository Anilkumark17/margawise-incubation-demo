import { Button } from '../../ui'
import { AiSectionHeader, EditableText } from './shared'

function ScoreBar({ label, value }) {
  return (
    <div className="score-bar">
      <span className="score-label">{label}</span>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${value * 10}%` }} />
      </div>
      <span className="score-val">{value}/10</span>
    </div>
  )
}

export default function ChannelStep({ data, onUpdate }) {
  const setPrimary = (id) => onUpdate({ primaryChannelId: id })

  const updateChannel = (id, patch) => {
    onUpdate({
      channels: data.channels.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })
  }

  const addChannel = () => {
    onUpdate({
      channels: [
        ...data.channels,
        {
          id: `ch-${Date.now()}`,
          name: 'New channel',
          type: 'Community',
          timing: 'Start now',
          description: '',
          thisWeek: ['Define first action for this week'],
          scores: { reach: 5, effort: 5, conversion: 5 },
          scoreNote: '',
        },
      ],
    })
  }

  return (
    <div className="explore-step">
      <div className="explore-step-header">
        <span className="step-badge">Step 4 — Channel</span>
        <h2>How do you reach your customer?</h2>
        <p className="section-desc">{data.intro}</p>
      </div>

      <section className="wizard-section">
        <div className="ai-section-header">
          <h4>Channel Hypothesis</h4>
          <div className="ai-section-actions">
            <span className="ai-badge">AI</span>
            <button type="button" className="btn-text">Regenerate</button>
          </div>
        </div>
        <p className="hint-text">Your testable bet about how this customer learns this exists. Edit anytime — you&apos;ll prove or disprove it in interviews.</p>
        <EditableText value={data.hypothesis} onChange={(v) => onUpdate({ hypothesis: v })} rows={4} />
        <p className="autosave-hint">Saves automatically when you click away.</p>
      </section>

      <p className="primary-note">{data.primaryNote}</p>

      <div className="channel-list">
        {data.channels.map((ch) => {
          const isPrimary = data.primaryChannelId === ch.id
          return (
            <div key={ch.id} className={`channel-card ${isPrimary ? 'primary' : ''}`}>
              <div className="channel-card-header">
                <div>
                  <EditableText
                    value={ch.name}
                    onChange={(v) => updateChannel(ch.id, { name: v })}
                    rows={2}
                  />
                  <div className="channel-meta">
                    <span className="channel-type">{ch.type}</span>
                    <span className="channel-dot">·</span>
                    <span className={`channel-timing ${ch.timing === 'Start now' ? 'now' : ''}`}>{ch.timing}</span>
                    {isPrimary && <span className="primary-badge">Primary</span>}
                  </div>
                </div>
                {!isPrimary && (
                  <button type="button" className="btn-text" onClick={() => setPrimary(ch.id)}>
                    Set as primary
                  </button>
                )}
              </div>
              <EditableText value={ch.description} onChange={(v) => updateChannel(ch.id, { description: v })} rows={3} />
              <div className="this-week">
                <strong>This week</strong>
                <ul>
                  {ch.thisWeek.map((item, i) => (
                    <li key={i}>
                      <EditableText
                        value={item}
                        onChange={(v) => {
                          const thisWeek = [...ch.thisWeek]
                          thisWeek[i] = v
                          updateChannel(ch.id, { thisWeek })
                        }}
                        rows={1}
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="channel-scores">
                <ScoreBar label="Reach" value={ch.scores.reach} />
                <ScoreBar label="Effort" value={ch.scores.effort} />
                <ScoreBar label="Conversion" value={ch.scores.conversion} />
              </div>
              <p className="text-muted sm">{ch.scoreNote}</p>
            </div>
          )
        })}
      </div>

      <Button variant="secondary" size="sm" onClick={addChannel}>Add a channel</Button>

      <section className="wizard-section flagged-section">
        <h4>Assumptions flagged</h4>
        {data.assumptionsFlagged.map((a, i) => (
          <div key={i} className="flagged-item">
            <span className="flag-icon">⚑</span>
            <span>{a}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
