export function AiSectionHeader({ title, onRegenerate }) {
  return (
    <div className="ai-section-header">
      <h4>{title}</h4>
      <div className="ai-section-actions">
        <span className="ai-badge">AI generated</span>
        <button type="button" className="btn-text" onClick={onRegenerate}>Regenerate</button>
      </div>
    </div>
  )
}

export function EditableText({ value, onChange, rows = 4, placeholder }) {
  return (
    <textarea
      className="form-input form-textarea editable-block"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
