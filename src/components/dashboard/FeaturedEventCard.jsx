import React from 'react';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import {
  getRegistrationStatusLabel,
  isRegistrationLocked,
} from '../../helpers/events.helper';

const FeaturedEventCard = ({ event, onPress, compact = false }) => {
  const statusKey = String(event?.status || '').toLowerCase();
  const isLocked = isRegistrationLocked(event);
  const statusLabel = getRegistrationStatusLabel(event?.status);
  const statusClass =
    statusKey === 'submitted'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : statusKey === 'registered'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <button
      type="button"
      onClick={() => onPress?.(event)}
      className={`featured-event-card group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 ${
        compact
          ? 'featured-event-card--compact w-[82vw] max-w-[300px] shrink-0'
          : ''
      }`}>
      {event?.image ? (
        <div className="h-32 w-full overflow-hidden bg-slate-100 sm:h-36 relative">
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
            <span className="absolute z-10 top-2.5 left-2.5 inline-flex rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 shadow-sm border border-white/60">
              {event.category}
            </span>
          )}
        </div>
      ) : null}

      <div className="flex-1 flex flex-col justify-between p-4 space-y-3">
        <div>
          {!event?.image && event?.category && (
            <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 mb-1.5">
              {event.category}
            </span>
          )}
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 sm:text-base group-hover:text-blue-600 transition-colors">
            {event?.title}
          </h3>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          {event?.date || event?.time ? (
            <p className="flex items-center gap-2">
              <CalendarOutlined className="shrink-0 text-blue-600" />
              <span className="line-clamp-1 font-medium">
                {event?.date || 'Date TBD'}
                {event?.time ? ` · ${event.time}` : ''}
              </span>
            </p>
          ) : null}
          {event?.location ? (
            <p className="flex items-start gap-2">
              <EnvironmentOutlined className="mt-0.5 shrink-0 text-cyan-600" />
              <span className="line-clamp-1">{event.location}</span>
            </p>
          ) : null}
          {!event?.date && !event?.time && !event?.location ? (
            <p className="flex items-center gap-2 text-slate-400">
              <ClockCircleOutlined />
              <span>Details unavailable</span>
            </p>
          ) : null}
        </div>

        {isLocked && (
          <div className="pt-2 border-t border-slate-100">
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

export default FeaturedEventCard;
