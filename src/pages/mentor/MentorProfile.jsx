import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Button, Input, Textarea } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { EXPERTISE_TAGS } from '../../data/seed'

export default function MentorProfile() {
  const { getCurrentMentor, updateMentor } = useApp()
  const mentor = getCurrentMentor()
  const [form, setForm] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  useEffect(() => {
    if (mentor) {
      setForm({
        name: mentor.name,
        designation: mentor.designation,
        yearsExperience: mentor.yearsExperience,
        industryExpertise: mentor.industryExpertise,
        linkedin: mentor.linkedin,
        bio: mentor.bio,
        hourlyCharge: mentor.hourlyCharge,
      })
      setSelectedTags(mentor.expertise)
    }
  }, [mentor])

  if (!mentor || !form) return null

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: key === 'yearsExperience' || key === 'hourlyCharge' ? Number(e.target.value) : e.target.value }))

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSave = () => {
    updateMentor(mentor.id, { ...form, expertise: selectedTags })
  }

  return (
    <DashboardLayout role="mentor">
      <PageHeader title="Mentor Profile" subtitle="Showcase your expertise to startups" />

      <Card className="form-card">
        <Input label="Name" value={form.name} onChange={set('name')} />
        <Input label="Designation" value={form.designation} onChange={set('designation')} />
        <Input label="Years of Experience" type="number" value={form.yearsExperience} onChange={set('yearsExperience')} />
        <Input label="Industry Expertise" value={form.industryExpertise} onChange={set('industryExpertise')} />
        <Input label="LinkedIn Profile" value={form.linkedin} onChange={set('linkedin')} />
        <Textarea label="Bio" value={form.bio} onChange={set('bio')} />
        <Input label="Hourly Charge ($)" type="number" value={form.hourlyCharge} onChange={set('hourlyCharge')} />

        <div className="form-field">
          <span className="form-label">Expertise Tags</span>
          <div className="tag-select">
            {EXPERTISE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave}>Save Profile</Button>
      </Card>
    </DashboardLayout>
  )
}
