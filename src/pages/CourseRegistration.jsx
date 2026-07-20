import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import Button from '../components/common/Button';
import { fetchCourseByIdRequest, createCourseRegistrationRequest } from '../api/course.api';

const CourseRegistration = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user, userDetail } = useSelector(state => state.auth);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCourseByIdRequest(courseId)
      .then(res => {
        if (cancelled) return;
        setCourse(res?.data?.data ?? res?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setCourse(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const email = user?.userEmail || userDetail?.userEmail || user?.email || userDetail?.email || '';
  const firstName = user?.userFirstName || userDetail?.userFirstName || '';
  const lastName = user?.userLastName || userDetail?.userLastName || '';

  const handleProceed = async () => {
    if (!course) return;
    if (!email) {
      message.error('An account email is required to register.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createCourseRegistrationRequest({
        registrationType: 'course',
        courseId: course._id,
        profile: { email, firstName, lastName },
        paymentMethod: 'stripe',
        registeredVia: 'portal',
      });
      const data = res?.data?.data ?? res?.data;
      if (!data?.payment?.clientSecret) {
        message.error(data?.error?.message || 'Failed to start registration payment');
        return;
      }
      navigate('/registrations/payment', {
        state: {
          source: 'course-registration',
          courseId: course._id,
          courseTitle: course.title,
          registrationId: data.registration?._id,
          clientSecret: data.payment.clientSecret,
          totalCost: (data.registration?.amount || 0) / 100,
        },
      });
    } catch (err) {
      message.error(err?.response?.data?.error?.message || err?.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">Loading…</div>
      </div>
    );
  }

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

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 lg:px-8 sm:py-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 sm:p-6">
          <h1 className="text-2xl font-bold sm:text-3xl text-slate-900">{course.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{course.deliveryMode}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Course Overview</h2>
          <p className="mt-2 text-sm text-slate-600">{course.description}</p>
          <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Start date</p>
          <p className="text-sm text-slate-700">
            {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'TBD'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase text-slate-500">Total</p>
          <p className="text-sm text-slate-700 mb-2">Calculated at checkout (member pricing applies automatically)</p>
          <Button
            type="primary"
            block
            loading={isSubmitting}
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
