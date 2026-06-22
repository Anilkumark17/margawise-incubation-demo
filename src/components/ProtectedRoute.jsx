import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppProvider'

export function ProtectedRoute({ role, children }) {
  const { data } = useApp()
  const user = data.currentUser

  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}

export function FounderRoute({ children }) {
  const { data } = useApp()
  const location = useLocation()
  const user = data.currentUser

  if (!user || user.role !== 'founder') return <Navigate to="/" replace />
  if (!data.onboardingComplete && !location.pathname.includes('onboarding')) {
    return <Navigate to="/founder/onboarding" replace />
  }
  if (data.onboardingComplete && location.pathname.includes('onboarding')) {
    return <Navigate to="/founder/dashboard" replace />
  }

  return children
}
