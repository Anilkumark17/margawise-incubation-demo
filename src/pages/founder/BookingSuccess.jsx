import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui'

export default function BookingSuccess() {
  const navigate = useNavigate()

  return (
    <DashboardLayout role="founder">
      <div className="success-page">
        <div className="success-icon">✓</div>
        <h1>Mentorship Session Booked</h1>
        <p>Your session has been confirmed. You'll receive a calendar invite shortly.</p>
        <div className="success-actions">
          <Button variant="secondary" onClick={() => navigate('/founder/mentors')}>
            Browse Mentors
          </Button>
          <Button onClick={() => navigate('/founder/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
