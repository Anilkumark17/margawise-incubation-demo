export function Card({ children, className = '', onClick }) {
  return (
    <div className={`card ${className}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  )
}

export function MetricCard({ label, value, sub, accent }) {
  return (
    <Card className={`metric-card ${accent ? 'metric-accent' : ''}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      {sub && <span className="metric-sub">{sub}</span>}
    </Card>
  )
}

export function Badge({ status }) {
  const cls = status.toLowerCase().replace(/\s+/g, '-')
  return <span className={`badge badge-${cls}`}>{status}</span>
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = ['primary', 'secondary', 'ghost', 'danger']
  const v = variants.includes(variant) ? variant : 'primary'
  return (
    <button type="button" className={`btn btn-${v} btn-${size} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function ProgressTracker({ steps, currentIndex }) {
  return (
    <div className="progress-tracker">
      {steps.map((step, i) => (
        <div key={step} className={`progress-step ${i <= currentIndex ? 'active' : ''} ${i < currentIndex ? 'done' : ''}`}>
          <div className="progress-dot">{i < currentIndex ? '✓' : i + 1}</div>
          <span className="progress-label">{step}</span>
        </div>
      ))}
    </div>
  )
}

export function Avatar({ name, size = 48 }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function SimpleBarChart({ data, labelKey = 'label', valueKey = 'value' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={d[labelKey]} className="bar-row">
          <span className="bar-label">{d[labelKey]}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(d[valueKey] / max) * 100}%` }} />
          </div>
          <span className="bar-value">{d[valueKey]}</span>
        </div>
      ))}
    </div>
  )
}

export function Input({ label, ...props }) {
  return (
    <label className="form-field">
      <span className="form-label">{label}</span>
      <input className="form-input" {...props} />
    </label>
  )
}

export function Textarea({ label, ...props }) {
  return (
    <label className="form-field">
      <span className="form-label">{label}</span>
      <textarea className="form-input form-textarea" rows={4} {...props} />
    </label>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <label className="form-field">
      <span className="form-label">{label}</span>
      <select className="form-input form-select" {...props}>
        {children}
      </select>
    </label>
  )
}
