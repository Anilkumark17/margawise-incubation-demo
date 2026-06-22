import { Badge } from '../../ui'

function MarketSizeCard({ item }) {
  return (
    <div className="market-size-card">
      <div className="market-size-top">
        <span className="market-label">{item.label}</span>
        <span className="market-value">{item.value}</span>
      </div>
      <h4>{item.title}</h4>
      <p className="text-muted sm">{item.subtitle}</p>
      <p className="market-desc">{item.description}</p>
      {item.filters?.map((f) => (
        <div key={f.label} className="market-filter">
          <span>{f.label}</span>
          <span className="filter-val">{f.value}</span>
          {f.note && <p className="text-muted sm">{f.note}</p>}
        </div>
      ))}
      <p className="market-source"><strong>Source:</strong> {item.source}</p>
      <button type="button" className="btn-text">Refine ↑</button>
    </div>
  )
}

function CompetitorCard({ c }) {
  return (
    <div className="competitor-card">
      <div className="competitor-top">
        <span className="comp-initials">{c.initials}</span>
        <div>
          <h4>{c.name}</h4>
          <p className="text-muted sm">{c.summary}</p>
        </div>
      </div>
      <div className="comp-section">
        <strong>What it does well</strong>
        <p>{c.doesWell}</p>
      </div>
      <div className="comp-section">
        <strong>Where it falls short</strong>
        <p>{c.fallsShort}</p>
      </div>
      <div className="comp-footer">
        <span className="text-muted sm">Agent-sourced · 2024-07-30</span>
        <Badge status={c.switching.includes('high') ? 'High' : 'Medium'} />
        <button type="button" className="btn-text">Enrich</button>
      </div>
    </div>
  )
}

function TrendCard({ t, variant }) {
  return (
    <div className={`trend-card trend-${variant}`}>
      <div className="trend-top">
        <Badge status={variant === 'tailwind' ? 'Validated' : variant === 'headwind' ? 'Invalidated' : 'In Progress'} />
        <span className="trend-type">{t.type}</span>
      </div>
      <h4>{t.title}</h4>
      <p className="trend-stat">📊 {t.stat}</p>
      <p className="trend-impact">→ {t.impact}</p>
    </div>
  )
}

export default function MarketStep({ data, onUpdate }) {
  const tabs = [
    { id: 'sizing', label: 'Market Sizing', num: 1 },
    { id: 'competitors', label: 'Competitive Landscape', num: 2 },
    { id: 'trends', label: 'Trends & Signals', num: 3 },
  ]
  const activeTab = data.activeTab || 'sizing'

  return (
    <div className="explore-step">
      <div className="explore-step-header">
        <span className="step-badge">Step 3 — Market</span>
        <h2>How big is the opportunity?</h2>
        <p className="section-desc">
          We&apos;ve sized the market, mapped who else is playing in this space, and identified forces shaping this category. Review, edit, and add anything we missed.
        </p>
        <div className="currency-select">
          <label>
            Currency
            <select
              className="form-input form-select sm"
              value={data.currency}
              onChange={(e) => onUpdate({ currency: e.target.value })}
            >
              <option>USD ($)</option>
              <option>INR (₹)</option>
              <option>EUR (€)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="market-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`market-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onUpdate({ activeTab: tab.id })}
          >
            {tab.num} of 3 · {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sizing' && (
        <>
          <div className="market-sizing-grid">
            <MarketSizeCard item={data.sizing.som} />
            <MarketSizeCard item={data.sizing.sam} />
            <MarketSizeCard item={data.sizing.tam} />
          </div>
          <div className="data-gaps">
            <strong>Data gaps:</strong>
            {data.sizing.dataGaps.join(' · ')}
          </div>
        </>
      )}

      {activeTab === 'competitors' && (
        <>
          {['direct', 'indirect', 'alternative'].map((type) => (
            <section key={type} className="wizard-section">
              <h4 className="comp-group-title">
                {type.charAt(0).toUpperCase() + type.slice(1)} · {data.competitors[type].length}
              </h4>
              <div className="competitor-grid">
                {data.competitors[type].map((c) => (
                  <CompetitorCard key={c.id} c={c} />
                ))}
              </div>
              <button type="button" className="btn-text">+ Add {type} competitor</button>
            </section>
          ))}
        </>
      )}

      {activeTab === 'trends' && (
        <>
          <section className="wizard-section">
            <h4>Tailwind · {data.trends.tailwinds.length}</h4>
            <div className="trend-grid">
              {data.trends.tailwinds.map((t) => (
                <TrendCard key={t.title} t={t} variant="tailwind" />
              ))}
            </div>
          </section>
          <section className="wizard-section">
            <h4>Headwind · {data.trends.headwinds.length}</h4>
            <div className="trend-grid">
              {data.trends.headwinds.map((t) => (
                <TrendCard key={t.title} t={t} variant="headwind" />
              ))}
            </div>
          </section>
          <section className="wizard-section">
            <h4>Wildcard · {data.trends.wildcards.length}</h4>
            <div className="trend-grid">
              {data.trends.wildcards.map((t) => (
                <TrendCard key={t.title} t={t} variant="wildcard" />
              ))}
            </div>
          </section>
          <div className="overall-read">
            <h4>Overall read</h4>
            <p>{data.trends.overallRead}</p>
          </div>
        </>
      )}
    </div>
  )
}
