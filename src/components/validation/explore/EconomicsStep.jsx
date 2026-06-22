import { AiSectionHeader, EditableText } from './shared'

function calcMetrics(inputFields) {
  if (!inputFields?.priceMonthly) {
    return { ltv: 0, payback: '—', ltvCac: '—', breakEven: 0 }
  }
  const price = Number(inputFields.priceMonthly.value) || 0
  const cac = Number(inputFields.cac?.value) || 0
  const churnPct = Number(inputFields.churnMonthly?.value) || 1
  const fixed = Number(inputFields.monthlyFixedCosts?.value) || 0
  const churnDec = churnPct / 100
  const ltv = churnDec > 0 ? Math.round(price / churnDec) : 0
  const payback = price > 0 ? (cac / price).toFixed(1) : '—'
  const ltvCac = cac > 0 ? (ltv / cac).toFixed(1) : '—'
  const breakEven = price > 0 ? Math.ceil(fixed / price) : 0
  return { ltv, payback, ltvCac, breakEven }
}

function InputField({ field, data, onChange }) {
  const f = data.inputs?.[field]
  if (!f) return null
  return (
    <div className="econ-input-card">
      <label className="econ-input-label">{f.label}</label>
      <div className="econ-input-row">
        {field !== 'churnMonthly' && field !== 'freeToPaidConversion' && <span className="econ-currency">₹</span>}
        <input
          type="number"
          className="form-input econ-input"
          value={f.value}
          onChange={(e) =>
            onChange({
              inputs: {
                ...data.inputs,
                [field]: { ...f, value: Number(e.target.value) },
              },
            })
          }
        />
        {f.unit && <span className="econ-unit">{f.unit}</span>}
      </div>
      <p className="econ-source"><strong>Source:</strong> {f.source}</p>
    </div>
  )
}

export default function EconomicsStep({ data, onUpdate }) {
  const metrics = calcMetrics(data.inputs)

  return (
    <div className="explore-step">
      <div className="explore-step-header">
        <span className="step-badge">Step 5 — Economics</span>
        <h2>Do the numbers work?</h2>
        <p className="section-desc">{data.intro}</p>
      </div>

      <div className="business-model-card">
        <span className="bm-icon">{data.businessModel?.icon}</span>
        <div>
          <div className="bm-top">
            <strong>Inferred business model · {data.businessModel?.confidence}</strong>
          </div>
          <h3>{data.businessModel?.label}</h3>
          <p>{data.businessModel?.description}</p>
          <div className="bm-actions">
            <button type="button" className="btn-text">Looks right</button>
            <button type="button" className="btn-text">Change</button>
          </div>
        </div>
      </div>

      <div className="verdict-card">
        <h3>{data.verdict?.title}</h3>
        <EditableText value={data.verdict?.summary || ''} onChange={(v) => onUpdate({ verdict: { ...data.verdict, summary: v } })} rows={4} />
        <ul className="recommendation-list">
          {(data.recommendations || []).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <section className="wizard-section">
        <h4>Unit economics — edit any value</h4>
        <div className="econ-inputs-grid">
          <InputField field="cac" data={data} onChange={onUpdate} />
          <InputField field="priceMonthly" data={data} onChange={onUpdate} />
          <InputField field="churnMonthly" data={data} onChange={onUpdate} />
          <InputField field="monthlyFixedCosts" data={data} onChange={onUpdate} />
          <InputField field="freeToPaidConversion" data={data} onChange={onUpdate} />
        </div>
      </section>

      <div className="econ-metrics-grid">
        <div className="econ-metric-card">
          <span className="econ-metric-label">Lifetime value · Calculated</span>
          <span className="econ-metric-value">₹{metrics.ltv.toLocaleString()}</span>
          <span className="econ-metric-formula">LTV = Price ÷ Monthly churn</span>
        </div>
        <div className="econ-metric-card">
          <span className="econ-metric-label">Payback period · Calculated</span>
          <span className="econ-metric-value">{metrics.payback} months</span>
          <span className="econ-metric-formula">Payback = CAC ÷ Price</span>
        </div>
        <div className="econ-metric-card">
          <span className="econ-metric-label">LTV : CAC ratio · Calculated</span>
          <span className="econ-metric-value">{metrics.ltvCac}×</span>
          <span className="econ-metric-formula">&gt;3× is healthy · &gt;5× is strong</span>
        </div>
        <div className="econ-metric-card">
          <span className="econ-metric-label">Break-even users · Calculated</span>
          <span className="econ-metric-value">{metrics.breakEven} users</span>
          <span className="econ-metric-formula">Break-even = Fixed costs ÷ Price</span>
        </div>
      </div>

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
