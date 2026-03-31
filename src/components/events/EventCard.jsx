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

const EventCard = ({ event }) => {
  const statusClass =
    statusStyles[event?.status?.toLowerCase()] ||
    'bg-slate-100 text-slate-700 border-slate-200';
  const isCompleted = String(event?.status || '').toLowerCase() === 'completed';
  const isWaitlist = String(event?.status || '').toLowerCase() === 'waitlist';

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {event?.image && (
        <img
          src={event.image}
          alt={event?.title || 'Event'}
          className="h-44 w-full object-cover"
        />
      )}

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">{event?.title}</h3>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}
          >
            {event?.status || 'N/A'}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">
          {event?.description || 'No description available.'}
        </p>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-slate-700">
            <CalendarOutlined className="text-blue-600" />
            <span>{event?.date || 'Date TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <ClockCircleOutlined className="text-violet-700" />
            <span>{event?.time || 'Time TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <EnvironmentOutlined className="text-cyan-700" />
            <span>{event?.location || 'Location TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <TeamOutlined className="text-emerald-700" />
            <span>{event?.attendees || 0} attendees</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <TagOutlined />
            {event?.category || 'General'}
          </span>

          <Button
            type="primary"
            disabled={isCompleted}
            className={`!h-10 !rounded-lg !px-4 !font-semibold ${
              isCompleted
                ? ''
                : isWaitlist
                ? '!bg-amber-500 hover:!bg-amber-600 !border-amber-500'
                : '!bg-blue-600 hover:!bg-blue-700 !border-blue-600'
            }`}
          >
            {isCompleted ? 'Completed' : isWaitlist ? 'Join Waitlist' : 'Register'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
