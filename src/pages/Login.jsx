import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppProvider'
import { Button, Input } from '../components/ui'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    if (result.role === 'founder') {
      navigate(result.onboardingComplete ? '/founder/dashboard' : '/founder/onboarding')
    } else if (result.role === 'mentor') navigate('/mentor/dashboard')
    else navigate('/incubation/dashboard')
  }

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('123456')
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <span className="brand-icon lg">M</span>
          <h1>Margawise</h1>
        </div>
        <p className="login-tagline">
          Move from Idea → Validation → MVP → GTM with confidence.
        </p>
        <ul className="login-features">
          <li>Validate assumptions with real customers</li>
          <li>Build and test your MVP systematically</li>
          <li>Connect with expert mentors</li>
          <li>Full visibility for incubation managers</li>
        </ul>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to your account</p>
          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
            {error && <p className="form-error">{error}</p>}
            <Button type="submit" className="login-btn">Sign in</Button>
          </form>
          <div className="demo-accounts">
            <p>Demo accounts</p>
            <div className="demo-buttons">
              <button type="button" onClick={() => fillDemo('startup@gmail.com')}>Founder</button>
              <button type="button" onClick={() => fillDemo('mentor@gmail.com')}>Mentor</button>
              <button type="button" onClick={() => fillDemo('incubation@gmail.com')}>Incubation</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
