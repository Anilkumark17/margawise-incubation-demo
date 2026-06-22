import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Button } from '../../components/ui'
import { useApp } from '../../context/AppProvider'

export default function Payment() {
  const { id } = useParams()
  const { data, confirmBooking } = useApp()
  const navigate = useNavigate()
  const booking = data.pendingBooking

  useEffect(() => {
    if (!booking) navigate(`/founder/mentors/${id}/book`, { replace: true })
  }, [booking, id, navigate])

  if (!booking) return null

  const handlePay = () => {
    confirmBooking()
    navigate('/founder/booking/success')
  }

  return (
    <DashboardLayout role="founder">
      <PageHeader title="Payment" subtitle="Complete your mentorship booking" />

      <Card className="form-card payment-card">
        <div className="payment-icon">💳</div>
        <h3>Session Summary</h3>
        <div className="payment-details">
          <div className="detail-row"><span>Mentor</span><span>{booking.mentorName}</span></div>
          <div className="detail-row"><span>Date</span><span>{booking.date}</span></div>
          <div className="detail-row"><span>Time</span><span>{booking.time}</span></div>
          <div className="detail-row"><span>Duration</span><span>{booking.duration} min</span></div>
          <div className="detail-row total"><span>Total</span><span>${booking.price}</span></div>
        </div>

        <div className="mock-card-form">
          <input className="form-input" placeholder="Card number" defaultValue="4242 4242 4242 4242" readOnly />
          <div className="card-row">
            <input className="form-input" placeholder="MM/YY" defaultValue="12/28" readOnly />
            <input className="form-input" placeholder="CVC" defaultValue="123" readOnly />
          </div>
        </div>

        <Button className="pay-btn" onClick={handlePay}>Pay & Confirm</Button>
      </Card>
    </DashboardLayout>
  )
}
