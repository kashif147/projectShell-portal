import React from 'react';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const FeaturedEventCard = ({ event, onPress, compact = false }) => {
  const isRegistered = String(event?.status || '').toLowerCase() === 'registered';

  return (
    <button
      type="button"
      onClick={() => onPress?.(event)}
      className={`featured-event-card group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md ${
        compact
          ? 'featured-event-card--compact w-[82vw] max-w-[300px] shrink-0'
          : ''
      }`}>
      {event?.image ? (
        <div className="h-28 w-full overflow-hidden bg-slate-100 sm:h-32">
          <img
            src={event.image}
            alt={event?.title || 'Event'}
            className="h-full w-full object-contain"
          />
        </div>
      ) : null}

      <div className="space-y-1.5 p-3 sm:p-3.5">
        {event?.category ? (
          <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
            {event.category}
          </span>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 sm:text-base">
          {event?.title}
        </h3>
        <div className="space-y-1 text-xs text-slate-600">
          {event?.date || event?.time ? (
            <p className="flex items-center gap-1.5">
              <CalendarOutlined className="shrink-0 text-blue-600" />
              <span className="line-clamp-1">
                {event?.date || 'Date TBD'}
                {event?.time ? ` · ${event.time}` : ''}
              </span>
            </p>
          ) : null}
          {event?.location ? (
            <p className="flex items-start gap-1.5">
              <EnvironmentOutlined className="mt-0.5 shrink-0 text-cyan-700" />
              <span className="line-clamp-1">{event.location}</span>
            </p>
          ) : null}
          {!event?.date && !event?.time && !event?.location ? (
            <p className="flex items-center gap-1.5 text-slate-400">
              <ClockCircleOutlined />
              <span>Details unavailable</span>
            </p>
          ) : null}
        </div>
        {isRegistered ? (
          <p className="text-xs font-medium text-blue-700">Registered</p>
        ) : null}
      </div>
    </button>
  );
};

export default FeaturedEventCard;
