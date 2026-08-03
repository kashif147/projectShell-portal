import React from 'react';

const ProfileCompletionCard = ({
  percent,
  message,
  isMember,
  buttonDisabled,
  buttonLabel,
  onButtonClick,
  isComplete,
}) => {
  const accentClass = isComplete ? 'text-green-600' : 'text-blue-600';
  const barClass = isComplete ? 'bg-green-600' : 'bg-blue-600';
  const buttonClass = buttonDisabled
    ? 'cursor-not-allowed bg-gray-300 text-gray-500 opacity-60'
    : isComplete
      ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800';

  return (
    <div className="section-card profile-completion-card">
      <h2 className="mb-1.5 text-xl font-extrabold tracking-tight text-slate-900">
        Profile Completion
      </h2>
      <p className="mb-3.5 text-sm text-slate-500">{message}</p>
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className={`text-2xl font-extrabold ${accentClass}`}>
            {percent}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${barClass}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      {isMember && (
        <button
          type="button"
          disabled={buttonDisabled}
          onClick={onButtonClick}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:py-3 sm:text-base ${buttonClass}`}>
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default ProfileCompletionCard;
