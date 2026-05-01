export const EVENT_REGISTRATION_DATA = {
  1: {
    venue: 'Convention Center, Downtown',
    credits: '12 CPD Credits',
    days: [
      {
        id: 'd1',
        title: 'Day 1: Opening & Keynotes',
        date: 'December 15, 2026',
        price: 75,
      },
      {
        id: 'd2',
        title: 'Day 2: Workshops',
        date: 'December 16, 2026',
        price: 75,
      },
      {
        id: 'd3',
        title: 'Day 3: Networking & Closing',
        date: 'December 17, 2026',
        price: 75,
      },
    ],
    sessions: [
      { dayId: 'd1', time: '09:00 - 10:30', title: 'Annual Report Overview' },
      { dayId: 'd1', time: '11:00 - 12:30', title: 'Elections & Board Updates' },
      { dayId: 'd2', time: '10:00 - 12:00', title: 'Member Q&A Session' },
      { dayId: 'd3', time: '09:00 - 11:00', title: 'Panel Discussion' },
      { dayId: 'd3', time: '11:30 - 13:00', title: 'Closing Ceremony' },
    ],
  },
  2: {
    venue: 'Grand Hotel Ballroom',
    credits: '6 CPD Credits',
    days: [
      { id: 'd1', title: 'Day 1: Opening Night', date: 'October 25, 2026', price: 150 },
      { id: 'd2', title: 'Day 2: Workshops', date: 'October 26, 2026', price: 150 },
      { id: 'd3', title: 'Day 3: Closing', date: 'October 27, 2026', price: 150 },
    ],
    sessions: [
      { dayId: 'd1', time: '19:00 - 22:00', title: 'Networking Mixer' },
      { dayId: 'd2', time: '10:00 - 12:30', title: 'Morning Workshop' },
      { dayId: 'd2', time: '14:00 - 16:00', title: 'Afternoon Session' },
      { dayId: 'd3', time: '09:00 - 12:00', title: 'Final Sessions & Farewell' },
    ],
  },
};

const EVENT_REGISTRATION_FALLBACK = {
  venue: 'Convention Center',
  credits: '8 CPD Credits',
  days: [
    { id: 'd1', title: 'Day 1: Event Sessions', date: 'October 12, 2026', price: 120 },
    { id: 'd2', title: 'Day 2: Workshops', date: 'October 13, 2026', price: 120 },
    { id: 'd3', title: 'Day 3: Closing', date: 'October 14, 2026', price: 120 },
  ],
  sessions: [
    { dayId: 'd1', time: '09:00 - 11:00', title: 'Opening & Keynote' },
    { dayId: 'd2', time: '10:00 - 12:00', title: 'Applied Workshop' },
    { dayId: 'd3', time: '11:00 - 13:00', title: 'Closing Panel' },
  ],
};

export const getEventWithRegistrationData = event => {
  if (!event) return null;
  const extension = EVENT_REGISTRATION_DATA[event.id];
  return { ...event, ...(extension || EVENT_REGISTRATION_FALLBACK) };
};

export const COURSE_REGISTRATION_DATA = {
  2: {
    schedule: [
      { id: 'b1', label: 'Weekday Evening Batch', startDate: 'June 10, 2026', price: 299 },
      { id: 'b2', label: 'Weekend Intensive Batch', startDate: 'June 22, 2026', price: 329 },
    ],
    modules: ['Modern React Patterns', 'Performance Tuning', 'API Integration', 'Deployment'],
  },
  3: {
    schedule: [
      { id: 'b1', label: 'Morning Batch', startDate: 'June 12, 2026', price: 199 },
      { id: 'b2', label: 'Weekend Batch', startDate: 'June 28, 2026', price: 219 },
    ],
    modules: ['Data Wrangling', 'Visualization', 'Statistical Thinking', 'Model Fundamentals'],
  },
};

const COURSE_REGISTRATION_FALLBACK = {
  schedule: [
    { id: 'b1', label: 'Standard Batch', startDate: 'June 15, 2026', price: 149 },
    { id: 'b2', label: 'Weekend Batch', startDate: 'June 29, 2026', price: 169 },
  ],
  modules: ['Core Concepts', 'Hands-on Practice', 'Case Study Session'],
};

export const getCourseWithRegistrationData = course => {
  if (!course) return null;
  const extension = COURSE_REGISTRATION_DATA[course.id];
  return { ...course, ...(extension || COURSE_REGISTRATION_FALLBACK) };
};

