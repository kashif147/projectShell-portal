import React from 'react';
import Button from '../common/Button';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  TagOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import {
  getRegistrationStatusLabel,
  isRegistrationLocked,
} from '../../helpers/events.helper';

const statusStyles = {
  registered: 'bg-blue-50 text-blue-700 border-blue-200',
  submitted: 'bg-amber-50 text-amber-800 border-amber-200',
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  waitlist: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
};

const DESCRIPTION_PREVIEW_LENGTH = 140;

const EventCardImageHeader = ({ event }) => (
  <div className="w-full shrink-0 overflow-hidden bg-slate-100 relative h-40">
    <div className="relative h-full w-full overflow-hidden bg-gray-100">
      {/* Background image - fills the area */}
      <img
        src={event.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover blur-xl scale-110"
      />

      {/* Main image - completely visible */}
      <img
        src={event.image}
        alt={event?.title || 'Event'}
        className="relative z-10 h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </div>

    {event?.category && (
      <span className="absolute z-10 top-3 left-3 inline-flex rounded-lg bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 shadow-sm border border-white/60">
        {event.category}
      </span>
    )}
  </div>
);

const EventCard = ({ event, onRegister, onViewDetails }) => {
  const statusKey = String(event?.status || '').toLowerCase();
  const statusClass =
    statusStyles[statusKey] || 'bg-slate-100 text-slate-700 border-slate-200';
  const statusLabel = getRegistrationStatusLabel(event?.status);
  const isCompleted = statusKey === 'completed';
  const isWaitlist = statusKey === 'waitlist';
  const isSubmitted = statusKey === 'submitted';
  const isRegistered = statusKey === 'registered';
  const isLocked = isRegistrationLocked(event);
  const description = event?.description || 'No description available.';
  const hasLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const hasImage = Boolean(event?.image);

  const actionLabel = isCompleted
    ? 'Completed'
    : isRegistered
      ? 'Registered'
      : isSubmitted
        ? 'Submitted'
        : isWaitlist
          ? 'Join Waitlist'
          : 'Register Now';

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-4px_rgba(15,23,42,0.04)] transition-all duration-250 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300">
      {hasImage ? <EventCardImageHeader event={event} /> : null}

      <div className="flex flex-1 flex-col space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {!hasImage && event?.category && (
              <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1.5">
                {event.category}
              </span>
            )}
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 group-hover:text-blue-600 transition-colors">
              {event?.title}
            </h3>
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 rounded-xl p-3 border border-slate-100">
          {event?.date ? (
            <div className="flex items-center gap-2">
              <CalendarOutlined className="shrink-0 text-blue-600 text-sm" />
              <span className="font-semibold text-slate-800">{event.date}</span>
            </div>
          ) : null}
          {event?.time ? (
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="shrink-0 text-indigo-600 text-sm" />
              <span className="text-slate-600">{event.time}</span>
            </div>
          ) : null}
          {event?.location ? (
            <div className="flex items-start gap-2">
              <EnvironmentOutlined className="mt-0.5 shrink-0 text-emerald-600 text-sm" />
              <span className="line-clamp-1 text-slate-600">
                {event.location}
              </span>
            </div>
          ) : null}
        </div>

        <div className="min-h-[3.5rem] flex-1">
          <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-500">
            {description}
          </p>
          {hasLongDescription && (
            <button
              type="button"
              onClick={() => onViewDetails?.(event)}
              className="mt-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Read more details →
            </button>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3.5 gap-2">
          {event?.attendees != null ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <TeamOutlined className="text-emerald-600" />
              <span>{event.attendees} seats</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <TagOutlined />
              <span>{event?.category || 'General'}</span>
            </span>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="default"
              size="small"
              onClick={() => onViewDetails?.(event)}>
              Details
            </Button>
            <Button
              type="primary"
              size="small"
              disabled={isLocked || isCompleted}
              onClick={() => onRegister && onRegister(event)}>
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
