import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import { dummyData } from '../services/dummyData';
import { getEventWithRegistrationData } from '../services/registrationData';

const EventRegistration = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseEvent = dummyData.events.find(item => String(item.id) === String(eventId));
  const event = getEventWithRegistrationData(baseEvent);

  const sessionsByDay = useMemo(() => {
    const map = new Map();
    (event?.sessions || []).forEach(session => {
      if (!map.has(session.dayId)) map.set(session.dayId, []);
      map.get(session.dayId).push(session);
    });
    return map;
  }, [event]);

  const totalCost = selectedDays.reduce((sum, day) => sum + (day.price || 0), 0);

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.some(item => item.id === day.id)
        ? prev.filter(item => item.id !== day.id)
        : [...prev, day],
    );
  };

  const handleRegisterAndPay = () => {
    if (selectedDays.length === 0 || !event) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/registrations/payment', {
        state: {
          source: 'event-registration',
          eventId: event.id,
          eventTitle: event.title,
          selectedDays,
          totalCost,
        },
      });
    }, 450);
  };

  if (!event) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Event Not Found</h1>
          <p className="mt-2 text-sm text-slate-600">This event is unavailable or has been removed.</p>
          <Button type="default" className="mt-4" onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 lg:px-8 sm:py-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-48 sm:h-60">
          <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              {event.category}
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">{event.title}</h1>
            <p className="mt-1 text-sm text-slate-100">{event.location}</p>
          </div>
        </div>
        <div className="grid gap-4 border-t border-slate-100 p-4 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Venue</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{event.venue}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Credits</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{event.credits}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Registration Options</h2>
        <p className="mt-1 text-sm text-slate-600">Select one or more event days to continue.</p>

        <div className="mt-4 space-y-4">
          {(event.days || []).map(day => {
            const selected = selectedDays.some(item => item.id === day.id);
            const daySessions = sessionsByDay.get(day.id) || [];
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selected
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {day.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{day.date}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">${day.price.toFixed(2)}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-lg px-3 py-1 text-xs font-semibold ${
                      selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                    {selected ? 'Selected' : 'Select'}
                  </span>
                </div>
                {daySessions.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                    {daySessions.map((session, index) => (
                      <p key={`${day.id}-${index}`} className="text-sm text-slate-600">
                        <span className="font-medium text-slate-800">{session.time}</span> - {session.title}
                      </p>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-4 z-10 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Total Cost</p>
            <p className="text-2xl font-bold text-slate-900">${totalCost.toFixed(2)}</p>
          </div>
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={selectedDays.length === 0}
            onClick={handleRegisterAndPay}
            className="!h-11 !rounded-lg !px-5 !font-semibold">
            Register & Pay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;

