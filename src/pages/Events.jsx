import React, { useEffect, useMemo, useState } from 'react';
import { Empty, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/events/EventCard';
import { fetchEventsRequest } from '../api/event.api';

function toCardEvent(ev) {
  const start = ev.startDate ? new Date(ev.startDate) : null;
  const isPast = start ? start.getTime() < Date.now() : false;
  return {
    id: ev._id,
    title: ev.title,
    description: ev.description,
    date: start ? start.toLocaleDateString() : 'Date TBD',
    time: start ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD',
    location: ev.isVirtual ? 'Virtual' : ev.venue || 'Location TBD',
    attendees: 0,
    category: 'Event',
    status: ev.status === 'Completed' ? 'completed' : 'available',
    type: isPast ? 'past' : 'upcoming',
  };
}

const Events = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEventsRequest({ status: 'Published' })
      .then((res) => {
        if (cancelled) return;
        const rows = res?.data?.data ?? res?.data ?? [];
        setEvents(Array.isArray(rows) ? rows.map(toCardEvent) : []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        if (filter === 'all') return true;
        return event.type.toLowerCase() === filter.toLowerCase();
      }),
    [events, filter],
  );

  const filters = [
    { value: 'all', label: 'All Events', count: events.length },
    {
      value: 'upcoming',
      label: 'Upcoming',
      count: events.filter(e => e.type === 'upcoming').length,
    },
    {
      value: 'past',
      label: 'Past',
      count: events.filter(e => e.type === 'past').length,
    },
  ];

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 lg:px-8 sm:py-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Events & Workshops
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Discover and register for upcoming professional development events.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {filters.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filter === tab.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === tab.value 
                  ? 'bg-white/20' 
                  : 'bg-white'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Spin size="large" />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredEvents.map((event, index) => (
            <EventCard
              key={event.id || index}
              event={event}
              onRegister={selectedEvent => {
                navigate(`/events/${selectedEvent.id}/register`);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
          <Empty
            description={
              <div className="space-y-2">
                <p className="text-slate-900 font-semibold">No Events Found</p>
                <p className="text-slate-500 text-sm">
                  There are no {filter !== 'all' ? filter : ''} events at the moment.
                </p>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}
    </div>
  );
};

export default Events; 