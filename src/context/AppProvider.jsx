import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { loadData, saveData, resetData } from '../lib/storage'
import { createSeedData, USERS, DEFAULT_BOOKINGS } from '../data/seed'
import { DEFAULT_ASSUMPTIONS, DEFAULT_INTERVIEW_SESSIONS, INTERVIEW_FRAMEWORKS } from '../data/assumptionsSeed'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    const stored = loadData()
    const d = stored || resetData(createSeedData())
    return migrateLegacyData(d)
  })

  function migrateLegacyData(d) {
    const bookings =
      d.bookings?.length > 0
        ? d.bookings
        : DEFAULT_BOOKINGS.map((b) => ({ ...b }))

    // Keep existing user edits, but backfill any newly introduced seed startups.
    const seedStartups = createSeedData().startups
    const existingStartups = d.startups || []
    const existingById = new Map(existingStartups.map((s) => [s.id, s]))
    const seedIds = new Set(seedStartups.map((s) => s.id))
    const mergedSeedStartups = seedStartups.map((seed) =>
      existingById.has(seed.id) ? { ...seed, ...existingById.get(seed.id) } : { ...seed }
    )
    const customStartups = existingStartups.filter((s) => !seedIds.has(s.id))
    const mergedStartups = [...mergedSeedStartups, ...customStartups]

    return {
      ...d,
      bookings,
      startups: mergedStartups.map((s) => {
        let next = { ...s }
        if (s.assumptions?.length && !s.assumptions[0]?.category) {
          next = { ...next, assumptions: DEFAULT_ASSUMPTIONS.map((a) => ({ ...a })) }
        }
        const v = s.validation || {}
        if (!v.interviewSessions?.length || !v.interviewFrameworks?.length) {
          next = {
            ...next,
            validation: {
              ...v,
              interviewSessions: v.interviewSessions?.length
                ? v.interviewSessions
                : DEFAULT_INTERVIEW_SESSIONS.map((x) => ({ ...x })),
              interviewFrameworks: v.interviewFrameworks?.length
                ? v.interviewFrameworks
                : INTERVIEW_FRAMEWORKS.map((x) => ({ ...x })),
            },
          }
        }
        if (!next.stageNotes) {
          next = {
            ...next,
            stageNotes: { mvp: '', gtm: '', mvpEntrySeen: false, gtmEntrySeen: false },
          }
        }
        if (!next.userTesting) {
          next = {
            ...next,
            userTesting: { testUsers: 0, feedbackCollected: 0, issuesFound: 0, featuresRequested: 0 },
          }
        }
        if (!next.gtm) {
          next = {
            ...next,
            gtm: { leads: 0, meetings: 0, customers: 0, revenue: 0, activities: [] },
          }
        }
        return next
      }),
    }
  }

  useEffect(() => {
    saveData(data)
  }, [data])

  const update = useCallback((fn) => setData((prev) => fn(prev)), [])

  const login = (email, password) => {
    const user = USERS[email.toLowerCase()]
    if (!user || user.password !== password) return { ok: false, error: 'Invalid email or password' }
    update((d) => ({ ...d, currentUser: { email: email.toLowerCase(), ...user } }))
    return { ok: true, role: user.role, onboardingComplete: data.onboardingComplete }
  }

  const logout = () => update((d) => ({ ...d, currentUser: null }))

  const getStartup = (id) => data.startups.find((s) => s.id === id)

  const getCurrentStartup = () => {
    const uid = data.currentUser?.startupId
    return uid ? getStartup(uid) : null
  }

  const updateStartup = (id, patch) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }

  const addInterview = (startupId, interview) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) =>
        s.id === startupId
          ? {
              ...s,
              interviews: [...(s.interviews || []), { ...interview, id: `int-${Date.now()}`, status: 'completed' }],
              lastInterviewDate: new Date().toISOString().split('T')[0],
            }
          : s
      ),
    }))
  }

  const updateAssumption = (startupId, assumptionId, patch) => {
    const isObject = typeof patch === 'object' && patch !== null && !Array.isArray(patch)
    update((d) => ({
      ...d,
      startups: d.startups.map((s) =>
        s.id === startupId
          ? {
              ...s,
              assumptions: s.assumptions.map((a) =>
                a.id === assumptionId
                  ? isObject
                    ? { ...a, ...patch }
                    : { ...a, status: patch }
                  : a
              ),
            }
          : s
      ),
    }))
  }

  const addAssumption = (startupId, { text, risk }) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const n = s.assumptions.length + 1
        return {
          ...s,
          assumptions: [
            ...s.assumptions,
            {
              id: `a-${Date.now()}`,
              number: n,
              text,
              source: 'Manual',
              category: 'Idea',
              interview: 'Discovery',
              risk: risk || 'Medium',
              status: 'Untested',
              evidence: '',
              action: '—',
            },
          ],
        }
      }),
    }))
  }

  const markSessionEvidence = (startupId, sessionId) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const validation = s.validation || {}
        const sessions = (validation.interviewSessions || []).map((sess) => {
          if (sess.id !== sessionId) return sess
          return {
            ...sess,
            assumptionLinks: sess.assumptionLinks.map((link) => ({
              ...link,
              status: 'evidence collected',
            })),
          }
        })
        const assumptionIds = sessions
          .find((sess) => sess.id === sessionId)
          ?.assumptionLinks.map((l) => l.assumptionId) || []
        return {
          ...s,
          validation: { ...validation, interviewSessions: sessions },
          assumptions: s.assumptions.map((a) =>
            assumptionIds.includes(a.id) ? { ...a, status: 'Evidence Collected' } : a
          ),
        }
      }),
    }))
  }

  const updateExploreItem = (startupId, key, patch) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const validation = s.validation || { explore: {}, surveys: [], experiments: [], decision: null }
        const explore = validation.explore || {}
        return {
          ...s,
          validation: {
            ...validation,
            explore: {
              ...explore,
              [key]: { ...explore[key], ...patch },
            },
          },
        }
      }),
    }))
  }

  const setValidationDecision = (startupId, decision) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const validation = s.validation || { explore: {}, surveys: [], experiments: [], decision: null }
        const stage = decision === 'Proceed to MVP' ? 'MVP' : s.stage
        return {
          ...s,
          stage,
          validation: { ...validation, decision },
        }
      }),
    }))
  }

  const mergeWizardStep = (current, patch) => {
    const merged = { ...current, ...patch }
    if (patch.diagnostic) merged.diagnostic = { ...current?.diagnostic, ...patch.diagnostic }
    if (patch.problemStatement) merged.problemStatement = { ...current?.problemStatement, ...patch.problemStatement }
    if (patch.whoFeelsPain) merged.whoFeelsPain = { ...current?.whoFeelsPain, ...patch.whoFeelsPain }
    if (patch.whyNow) merged.whyNow = { ...current?.whyNow, ...patch.whyNow }
    if (patch.persona) merged.persona = { ...current?.persona, ...patch.persona }
    if (patch.sizing) merged.sizing = { ...current?.sizing, ...patch.sizing }
    if (patch.competitors) merged.competitors = { ...current?.competitors, ...patch.competitors }
    if (patch.trends) merged.trends = { ...current?.trends, ...patch.trends }
    if (patch.channels) merged.channels = patch.channels
    if (patch.businessModel) merged.businessModel = { ...current?.businessModel, ...patch.businessModel }
    if (patch.verdict) merged.verdict = { ...current?.verdict, ...patch.verdict }
    if (patch.inputs) {
      merged.inputs = { ...current?.inputs }
      for (const key of Object.keys(patch.inputs)) {
        merged.inputs[key] = { ...current?.inputs?.[key], ...patch.inputs[key] }
      }
    }
    if (patch.valueProposition) merged.valueProposition = { ...current?.valueProposition, ...patch.valueProposition }
    return merged
  }

  const updateExploreWizardStep = (startupId, stepKey, patch) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const validation = s.validation || {}
        const wizard = validation.exploreWizard || {}
        return {
          ...s,
          validation: {
            ...validation,
            exploreWizard: {
              ...wizard,
              [stepKey]: mergeWizardStep(wizard[stepKey] || {}, patch),
            },
          },
        }
      }),
    }))
  }

  const setExploreWizardStep = (startupId, stepId) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const validation = s.validation || {}
        return {
          ...s,
          validation: {
            ...validation,
            exploreWizard: { ...validation.exploreWizard, activeStep: stepId },
          },
        }
      }),
    }))
  }

  const markExploreStepComplete = (startupId, stepId) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const validation = s.validation || {}
        const wizard = validation.exploreWizard || {}
        const explore = validation.explore || {}
        return {
          ...s,
          validation: {
            ...validation,
            exploreWizard: {
              ...wizard,
              [stepId]: { ...wizard[stepId], complete: true },
            },
            explore: {
              ...explore,
              [stepId]: { ...explore[stepId], complete: true },
            },
          },
        }
      }),
    }))
  }

  const addPainSignal = (startupId) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const validation = s.validation || {}
        const wizard = validation.exploreWizard || {}
        const problem = wizard.problem || {}
        const painSignals = [...(problem.painSignals || []), { id: `sig-${Date.now()}`, text: '' }]
        return {
          ...s,
          validation: {
            ...validation,
            exploreWizard: { ...wizard, problem: { ...problem, painSignals } },
          },
        }
      }),
    }))
  }

  const removePainSignal = (startupId, signalId) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const validation = s.validation || {}
        const wizard = validation.exploreWizard || {}
        const problem = wizard.problem || {}
        return {
          ...s,
          validation: {
            ...validation,
            exploreWizard: {
              ...wizard,
              problem: {
                ...problem,
                painSignals: (problem.painSignals || []).filter((sig) => sig.id !== signalId),
              },
            },
          },
        }
      }),
    }))
  }

  const updatePainSignal = (startupId, signalId, text) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) => {
        if (s.id !== startupId) return s
        const validation = s.validation || {}
        const wizard = validation.exploreWizard || {}
        const problem = wizard.problem || {}
        return {
          ...s,
          validation: {
            ...validation,
            exploreWizard: {
              ...wizard,
              problem: {
                ...problem,
                painSignals: (problem.painSignals || []).map((sig) =>
                  sig.id === signalId ? { ...sig, text } : sig
                ),
              },
            },
          },
        }
      }),
    }))
  }

  const getMentor = (id) => data.mentors.find((m) => m.id === id)

  const getCurrentMentor = () => {
    const mid = data.currentUser?.mentorId
    return mid ? getMentor(mid) : null
  }

  const updateMentor = (id, patch) => {
    update((d) => ({
      ...d,
      mentors: d.mentors.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }

  const addAvailabilitySlot = (mentorId, slot) => {
    update((d) => ({
      ...d,
      mentors: d.mentors.map((m) =>
        m.id === mentorId ? { ...m, availability: [...m.availability, slot] } : m
      ),
    }))
  }

  const removeAvailabilitySlot = (mentorId, slot) => {
    update((d) => ({
      ...d,
      mentors: d.mentors.map((m) =>
        m.id === mentorId ? { ...m, availability: m.availability.filter((s) => s !== slot) } : m
      ),
    }))
  }

  const respondToRequest = (requestId, accept, reply = '') => {
    const now = new Date().toISOString().split('T')[0]
    const cleanReply = reply.trim()
    update((d) => ({
      ...d,
      sessionRequests: d.sessionRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: accept ? 'accepted' : 'rejected',
              respondedAt: now,
              mentorReply: cleanReply || r.mentorReply || '',
            }
          : r
      ),
    }))
  }

  const saveMentorRequestReply = (requestId, reply) => {
    const now = new Date().toISOString().split('T')[0]
    const cleanReply = (reply || '').trim()
    if (!cleanReply) return
    update((d) => ({
      ...d,
      sessionRequests: d.sessionRequests.map((r) =>
        r.id === requestId
          ? { ...r, mentorReply: cleanReply, repliedAt: now }
          : r
      ),
    }))
  }

  const setPendingBooking = (booking) => update((d) => ({ ...d, pendingBooking: booking }))

  const confirmBooking = () => {
    const booking = data.pendingBooking
    if (!booking) return
    update((d) => ({
      ...d,
      bookings: [...d.bookings, { ...booking, id: `book-${Date.now()}`, status: 'confirmed' }],
      pendingBooking: null,
      startups: d.startups.map((s) =>
        s.id === booking.startupId ? { ...s, mentorSessions: (s.mentorSessions || 0) + 1 } : s
      ),
      mentors: d.mentors.map((m) =>
        m.id === booking.mentorId
          ? { ...m, upcomingSessions: m.upcomingSessions + 1, totalSessions: m.totalSessions + 1 }
          : m
      ),
    }))
  }

  const setOnboardingComplete = (val) => update((d) => ({ ...d, onboardingComplete: val }))

  const updateStageNote = (startupId, stage, note) => {
    update((d) => ({
      ...d,
      startups: d.startups.map((s) =>
        s.id === startupId
          ? { ...s, stageNotes: { ...(s.stageNotes || {}), [stage]: note } }
          : s
      ),
    }))
  }

  const markStageEntrySeen = (startupId, stage) => {
    const key = stage === 'mvp' ? 'mvpEntrySeen' : 'gtmEntrySeen'
    update((d) => ({
      ...d,
      startups: d.startups.map((s) =>
        s.id === startupId
          ? { ...s, stageNotes: { ...(s.stageNotes || {}), [key]: true } }
          : s
      ),
    }))
  }

  const updateMentorStatus = (mentorId, status) => updateMentor(mentorId, { status })

  const resetApp = () => setData(resetData(createSeedData()))

  return (
    <AppContext.Provider
      value={{
        data,
        login,
        logout,
        getStartup,
        getCurrentStartup,
        updateStartup,
        addInterview,
        updateAssumption,
        addAssumption,
        markSessionEvidence,
        updateExploreItem,
        setValidationDecision,
        updateExploreWizardStep,
        setExploreWizardStep,
        markExploreStepComplete,
        addPainSignal,
        removePainSignal,
        updatePainSignal,
        getMentor,
        getCurrentMentor,
        updateMentor,
        addAvailabilitySlot,
        removeAvailabilitySlot,
        respondToRequest,
        saveMentorRequestReply,
        setPendingBooking,
        confirmBooking,
        setOnboardingComplete,
        updateStageNote,
        markStageEntrySeen,
        updateMentorStatus,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
