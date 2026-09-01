import React from 'react';
import { UserOutlined, ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons';

const ProfileCompletionCard = ({
  percent,
  message,
  isMember,
  buttonDisabled,
  buttonLabel,
  onButtonClick,
  isComplete,
}) => {
  const accentClass = isComplete ? 'text-emerald-600' : 'text-blue-600';
  const barClass = isComplete
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
    : 'bg-gradient-to-r from-blue-500 to-indigo-600';

  return (
    <div className="section-card profile-completion-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <UserOutlined />
            </span>
            Profile Completion
          </h2>
          {isComplete && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircleFilled /> Complete
            </span>
          )}
        </div>

        <p className="mb-4 text-xs sm:text-sm text-slate-500 leading-relaxed">
          {message}
        </p>

        <div className="mb-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Overall Progress
            </span>
            <span className={`text-xl font-black ${accentClass}`}>
              {percent}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {isMember && (
        <button
          type="button"
          disabled={buttonDisabled}
          onClick={onButtonClick}
          className={`mt-2 flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            buttonDisabled
              ? 'cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
              : isComplete
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99] shadow-sm shadow-emerald-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] shadow-sm shadow-blue-500/20'
          }`}>
          <span>{buttonLabel}</span>
          {!buttonDisabled && <ArrowRightOutlined className="text-xs" />}
        </button>
      )}
    </div>
  );
};

export default ProfileCompletionCard;
