import React from 'react';
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';

const UpcomingEventCard = ({ event, onOpenDetail, onRegister }) => {
  const isClosed =
    event?.status?.toLowerCase() === 'closed' ||
    event?.status?.toLowerCase() === 'full';

  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
      onClick={() => onOpenDetail(event)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenDetail(event);
        }
      }}
    >
      {event?.image ? (
        <img
          src={event.image}
          alt={event?.title || 'Event'}
          className="h-14 w-14 flex-shrink-0 rounded-lg object-cover sm:h-16 sm:w-16"
        />
      ) : (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-12 sm:w-12">
          <CalendarOutlined className="text-lg text-blue-600 sm:text-xl" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
          {event?.title || 'Upcoming Event'}
        </h3>
        <p className="text-xs text-slate-600 sm:text-sm">
          {event?.date || 'TBD'}
          {event?.time ? ` @ ${event.time}` : ''}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 sm:text-sm">
          <EnvironmentOutlined />
          <span>{event?.location || 'Location TBD'}</span>
        </p>
      </div>
      <button
        onClick={e => {
          e.stopPropagation();
          onRegister(event);
        }}
        className={`w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:w-auto sm:px-4 sm:py-2 sm:text-sm ${
          isClosed
            ? 'border border-slate-300 text-slate-700 hover:bg-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isClosed ? 'Learn More' : 'Register'}
      </button>
    </div>
  );
};

export default UpcomingEventCard;
