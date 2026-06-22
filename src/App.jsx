import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppProvider'
import { ProtectedRoute, FounderRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Onboarding from './pages/founder/Onboarding'
import FounderDashboard from './pages/founder/FounderDashboard'
import AddInterview from './pages/founder/AddInterview'
import MentorMarketplace from './pages/founder/MentorMarketplace'
import MentorProfileView from './pages/founder/MentorProfileView'
import BookingFlow from './pages/founder/BookingFlow'
import Payment from './pages/founder/Payment'
import BookingSuccess from './pages/founder/BookingSuccess'
import MentorDashboardHome from './pages/mentor/MentorDashboardHome'
import MentorStartupReport from './pages/mentor/MentorStartupReport'
import MentorProfile from './pages/mentor/MentorProfile'
import Availability from './pages/mentor/Availability'
import MentorRequests from './pages/mentor/MentorRequests'
import IncubationDashboard from './pages/incubation/IncubationDashboard'
import ApplicationsHub from './pages/incubation/ApplicationsHub'
import CohortHub from './pages/incubation/CohortHub'
import ViewStartup from './pages/incubation/ViewStartup'
import MentorManagement from './pages/incubation/MentorManagement'
import WorkshopsPage from './pages/incubation/WorkshopsPage'
import ViewMentor from './pages/incubation/ViewMentor'
import ReportsHub from './pages/incubation/ReportsHub'
import IncubationSettings from './pages/incubation/IncubationSettings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/founder/onboarding" element={<FounderRoute><Onboarding /></FounderRoute>} />
          <Route path="/founder/dashboard" element={<FounderRoute><FounderDashboard /></FounderRoute>} />
          <Route path="/founder/interviews/add" element={<FounderRoute><AddInterview /></FounderRoute>} />
          <Route path="/founder/mentors" element={<FounderRoute><MentorMarketplace /></FounderRoute>} />
          <Route path="/founder/mentors/:id" element={<FounderRoute><MentorProfileView /></FounderRoute>} />
          <Route path="/founder/mentors/:id/book" element={<FounderRoute><BookingFlow /></FounderRoute>} />
          <Route path="/founder/mentors/:id/payment" element={<FounderRoute><Payment /></FounderRoute>} />
          <Route path="/founder/booking/success" element={<FounderRoute><BookingSuccess /></FounderRoute>} />

          <Route path="/mentor/dashboard" element={<ProtectedRoute role="mentor"><MentorDashboardHome /></ProtectedRoute>} />
          <Route path="/mentor/startup/:id/report" element={<ProtectedRoute role="mentor"><MentorStartupReport /></ProtectedRoute>} />
          <Route path="/mentor/requests" element={<ProtectedRoute role="mentor"><MentorRequests /></ProtectedRoute>} />
          <Route path="/mentor/profile" element={<ProtectedRoute role="mentor"><MentorProfile /></ProtectedRoute>} />
          <Route path="/mentor/availability" element={<ProtectedRoute role="mentor"><Availability /></ProtectedRoute>} />

          <Route path="/incubation/dashboard" element={<ProtectedRoute role="incubation"><IncubationDashboard /></ProtectedRoute>} />
          <Route path="/incubation/applications" element={<ProtectedRoute role="incubation"><ApplicationsHub /></ProtectedRoute>} />
          <Route path="/incubation/cohort" element={<ProtectedRoute role="incubation"><CohortHub /></ProtectedRoute>} />
          <Route path="/incubation/startup/:id/report" element={<ProtectedRoute role="incubation"><ReportsHub /></ProtectedRoute>} />
          <Route path="/incubation/startup/:id" element={<ProtectedRoute role="incubation"><ViewStartup /></ProtectedRoute>} />
          <Route path="/incubation/mentors" element={<ProtectedRoute role="incubation"><MentorManagement /></ProtectedRoute>} />
          <Route path="/incubation/workshops" element={<ProtectedRoute role="incubation"><WorkshopsPage /></ProtectedRoute>} />
          <Route path="/incubation/mentor/:id" element={<ProtectedRoute role="incubation"><ViewMentor /></ProtectedRoute>} />
          <Route path="/incubation/reports" element={<ProtectedRoute role="incubation"><ReportsHub /></ProtectedRoute>} />
          <Route path="/incubation/settings" element={<ProtectedRoute role="incubation"><IncubationSettings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
