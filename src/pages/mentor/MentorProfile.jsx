import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PageHeader, Card, Button, Input, Textarea } from '../../components/ui'
import { useApp } from '../../context/AppProvider'
import { EXPERTISE_TAGS } from '../../data/seed'

const EMPTY_PROJECT = { title: '', domain: '', outcome: '' }
const EMPTY_DOMAIN_ENTRY = { domain: '', startups: '' }

export default function MentorProfile() {
  const { getCurrentMentor, updateMentor } = useApp()
  const mentor = getCurrentMentor()
  const [form, setForm] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [projects, setProjects] = useState([EMPTY_PROJECT])
  const [workedStartups, setWorkedStartups] = useState([EMPTY_DOMAIN_ENTRY])

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
      setProjects(
        Array.isArray(mentor.projectHighlights) && mentor.projectHighlights.length
          ? mentor.projectHighlights
          : [EMPTY_PROJECT]
      )
      setWorkedStartups(
        Array.isArray(mentor.previousStartupsByDomain) && mentor.previousStartupsByDomain.length
          ? mentor.previousStartupsByDomain
          : [EMPTY_DOMAIN_ENTRY]
      )
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

  const updateProject = (index, key, value) => {
    setProjects((prev) => prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)))
  }

  const addProject = () => setProjects((prev) => [...prev, { ...EMPTY_PROJECT }])
  const removeProject = (index) =>
    setProjects((prev) => (prev.length === 1 ? [EMPTY_PROJECT] : prev.filter((_, idx) => idx !== index)))

  const updateWorkedStartup = (index, key, value) => {
    setWorkedStartups((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    )
  }

  const addWorkedStartup = () => setWorkedStartups((prev) => [...prev, { ...EMPTY_DOMAIN_ENTRY }])
  const removeWorkedStartup = (index) =>
    setWorkedStartups((prev) =>
      prev.length === 1 ? [EMPTY_DOMAIN_ENTRY] : prev.filter((_, idx) => idx !== index)
    )

  const handleSave = () => {
    const cleanProjects = projects
      .map((project) => ({
        title: (project.title || '').trim(),
        domain: (project.domain || '').trim(),
        outcome: (project.outcome || '').trim(),
      }))
      .filter((project) => project.title || project.domain || project.outcome)

    const cleanWorkedStartups = workedStartups
      .map((entry) => ({
        domain: (entry.domain || '').trim(),
        startups: (entry.startups || '').trim(),
      }))
      .filter((entry) => entry.domain || entry.startups)

    updateMentor(mentor.id, {
      ...form,
      expertise: selectedTags,
      projectHighlights: cleanProjects,
      previousStartupsByDomain: cleanWorkedStartups,
    })
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

        <div className="form-field">
          <div className="section-header" style={{ marginBottom: 10 }}>
            <h3>Key Projects</h3>
            <Button size="sm" variant="secondary" onClick={addProject}>+ Add Project</Button>
          </div>
          <div className="ic-form-builder-questions">
            {projects.map((project, index) => (
              <div key={`project-${index}`} className="ic-form-q-card">
                <Input
                  label="Project Title"
                  value={project.title}
                  onChange={(e) => updateProject(index, 'title', e.target.value)}
                />
                <Input
                  label="Domain"
                  value={project.domain}
                  onChange={(e) => updateProject(index, 'domain', e.target.value)}
                />
                <Textarea
                  label="Outcome / Impact"
                  value={project.outcome}
                  onChange={(e) => updateProject(index, 'outcome', e.target.value)}
                />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeProject(index)}
                  disabled={projects.length === 1}
                >
                  Remove Project
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-field">
          <div className="section-header" style={{ marginBottom: 10 }}>
            <h3>Previously Worked Startups (Domain Wise)</h3>
            <Button size="sm" variant="secondary" onClick={addWorkedStartup}>+ Add Domain</Button>
          </div>
          <div className="ic-form-builder-questions">
            {workedStartups.map((entry, index) => (
              <div key={`worked-startups-${index}`} className="ic-form-q-card">
                <Input
                  label="Domain"
                  value={entry.domain}
                  onChange={(e) => updateWorkedStartup(index, 'domain', e.target.value)}
                />
                <Textarea
                  label="Startups Worked With (comma-separated)"
                  value={entry.startups}
                  onChange={(e) => updateWorkedStartup(index, 'startups', e.target.value)}
                />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeWorkedStartup(index)}
                  disabled={workedStartups.length === 1}
                >
                  Remove Domain
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave}>Save Profile</Button>
      </Card>
    </DashboardLayout>
  )
}
