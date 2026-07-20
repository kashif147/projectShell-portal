import React from 'react';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const EventDetailModal = ({ event, onClose, onRegister }) => {
  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl sm:p-6"
        onClick={e => e.stopPropagation()}>
        {event.image && (
          <img
            src={event.image}
            alt={event.title || 'Event'}
            className="mb-4 h-44 w-full rounded-lg object-cover"
          />
        )}
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
            {event.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Close
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          {event.description || 'No additional details available.'}
        </p>
        <div className="space-y-2 text-sm text-slate-700">
          <p className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-600" />
            <span>{event.date || 'Date TBD'}</span>
          </p>
          {event.time && (
            <p className="flex items-center gap-2">
              <ClockCircleOutlined className="text-blue-600" />
              <span>{event.time}</span>
            </p>
          )}
          <p className="flex items-center gap-2">
            <EnvironmentOutlined className="text-blue-600" />
            <span>{event.location || 'Location TBD'}</span>
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
