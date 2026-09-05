import React from 'react';
import { CalendarOutlined, EnvironmentOutlined, ArrowRightOutlined } from '@ant-design/icons';

const UpcomingEventCard = ({ event, onOpenDetail, onRegister }) => {
  const isClosed =
    event?.status?.toLowerCase() === 'closed' ||
    event?.status?.toLowerCase() === 'full';

  return (
    <div
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center sm:gap-4 cursor-pointer"
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
          className="h-16 w-16 flex-shrink-0 rounded-xl object-cover border border-slate-100 group-hover:scale-105 transition-transform duration-200"
        />
      ) : (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
          <CalendarOutlined className="text-xl" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-slate-900 sm:text-base group-hover:text-blue-600 transition-colors line-clamp-1">
          {event?.title || 'Upcoming Event'}
        </h3>
        <p className="text-xs text-slate-600 sm:text-sm mt-0.5">
          {event?.date || 'TBD'}
          {event?.time ? ` · ${event.time}` : ''}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1">
          <EnvironmentOutlined className="text-slate-400" />
          <span>{event?.location || 'Location TBD'}</span>
        </p>
      </div>
      <button
        onClick={e => {
          e.stopPropagation();
          onRegister(event);
        }}
        className={`w-full rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 sm:w-auto sm:text-sm flex items-center justify-center gap-1.5 ${
          isClosed
            ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-500/20'
        }`}
      >
        <span>{isClosed ? 'Learn More' : 'Register'}</span>
        {!isClosed && <ArrowRightOutlined className="text-xs" />}
      </button>
    </div>
  );
};

export default UpcomingEventCard;
