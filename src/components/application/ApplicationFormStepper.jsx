import React from 'react';
import { APPLICATION_FORM_STEPS } from '../../helpers/applicationForm.helper';

const ApplicationFormStepper = ({
  currentStep,
  isSubmitted,
  isNextLoading,
  onStepClick,
  steps = APPLICATION_FORM_STEPS,
}) => (
  <div className="app-form-stepper mb-5 sm:mb-7">
    {steps.map((step, index) => {
      const isCompleted =
        currentStep > step.number || (isSubmitted && step.number === 3);
      const isCurrent = currentStep === step.number;
      const isClickable =
        isCompleted || isCurrent || step.number === currentStep + 1;
      const isDone = (isSubmitted && step.number === 3) || isCompleted;
      const lineDone =
        (isSubmitted && step.number === 2) || currentStep > step.number;

      return (
        <React.Fragment key={step.number}>
          <button
            type="button"
            onClick={() => onStepClick(step.number)}
            disabled={!isClickable || isNextLoading}
            aria-current={isCurrent ? 'step' : undefined}
            className={`app-form-stepper__step ${
              isClickable && !isNextLoading
                ? 'app-form-stepper__step--active'
                : 'app-form-stepper__step--disabled'
            }`}>
            <span
              className={`app-form-stepper__badge ${
                isDone
                  ? 'app-form-stepper__badge--done'
                  : isCurrent
                    ? 'app-form-stepper__badge--current'
                    : 'app-form-stepper__badge--todo'
              }`}>
              {isDone ? '✓' : step.number}
            </span>
            <span
              className={`app-form-stepper__label ${
                isDone
                  ? 'text-green-600'
                  : isCurrent
                    ? 'text-blue-600'
                    : 'text-slate-500'
              }`}>
              <span className="app-form-stepper__label-full">{step.title}</span>
              <span className="app-form-stepper__label-short">
                {step.shortTitle || step.title.split(' ')[0]}
              </span>
            </span>
          </button>

          {index < steps.length - 1 && (
            <div
              className={`app-form-stepper__line ${
                lineDone ? 'app-form-stepper__line--done' : ''
              }`}
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default ApplicationFormStepper;
