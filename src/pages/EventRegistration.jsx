import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import Button from '../components/common/Button';
import { fetchEventByIdRequest, createEventRegistrationRequest } from '../api/event.api';

const EventRegistration = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user, userDetail } = useSelector(state => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSessionIds, setSelectedSessionIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchEventByIdRequest(eventId)
      .then(res => {
        if (cancelled) return;
        const data = res?.data?.data ?? res?.data ?? null;
        setEvent(data);
        // Full-attendance events (allowPartialAttendance false/default) must
        // include every day - only let the member pick a subset when the
        // event explicitly allows partial attendance.
        const eventSessions = data?.sessions || [];
        setSelectedSessionIds(data?.allowPartialAttendance ? [] : eventSessions.map(s => s._id));
      })
      .catch(() => {
        if (!cancelled) setEvent(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const sessions = event?.sessions || [];
  const allowPartialAttendance = !!event?.allowPartialAttendance;

  const toggleSession = session => {
    if (!allowPartialAttendance) return;
    setSelectedSessionIds(prev =>
      prev.includes(session._id)
        ? prev.filter(id => id !== session._id)
        : [...prev, session._id],
    );
  };

  const email = user?.userEmail || userDetail?.userEmail || user?.email || userDetail?.email || '';
  const firstName = user?.userFirstName || userDetail?.userFirstName || '';
  const lastName = user?.userLastName || userDetail?.userLastName || '';

  const handleRegisterAndPay = async () => {
    if (!event) return;
    if (!email) {
      message.error('An account email is required to register.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createEventRegistrationRequest({
        registrationType: 'event',
        eventId: event._id,
        sessionIds: selectedSessionIds,
        profile: { email, firstName, lastName },
        paymentMethod: 'stripe',
        registeredVia: 'portal',
      });
      const data = res?.data?.data ?? res?.data;
      if (!data?.payment?.clientSecret) {
        message.error(data?.error?.message || 'Failed to start registration payment');
        return;
      }
      navigate('/registrations/payment', {
        state: {
          source: 'event-registration',
          eventId: event._id,
          eventTitle: event.title,
          registrationId: data.registration?._id,
          clientSecret: data.payment.clientSecret,
          totalCost: (data.registration?.amount || 0) / 100,
        },
      });
    } catch (err) {
      message.error(err?.response?.data?.error?.message || err?.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">Loading…</div>
      </div>
    );
  }

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
        <div className="p-4 sm:p-6">
          <h1 className="text-2xl font-bold sm:text-3xl text-slate-900">{event.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{event.description}</p>
          <p className="mt-2 text-sm text-slate-700">
            {event.isVirtual ? 'Virtual' : event.venue || 'Location TBD'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Registration Options</h2>
        <p className="mt-1 text-sm text-slate-600">
          {sessions.length > 0
            ? allowPartialAttendance
              ? 'Select one or more sessions to continue.'
              : 'This event requires full attendance - every day is included.'
            : 'Register below to continue to payment.'}
        </p>

        {sessions.length > 0 && (
          <div className="mt-4 space-y-4">
            {sessions.map(session => {
              const selected = selectedSessionIds.includes(session._id);
              return (
                <button
                  key={session._id}
                  type="button"
                  onClick={() => toggleSession(session)}
                  disabled={!allowPartialAttendance}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selected
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } ${!allowPartialAttendance ? 'cursor-default' : ''}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {session.label}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {session.date ? new Date(session.date).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-lg px-3 py-1 text-xs font-semibold ${
                        selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                      {allowPartialAttendance ? (selected ? 'Selected' : 'Select') : 'Included'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="sticky bottom-4 z-10 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Pricing</p>
            <p className="text-sm text-slate-700">Calculated at checkout (member pricing applies automatically)</p>
          </div>
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={sessions.length > 0 && selectedSessionIds.length === 0}
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
