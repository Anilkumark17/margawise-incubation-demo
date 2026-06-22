import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Button, Input, Textarea } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

export default function AddInterview() {
  const { getCurrentStartup, addInterview } = useApp()
  const navigate = useNavigate()
  const startup = getCurrentStartup()
  const [form, setForm] = useState({
    customerName: '',
    role: '',
    painPoints: '',
    notes: '',
    keyInsights: '',
  })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    addInterview(startup.id, form)
    navigate('/founder/dashboard')
  }

  return (
    <DashboardLayout role="founder">
      <PageHeader title="Add Customer Interview" subtitle="Capture insights from customer discovery" />
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <Input label="Customer Name" value={form.customerName} onChange={set('customerName')} required />
          <Input label="Role" value={form.role} onChange={set('role')} required />
          <Textarea label="Pain Points" value={form.painPoints} onChange={set('painPoints')} required />
          <Textarea label="Interview Notes" value={form.notes} onChange={set('notes')} required />
          <Textarea label="Key Insights" value={form.keyInsights} onChange={set('keyInsights')} />
          <div className="form-actions">
            <Button variant="secondary" onClick={() => navigate('/founder/dashboard')}>Cancel</Button>
            <Button type="submit">Save Interview</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
