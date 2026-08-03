import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import PersonalInformation from '../components/application/PersonalInformation';
import RegistrationPricingOptions from '../components/events/RegistrationPricingOptions';
import { fetchPublishedCourses } from '../api/events.api';
import {
  buildEventRegistrationData,
  buildRegistrationLineItems,
  buildSelectedPricingLineItems,
  calculateQuantitiesTotal,
  createInitialQuantities,
  formatRegistrationPrice,
  mapApiEventToCard,
} from '../helpers/events.helper';
import { useApplication } from '../contexts/applicationContext';
import { useMemberRole } from '../hooks/useMemberRole';
import { useRegistrationPersonalInfoGate } from '../hooks/useRegistrationPersonalInfoGate';

const CourseRegistration = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { isMember } = useMemberRole();
  const {
    professionalDetail,
    subscriptionDetail,
    categoryData,
  } = useApplication();
  const [quantities, setQuantities] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  const membershipCategory =
    professionalDetail?.professionalDetails?.membershipCategory ||
    subscriptionDetail?.subscriptionDetails?.membershipCategory ||
    '';

  const {
    registrationStep,
    personalInfo,
    setPersonalInfo,
    showValidation,
    isSaving,
    handleRegisterClick,
    handlePersonalInfoContinue,
    handlePersonalInfoBack,
  } = useRegistrationPersonalInfoGate();

  const loadCourse = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchPublishedCourses();
      if (response?.status >= 200 && response?.status < 300) {
        const apiCourse = (response?.data?.data || []).find(
          item => String(item._id || item.id) === String(courseId),
        );
        const mappedCourse = mapApiEventToCard(apiCourse);
        const registrationData = buildEventRegistrationData(mappedCourse, {
          isMember,
          membershipCategory,
          categoryCode: categoryData?.code,
          categoryName: categoryData?.name,
        });
        setCourse(registrationData);
        setQuantities(
          createInitialQuantities(registrationData?.pricingOptions || []),
        );
      } else {
        setCourse(null);
        toast.error('Unable to load course details.');
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      setCourse(null);
      toast.error('Unable to load course details.');
    } finally {
      setLoading(false);
    }
  }, [courseId, isMember, membershipCategory, categoryData?.code, categoryData?.name]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const pricingOptions = course?.pricingOptions || [];

  const totalCost = useMemo(
    () => calculateQuantitiesTotal(pricingOptions, quantities),
    [pricingOptions, quantities],
  );

  const selectedLineItems = useMemo(
    () => buildSelectedPricingLineItems(pricingOptions, quantities),
    [pricingOptions, quantities],
  );

  const handleQuantityChange = (optionId, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [optionId]: quantity,
    }));
  };

  const handleRegisterAndPay = () => {
    if (!course || !selectedLineItems.length) {
      toast.error('Please select at least one ticket quantity.');
      return;
    }

    const selectedDays = selectedLineItems.map(item => ({
      id: item.id,
      title: item.title,
      date: course.date,
      price: item.price,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      tierType: item.tierType,
    }));

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleRegisterClick({
        source: 'course-registration',
        courseId: course.courseId || course.id,
        courseTitle: course.title,
        course,
        event: course,
        selectedDays,
        lineItems: buildRegistrationLineItems(pricingOptions, quantities),
        quantities,
        totalCost,
      });
    }, 450);
  };

  const canProceed = selectedLineItems.length > 0;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
        <Spinner />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Course Not Found</h1>
          <p className="mt-2 text-sm text-slate-600">
            This course is unavailable or has been removed.
          </p>
          <Button
            type="default"
            className="mt-4"
            onClick={() => navigate('/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (registrationStep === 'personal-info') {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Personal Information
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Please provide your details before completing registration for{' '}
            <span className="font-medium text-slate-800">{course.title}</span>.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <PersonalInformation
            formData={personalInfo}
            onFormDataChange={setPersonalInfo}
            showValidation={showValidation}
            showProfessionalFields
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="default"
            onClick={handlePersonalInfoBack}
            className="!h-11 !rounded-lg !px-5 !font-semibold">
            Back
          </Button>
          <Button
            type="primary"
            loading={isSaving}
            onClick={handlePersonalInfoContinue}
            className="!h-11 !rounded-lg !px-5 !font-semibold">
            Continue to Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {course.image ? (
          <div className="w-full bg-slate-100">
            <img
              src={course.image}
              alt={course.title}
              className="block h-auto w-full"
            />
          </div>
        ) : null}
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <p className="text-xs font-semibold tracking-wider text-blue-600">
            {course.category}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            {course.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{course.location}</p>
        </div>
        <div className="grid gap-4 border-t border-slate-100 p-4 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Venue</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{course.venue}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Credits</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{course.credits}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
          Pricing Options
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Set a quantity for each pricing option you want to register.
        </p>

        <RegistrationPricingOptions
          options={pricingOptions}
          quantities={quantities}
          onQuantityChange={handleQuantityChange}
          entityLabel="course"
        />
      </div>

      <div className="sticky bottom-4 z-10 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Total Cost
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {formatRegistrationPrice(totalCost)}
            </p>
          </div>
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={!canProceed}
            onClick={handleRegisterAndPay}
            className="!h-11 !rounded-lg !px-5 !font-semibold">
            Register & Pay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseRegistration;
