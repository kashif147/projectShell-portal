import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import PersonalInformation from '../components/application/PersonalInformation';
import RegistrationPricingOptions from '../components/events/RegistrationPricingOptions';
import { fetchPublishedEvents } from '../api/events.api';
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

const EventRegistration = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { isMember } = useMemberRole();
  const {
    professionalDetail,
    subscriptionDetail,
    categoryData,
  } = useApplication();
  const [quantities, setQuantities] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

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

  const loadEvent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchPublishedEvents();
      if (response?.status >= 200 && response?.status < 300) {
        const apiEvent = (response?.data?.data || []).find(
          item => String(item._id) === String(eventId),
        );
        const mappedEvent = mapApiEventToCard(apiEvent);
        const registrationData = buildEventRegistrationData(mappedEvent, {
          isMember,
          membershipCategory,
          categoryCode: categoryData?.code,
          categoryName: categoryData?.name,
        });
        setEvent(registrationData);
        setQuantities(
          createInitialQuantities(registrationData?.pricingOptions || []),
        );
      } else {
        setEvent(null);
        toast.error('Unable to load event details.');
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      setEvent(null);
      toast.error('Unable to load event details.');
    } finally {
      setLoading(false);
    }
  }, [eventId, isMember, membershipCategory, categoryData?.code, categoryData?.name]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const pricingOptions = event?.pricingOptions || [];

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
    if (!event || !selectedLineItems.length) {
      toast.error('Please select at least one ticket quantity.');
      return;
    }

    const selectedDays = selectedLineItems.map(item => ({
      id: item.id,
      title: item.title,
      date: event.date,
      price: item.price,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      tierType: item.tierType,
    }));

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleRegisterClick({
        source: 'event-registration',
        eventId: event.id,
        eventTitle: event.title,
        event,
        selectedDays,
        lineItems: buildRegistrationLineItems(pricingOptions, quantities),
        quantities,
        totalCost,
      });
    } catch (err) {
      message.error(err?.response?.data?.error?.message || err?.message || 'Failed to register');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const canProceed = selectedLineItems.length > 0;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
        <Spinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Event Not Found</h1>
          <p className="mt-2 text-sm text-slate-600">
            This event is unavailable or has been removed.
          </p>
          <Button
            type="default"
            className="mt-4"
            onClick={() => navigate('/events')}>
            Back to Events
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
            <span className="font-medium text-slate-800">{event.title}</span>.
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
        {event.image ? (
          <div className="w-full bg-slate-100">
            <img
              src={event.image}
              alt={event.title}
              className="block h-auto w-full"
            />
          </div>
        ) : null}
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <p className="text-xs font-semibold tracking-wider text-blue-600">
            {event.category}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            {event.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{event.location}</p>
        </div>
        <div className="grid gap-4 border-t border-slate-100 p-4 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Venue</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{event.venue}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Credits</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{event.credits}</p>
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
          entityLabel="event"
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

export default EventRegistration;
