import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import { staticCourses } from '../services/courseData';
import { getCourseWithRegistrationData } from '../services/registrationData';

const CourseRegistration = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseCourse = staticCourses.find(item => String(item.id) === String(courseId));
  const course = getCourseWithRegistrationData(baseCourse);

  if (!course) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Course Not Found</h1>
          <p className="mt-2 text-sm text-slate-600">This course is unavailable or has been removed.</p>
          <Button type="default" className="mt-4" onClick={() => navigate('/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const selectedBatch = (course.schedule || []).find(batch => batch.id === selectedBatchId);
  const payableAmount = selectedBatch?.price || 0;
  const canProceed = Boolean(selectedBatchId);

  const handleProceed = () => {
    if (!canProceed) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/registrations/payment', {
        state: {
          source: 'course-registration',
          courseId: course.id,
          courseTitle: course.title,
          selectedBatch,
          totalCost: payableAmount,
        },
      });
    }, 450);
  };

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 lg:px-8 sm:py-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-48 sm:h-60">
          <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              {course.category}
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">{course.title}</h1>
            <p className="mt-1 text-sm text-slate-100">Instructor: {course.instructor}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Choose a Batch</h2>
          <p className="mt-1 text-sm text-slate-600">
            Select your preferred schedule and continue to payment.
          </p>

          <div className="mt-4 space-y-3">
            {(course.schedule || []).map(batch => {
              const selected = selectedBatchId === batch.id;
              return (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selected
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{batch.label}</p>
                      <p className="mt-1 text-xs text-slate-600">Starts: {batch.startDate}</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">${batch.price.toFixed(2)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900">Course Overview</h3>
          <p className="mt-2 text-sm text-slate-600">{course.description}</p>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Modules</p>
            <ul className="space-y-1">
              {(course.modules || []).map(module => (
                <li key={module} className="text-sm text-slate-700">
                  • {module}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-900">${payableAmount.toFixed(2)}</p>
          </div>
          <Button
            type="primary"
            block
            loading={isSubmitting}
            disabled={!canProceed}
            onClick={handleProceed}
            className="!mt-4 !h-11 !rounded-lg !font-semibold">
            Register & Pay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseRegistration;

