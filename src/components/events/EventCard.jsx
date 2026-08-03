import React from 'react';
import Button from '../common/Button';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  TagOutlined,
} from '@ant-design/icons';

const statusStyles = {
  registered: 'bg-blue-100 text-blue-700 border-blue-200',
  available: 'bg-green-100 text-green-700 border-green-200',
  waitlist: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
};

const DESCRIPTION_PREVIEW_LENGTH = 140;

const EventCardImageHeader = ({ event }) => (
  <div className="w-full shrink-0 overflow-hidden bg-slate-100">
    <img
      src={event.image}
      alt={event?.title || 'Event'}
      className="block h-auto w-full"
    />
  </div>
);

const EventCard = ({ event, onRegister, onViewDetails }) => {
  const statusClass =
    statusStyles[event?.status?.toLowerCase()] ||
    'bg-slate-100 text-slate-700 border-slate-200';
  const isCompleted = String(event?.status || '').toLowerCase() === 'completed';
  const isWaitlist = String(event?.status || '').toLowerCase() === 'waitlist';
  const isRegistered =
    String(event?.status || '').toLowerCase() === 'registered';
  const description = event?.description || 'No description available.';
  const hasLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const hasImage = Boolean(event?.image);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {hasImage ? <EventCardImageHeader event={event} /> : null}

      <div className="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            {event?.category ? (
              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                {event.category}
              </span>
            ) : null}
            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">
              {event?.title}
            </h3>
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}>
            {event?.status || 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
          {event?.date ? (
            <div className="flex items-start gap-2">
              <CalendarOutlined className="mt-0.5 shrink-0 text-blue-600" />
              <span className="min-w-0">{event.date}</span>
            </div>
          ) : null}
          {event?.time ? (
            <div className="flex items-start gap-2">
              <ClockCircleOutlined className="mt-0.5 shrink-0 text-violet-700" />
              <span className="min-w-0">{event.time}</span>
            </div>
          ) : null}
          {event?.location ? (
            <div className="flex items-start gap-2 sm:col-span-2">
              <EnvironmentOutlined className="mt-0.5 shrink-0 text-cyan-700" />
              <span className="min-w-0 whitespace-normal leading-snug">
                {event.location}
              </span>
            </div>
          ) : null}
        </div>

        <div className="min-h-[4.5rem]">
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
            {description}
          </p>
          {hasLongDescription && (
            <button
              type="button"
              onClick={() => onViewDetails?.(event)}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              View details
            </button>
          )}
        </div>

        <div className="grid min-h-[2.5rem] grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-slate-700">
            <TeamOutlined className="text-emerald-700" />
            <span>
              {event?.attendees != null
                ? `${event.attendees} capacity`
                : 'Open registration'}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <TagOutlined />
            {event?.category || 'General'}
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="default"
              onClick={() => onViewDetails?.(event)}
              className="!h-10 !rounded-lg !px-3 !font-semibold">
              Details
            </Button>
            <Button
              type="primary"
              disabled={isCompleted || isRegistered}
              onClick={() => onRegister && onRegister(event)}
              className={`!h-10 !rounded-lg !px-4 !font-semibold ${
                isCompleted || isRegistered
                  ? ''
                  : isWaitlist
                    ? '!border-amber-500 !bg-amber-500 hover:!bg-amber-600'
                    : '!border-blue-600 !bg-blue-600 hover:!bg-blue-700'
              }`}>
              {isCompleted
                ? 'Completed'
                : isRegistered
                  ? 'Registered'
                  : isWaitlist
                    ? 'Join Waitlist'
                    : 'Register'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
