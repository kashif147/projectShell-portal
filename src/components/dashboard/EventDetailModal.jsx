import React from 'react';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  buildAvailablePricingOptions,
  formatRegistrationPrice,
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

  const isRegistered =
    String(event?.status || '').toLowerCase() === 'registered' ||
    Boolean(event?.registrationId);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <p className="text-xs font-semibold tracking-wide text-blue-600">
              {event.category || 'Event'}
            </p>
            <h3 className="mt-1 break-words text-lg font-semibold text-slate-900 sm:text-xl">
              {event.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-sm font-medium text-slate-500 hover:text-slate-700">
            Close
          </button>
        </div>

        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4 sm:px-6">
          {event.image && (
            <div className="mb-4 w-full overflow-hidden rounded-lg bg-slate-100">
              <img
                src={event.image}
                alt={event.title || 'Event'}
                className="block h-auto w-full"
              />
            </div>
          )}

          <div className="mb-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <p className="flex min-w-0 items-start gap-2 text-slate-700">
              <CalendarOutlined className="mt-0.5 shrink-0 text-blue-600" />
              <span className="min-w-0 break-words">{event.date || 'Date TBD'}</span>
            </p>
            {event.time && (
              <p className="flex min-w-0 items-start gap-2 text-slate-700">
                <ClockCircleOutlined className="mt-0.5 shrink-0 text-violet-700" />
                <span className="min-w-0 break-words">{event.time}</span>
              </p>
            )}
            <p className="flex min-w-0 items-start gap-2 text-slate-700 sm:col-span-2">
              <EnvironmentOutlined className="mt-0.5 shrink-0 text-cyan-700" />
              <span className="min-w-0 break-words">
                {event.location || 'Location TBD'}
              </span>
            </p>
            <p className="flex min-w-0 items-start gap-2 text-slate-700">
              <TeamOutlined className="mt-0.5 shrink-0 text-emerald-700" />
              <span className="min-w-0 break-words">
                {event.attendees != null
                  ? `${event.attendees} capacity`
                  : 'Open registration'}
              </span>
            </p>
            {event.cpdCredits != null && (
              <p className="flex min-w-0 items-start gap-2 text-slate-700">
                <TagOutlined className="mt-0.5 shrink-0 text-slate-600" />
                <span className="min-w-0 break-words">
                  {event.cpdCredits} CPD credits
                </span>
              </p>
            )}
          </div>

          {pricingOptions.length > 0 && (
            <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Available Pricing
              </p>
              <div className="space-y-1.5">
                {pricingOptions.map(option => (
                  <div
                    key={option.id}
                    className="flex min-w-0 items-start justify-between gap-3 text-sm text-slate-700">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-slate-900">
                        {option.title}
                      </p>
                      {option.subtitle ? (
                        <p className="break-words text-xs text-slate-500">
                          {option.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-semibold text-slate-900">
                      {option.isGroup
                        ? `${formatRegistrationPrice(option.unitPrice)} / student`
                        : formatRegistrationPrice(option.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="min-w-0 border-t border-slate-100 pt-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-900">
              About this event
            </h4>
            {descriptionHtml ? (
              <div
                className="prose prose-sm max-w-none overflow-x-hidden break-words text-slate-600 prose-headings:break-words prose-p:my-2 prose-p:break-words prose-a:break-all prose-img:h-auto prose-img:max-w-full prose-pre:whitespace-pre-wrap prose-pre:break-words prose-table:block prose-table:w-full prose-table:overflow-x-auto prose-strong:text-slate-800 [&_*]:max-w-full"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : (
              <p className="break-words text-sm text-slate-600">
                {event.description || 'No additional details available.'}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Close
          </button>
          {isRegistered ? (
            <span className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              Registered
            </span>
          ) : (
            <button
              type="button"
              onClick={onRegister}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
