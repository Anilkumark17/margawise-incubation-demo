export const FOUNDER_EVENTS = [
  {
    id: 'ev-1',
    name: 'From Idea to MVP: Build Fast, Fail Faster',
    date: '2026-07-05',
    time: '10:00',
    theme: 'Product Development',
    schedule: '10:00 AM – 1:00 PM IST',
    venue: 'IIIT Hyderabad · Innovation Hub',
    description:
      'Hands-on workshop on rapid prototyping, MVP scoping, and getting to first user in under four weeks. Includes live breakout sessions.',
    host: 'Dr. Priya Sharma',
    status: 'Upcoming',
  },
  {
    id: 'ev-2',
    name: 'Fundraising 101: Pitching to Angel Investors',
    date: '2026-06-15',
    time: '14:00',
    theme: 'Fundraising',
    schedule: '2:00 PM – 4:30 PM IST',
    venue: 'IIIT Hyderabad · Auditorium',
    description:
      'Craft a compelling investor narrative, structure your deck, and handle due diligence questions. Real pitch simulations included.',
    host: 'Robert Kim',
    status: 'Upcoming',
  },
  {
    id: 'ev-3',
    name: 'GTM Strategy for Early-Stage B2B Startups',
    date: '2026-07-18',
    time: '11:00',
    theme: 'Go-to-Market',
    schedule: '11:00 AM – 1:00 PM IST',
    venue: 'IIIT Hyderabad · Seminar Hall B',
    description:
      'Deep dive into ICP definition, outbound playbooks, and channel mix for B2B founders targeting SMEs and enterprise accounts.',
    host: 'James Okafor',
    status: 'Upcoming',
  },
  {
    id: 'ev-4',
    name: 'Customer Discovery Office Hours',
    date: '2026-06-28',
    time: '16:00',
    theme: 'Product Development',
    schedule: '4:00 PM – 5:30 PM IST',
    venue: 'Virtual · Zoom',
    description: 'Drop-in session with incubation mentors to review interview plans and validation evidence.',
    host: 'Incubation Team',
    status: 'Upcoming',
  },
]

const THEME_COLORS = {
  'Product Development': { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  Fundraising: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  'Go-to-Market': { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
}

export function getEventThemeStyle(theme) {
  return THEME_COLORS[theme] || { bg: 'rgba(120,120,120,0.1)', color: '#9ca3af', border: 'rgba(120,120,120,0.25)' }
}

export function formatEventDate(date) {
  if (!date) return ''
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function isEventUpcoming(event) {
  if (event.status !== 'Upcoming') return false
  const today = new Date('2026-06-28T12:00:00')
  const eventDate = new Date(`${event.date}T23:59:59`)
  return eventDate >= today
}
