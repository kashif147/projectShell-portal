import React from 'react';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TagOutlined,
  TeamOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import {
  buildAvailablePricingOptions,
  formatRegistrationPrice,
  getRegistrationStatusLabel,
  isRegistrationLocked,
} from '../../helpers/events.helper';
import { useMemberRole } from '../../hooks/useMemberRole';
import { useApplication } from '../../contexts/applicationContext';

const EventDetailModal = ({ event, onClose, onRegister }) => {
  const { isMember } = useMemberRole();
  const {
    professionalDetail,
    subscriptionDetail,
    categoryData,
  } = useApplication();

  if (!event) return null;

  const isLocked = isRegistrationLocked(event);
  const statusLabel = getRegistrationStatusLabel(event?.status);
  const isSubmitted =
    String(event?.status || '').toLowerCase() === 'submitted';

  const descriptionHtml = event.descriptionHtml || event.raw?.description;
  const membershipCategory =
    professionalDetail?.professionalDetails?.membershipCategory ||
    subscriptionDetail?.subscriptionDetails?.membershipCategory ||
    '';
  const pricingOptions = buildAvailablePricingOptions(event, {
    isMember,
    membershipCategory,
    categoryCode: categoryData?.code,
    categoryName: categoryData?.name,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200/80"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div className="min-w-0 pr-4">
            <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">
              {event.category || 'Event'}
            </span>
            <h3 className="break-words text-lg font-bold text-slate-900 font-poppins sm:text-xl">
              {event.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
            <CloseOutlined className="text-sm" />
          </button>
        </div>

        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-5 space-y-4">
          {event.image && (
            <div className="w-full overflow-hidden rounded-xl bg-slate-100 h-48 sm:h-56">
              <img
                src={event.image}
                alt={event.title || 'Event'}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm">
            <p className="flex min-w-0 items-center gap-2 text-slate-700">
              <CalendarOutlined className="text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-900">{event.date || 'Date TBD'}</span>
            </p>
            {event.time && (
              <p className="flex min-w-0 items-center gap-2 text-slate-700">
                <ClockCircleOutlined className="text-indigo-600 shrink-0" />
                <span className="text-slate-700">{event.time}</span>
              </p>
            )}
            <p className="flex min-w-0 items-start gap-2 text-slate-700 sm:col-span-2">
              <EnvironmentOutlined className="text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700">{event.location || 'Location TBD'}</span>
            </p>
            <p className="flex min-w-0 items-center gap-2 text-slate-700">
              <TeamOutlined className="text-purple-600 shrink-0" />
              <span className="text-slate-700">
                {event.attendees != null
                  ? `${event.attendees} capacity`
                  : 'Open registration'}
              </span>
            </p>
            {event.cpdCredits != null && (
              <p className="flex min-w-0 items-center gap-2 text-slate-700">
                <TagOutlined className="text-amber-600 shrink-0" />
                <span className="font-semibold text-amber-900">
                  {event.cpdCredits} CPD credits
                </span>
              </p>
            )}
          </div>

          {pricingOptions.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                Registration Fees
              </p>
              <div className="space-y-2">
                {pricingOptions.map(option => (
                  <div
                    key={option.id}
                    className="flex min-w-0 items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {option.title}
                      </p>
                      {option.subtitle && (
                        <p className="text-xs text-slate-500">
                          {option.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="font-extrabold text-blue-700">
                      {option.isGroup
                        ? `${formatRegistrationPrice(option.unitPrice)} / student`
                        : formatRegistrationPrice(option.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <h4 className="mb-2 text-sm font-bold text-slate-900 font-poppins">
              About this event
            </h4>
            {descriptionHtml ? (
              <div
                className="prose prose-sm max-w-none text-slate-600 leading-relaxed [&_*]:max-w-full"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {event.description || 'No additional details available.'}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end items-center gap-2.5 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Close
          </button>
          {isLocked ? (
            <span
              className={`inline-flex items-center rounded-xl px-4 py-2 text-xs sm:text-sm font-bold border ${
                isSubmitted
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
              {statusLabel}
            </span>
          ) : (
            <button
              type="button"
              onClick={onRegister}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-95 transition-all">
              Register Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
