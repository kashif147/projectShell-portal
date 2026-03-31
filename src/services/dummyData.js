export const dummyData = {
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://xsgames.co/randomusers/avatar.php?g=male',
    role: 'Premium Member',
    memberSince: '2020-01-01',
  },
  
  communications: [
    {
      id: 1,
      title: 'Annual General Meeting',
      date: '2024-02-05',
      type: 'Meeting',
      status: 'Upcoming',
    },
    {
      id: 2,
      title: 'Membership Renewal Notice',
      date: '2024-01-25',
      type: 'Notice',
      status: 'Read',
    },
    {
      id: 3,
      title: 'Monthly Newsletter',
      date: '2024-01-15',
      type: 'Newsletter',
      status: 'Read',
    },
  ],

  events: [
    {
      id: 1,
      title: 'Annual General Meeting 2024',
      date: '22th February, 2026',
      time: '10:00 AM - 2:00 PM',
      location: 'Convention Center, Downtown',
      category: 'Meeting',
      type: 'upcoming',
      image:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
      attendees: 250,
      status: 'registered',
      description:
        'Join us for our most important meeting of the year. Discuss annual reports, elections, and future plans.',
    },
    {
      id: 2,
      title: 'Networking Mixer',
      date: '23th February, 2026',
      time: '7:00 PM - 10:00 PM',
      location: 'Grand Hotel Ballroom',
      category: 'Networking',
      type: 'upcoming',
      image:
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop',
      attendees: 180,
      status: 'available',
      description:
        'Connect with industry professionals and expand your network in a relaxed atmosphere.',
    },
    {
      id: 3,
      title: 'Leadership Webinar Series',
      date: '27th February, 2026',
      time: '10:00 AM - 12:00 PM',
      location: 'Online',
      category: 'Webinar',
      type: 'upcoming',
      image:
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=400&fit=crop',
      attendees: 320,
      status: 'available',
      description:
        'Learn from industry leaders about effective leadership strategies and team management.',
    },
    {
      id: 4,
      title: 'Tech Skills Workshop',
      date: '27th February, 2026',
      time: '2:00 PM - 5:00 PM',
      location: 'Tech Hub, Innovation Center',
      category: 'Workshop',
      type: 'upcoming',
      image:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',
      attendees: 45,
      status: 'waitlist',
      description:
        'Hands-on workshop covering the latest technologies and development practices.',
    },
    {
      id: 5,
      title: 'Industry Conference 2024',
      date: '28th February, 2026',
      time: '9:00 AM - 6:00 PM',
      location: 'International Convention Center',
      category: 'Conference',
      type: 'past',
      image:
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop',
      attendees: 500,
      status: 'completed',
      description:
        'Annual industry conference featuring keynote speakers and breakout sessions.',
    },
    {
      id: 6,
      title: 'Digital Marketing',
      date: '29th February, 2026',
      time: '1:00 PM - 4:00 PM',
      location: 'Online',
      category: 'Webinar',
      type: 'upcoming',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      attendees: 210,
      status: 'available',
      description:
        'Master the art of digital marketing with expert insights and practical strategies.',
    },
    {
      id: 7,
      title: 'Member Appreciation Gala',
      date: '1st March, 2026',
      time: '6:00 PM - 11:00 PM',
      location: 'Grand Ballroom, Luxury Hotel',
      category: 'Social',
      type: 'upcoming',
      image:
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=400&fit=crop',
      attendees: 300,
      status: 'available',
      description:
        'Celebrate our members and enjoy an evening of fine dining and entertainment.',
    },
    {
      id: 8,
      title: 'Professional Development Summit',
      date: 'Aug 15, 2024',
      time: '8:00 AM - 5:00 PM',
      location: 'Business Center',
      category: 'Conference',
      type: 'past',
      image:
        'https://images.unsplash.com/photo-1543269664-7eef42226a21?w=800&h=400&fit=crop',
      attendees: 400,
      status: 'completed',
      description:
        'Comprehensive summit covering various aspects of professional growth and development.',
    },
  ],

  subscriptionStatus: {
    status: 'Active',
    type: 'Premium',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    features: [
      'Access to all events',
      'Premium content',
      'Priority support',
      'CPD tracking',
    ],
  },

  payments: [
    {
      id: 1,
      date: '2024-01-01',
      amount: 599.99,
      description: 'Annual Membership Renewal',
      status: 'Paid',
    },
    {
      id: 2,
      date: '2023-12-15',
      amount: 49.99,
      description: 'Workshop Registration',
      status: 'Paid',
    },
  ],
};

export const statistics = {
  totalEvents: 15,
  upcomingEvents: 5,
  unreadMessages: 3,
  cpd_points: 45,
}; 