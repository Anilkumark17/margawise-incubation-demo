import { useMemo, useState } from 'react'
import { Button } from '../ui'
import {
  ASSUMPTION_CATEGORIES,
  RISK_ORDER,
  getAssumptions,
} from '../../data/assumptionsSeed'

const STATUS_OPTIONS = ['Untested', 'Experiment Designed', 'Evidence Collected', 'Validated', 'Invalidated']

function RiskBadge({ risk }) {
  return <span className={`risk-badge risk-${risk.toLowerCase()}`}>{risk}</span>
}

export default function AssumptionsBoard({ startup, onUpdateAssumption, onAddAssumption }) {
  const assumptions = getAssumptions(startup)
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('risk')
  const [newText, setNewText] = useState('')
  const [newRisk, setNewRisk] = useState('Medium')

  const filtered = useMemo(() => {
    let list = filter === 'All' ? assumptions : assumptions.filter((a) => a.category === filter)
    if (sortBy === 'risk') {
      list = [...list].sort((a, b) => (RISK_ORDER[b.risk] || 0) - (RISK_ORDER[a.risk] || 0))
    }
    return list
  }, [assumptions, filter, sortBy])

  const counts = useMemo(() => ({
    All: assumptions.length,
    Idea: assumptions.filter((a) => a.category === 'Idea').length,
    Customers: assumptions.filter((a) => a.category === 'Customers').length,
    'Market Lens': assumptions.filter((a) => a.category === 'Market Lens').length,
  }), [assumptions])

  const handleAdd = () => {
    if (!newText.trim()) return
    onAddAssumption({ text: newText.trim(), risk: newRisk })
    setNewText('')
  }

  return (
    <div className="assumptions-board">
      <header className="content-header">
        <span className="step-eyebrow">PHASE 2 — ASSUMED</span>
        <h1>Assumptions</h1>
        <p>Every assumption auto-tagged from Explore must be true for your idea to work.</p>
      </header>

      <div className="assumptions-toolbar">
        <div className="filter-bar">
          {ASSUMPTION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={filter === cat ? 'active' : ''}
              onClick={() => setFilter(cat)}
            >
              {cat} ({counts[cat]})
            </button>
          ))}
        </div>
        <label className="sort-select">
          Sort by
          <select className="form-input form-select sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="risk">Risk (high to low)</option>
            <option value="number">Number</option>
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table className="data-table assumptions-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Text</th>
              <th>Source</th>
              <th>Interview</th>
              <th>Risk</th>
              <th>Status</th>
              <th>Evidence</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>{a.number}</td>
                <td className="assumption-text-cell">{a.text}</td>
                <td><span className="ai-badge sm">{a.source}</span></td>
                <td>{a.interview}</td>
                <td><RiskBadge risk={a.risk} /></td>
                <td>
                  <select
                    className="form-input form-select sm"
                    value={a.status}
                    onChange={(e) => onUpdateAssumption(a.id, { status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="evidence-cell">
                  <textarea
                    className="form-input form-textarea sm"
                    rows={2}
                    value={a.evidence || ''}
                    placeholder="—"
                    onChange={(e) => onUpdateAssumption(a.id, { evidence: e.target.value })}
                  />
                </td>
                <td>
                  {a.action !== '—' ? (
                    <button type="button" className="btn-text">{a.action}</button>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="add-assumption-row">
        <input
          className="form-input"
          placeholder="Add assumption manually..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <select className="form-input form-select sm" value={newRisk} onChange={(e) => setNewRisk(e.target.value)}>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <Button onClick={handleAdd}>Add</Button>
      </div>
    </div>
  )
}
