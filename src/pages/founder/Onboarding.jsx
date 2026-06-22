import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppProvider'
import { Button, Input, Select } from '../../components/ui'

export default function Onboarding() {
  const { getCurrentStartup, updateStartup, setOnboardingComplete, data } = useApp()
  const navigate = useNavigate()
  const startup = getCurrentStartup()
  const [form, setForm] = useState({
    name: '',
    founderName: '',
    industry: '',
    description: '',
    stage: 'Validation',
  })

  useEffect(() => {
    if (data.onboardingComplete) {
      navigate('/founder/dashboard', { replace: true })
      return
    }
    if (startup) {
      setForm({
        name: startup.name,
        founderName: startup.founderName,
        industry: startup.industry,
        description: startup.description,
        stage: startup.stage,
      })
    }
  }, [startup, data.onboardingComplete, navigate])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (startup) updateStartup(startup.id, form)
    setOnboardingComplete(true)
    navigate('/founder/dashboard')
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <span className="brand-icon">M</span>
          <h1>Welcome to Margawise</h1>
          <p>Let's set up your startup profile to get started.</p>
        </div>
        <form onSubmit={handleSubmit} className="onboarding-form">
          <Input label="Startup Name" value={form.name} onChange={set('name')} required />
          <Input label="Founder Name" value={form.founderName} onChange={set('founderName')} required />
          <Input label="Industry" value={form.industry} onChange={set('industry')} required />
          <Select label="Current Stage" value={form.stage} onChange={set('stage')}>
            <option>Validation</option>
            <option>MVP</option>
            <option>GTM</option>
          </Select>
          <label className="form-field">
            <span className="form-label">Startup Description</span>
            <textarea
              className="form-input form-textarea"
              rows={4}
              value={form.description}
              onChange={set('description')}
              required
            />
          </label>
          <Button type="submit">Complete Setup →</Button>
        </form>
      </div>
    </div>
  )
}
