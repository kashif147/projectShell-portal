import { useCallback, useEffect, useState } from 'react';
import {
  createPortalPaymentForm,
  getMyPortalPaymentForms,
  getPortalPaymentForm,
  submitPortalPaymentForm,
  updatePortalPaymentForm,
  uploadPortalPaymentSignature,
} from '../api/paymentForms.api';
import {
  extractMyPortalPaymentForms,
  extractPortalPaymentForm,
  extractPortalFormId,
  getLatestPortalPaymentFormByType,
  getPaymentApiErrorMessage,
  getPortalFormId,
  isPaymentApiSuccess,
  portalFormHasExistingRecord,
  shouldRetryCreateAsPatch,
} from '../helpers/paymentForm.helper';

const usePortalPaymentForm = (formType, { seedPortalForm = null } = {}) => {
  const [portalForm, setPortalForm] = useState(seedPortalForm);
  const [loading, setLoading] = useState(!seedPortalForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (seedPortalForm) {
      setPortalForm(seedPortalForm);
      setLoading(false);
    }
  }, [seedPortalForm]);

  const loadPortalForm = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const mineResponse = await getMyPortalPaymentForms();
      if (isPaymentApiSuccess(mineResponse)) {
        const forms = extractMyPortalPaymentForms(mineResponse);
        const existingForm = getLatestPortalPaymentFormByType(forms, formType);
        if (existingForm) {
          setPortalForm(existingForm);
          return existingForm;
        }
      }

      const response = await getPortalPaymentForm();
      if (isPaymentApiSuccess(response)) {
        const data = extractPortalPaymentForm(response);
        setPortalForm(data);
        return data;
      }
      setPortalForm(null);
      return null;
    } catch (error) {
      console.error('Failed to load portal payment form:', error);
      setPortalForm(null);
      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [formType]);

  useEffect(() => {
    if (seedPortalForm) {
      return;
    }
    loadPortalForm();
  }, [loadPortalForm, formType, seedPortalForm]);

  /** Step 1: POST create or PATCH update — returns form _id */
  const persistPortalForm = useCallback(
    async ({ createPayload, patchPayload }) => {
      const hasExisting = portalFormHasExistingRecord(portalForm, formType);
      const existingFormId = getPortalFormId(portalForm);
      let usedPatch = hasExisting;

      let response = hasExisting
        ? await updatePortalPaymentForm(existingFormId, patchPayload)
        : await createPortalPaymentForm(createPayload);

      if (
        !hasExisting &&
        existingFormId &&
        !isPaymentApiSuccess(response) &&
        shouldRetryCreateAsPatch(response)
      ) {
        usedPatch = true;
        response = await updatePortalPaymentForm(existingFormId, patchPayload);
      }

      if (!isPaymentApiSuccess(response)) {
        throw new Error(
          getPaymentApiErrorMessage(
            response,
            usedPatch
              ? 'Failed to update payment form. Please try again.'
              : 'Failed to create payment form. Please try again.',
          ),
        );
      }

      let savedForm = extractPortalPaymentForm(response);
      let formId = extractPortalFormId(response) ?? getPortalFormId(savedForm);

      if (!formId) {
        const reloaded = await loadPortalForm({ silent: true });
        savedForm = reloaded ?? savedForm;
        formId = getPortalFormId(savedForm);
      }

      if (!formId) {
        formId = getPortalFormId(portalForm);
      }

      if (savedForm) {
        setPortalForm(savedForm);
      }

      if (!formId) {
        throw new Error(
          'Payment form was saved but no form id was returned. Please refresh and try again.',
        );
      }

      return { formId, savedForm };
    },
    [formType, loadPortalForm, portalForm],
  );

  /** Step 2: upload signature(s) with form _id */
  const uploadSignatures = useCallback(async (signatures, formId) => {
    const id = formId ?? getPortalFormId(portalForm);
    if (!id) {
      throw new Error(
        'Payment form id is required to upload signature. Save the form first.',
      );
    }

    const uploads = (signatures || []).filter(item => item?.imageBase64);

    for (const item of uploads) {
      const response = await uploadPortalPaymentSignature(id, {
        imageBase64: item.imageBase64,
        slot: item.slot ?? 0,
        signedDate: item.signedDate,
      });

      if (!isPaymentApiSuccess(response)) {
        throw new Error(
          getPaymentApiErrorMessage(
            response,
            'Failed to upload signature. Please try again.',
          ),
        );
      }
    }
  }, [portalForm]);

  /** Step 3: submit with form _id */
  const submitPortalForm = useCallback(async formId => {
    const id = formId ?? getPortalFormId(portalForm);
    if (!id) {
      throw new Error(
        'Payment form id is required to submit. Complete steps 1 and 2 first.',
      );
    }

    const response = await submitPortalPaymentForm(id);
    if (!isPaymentApiSuccess(response)) {
      throw new Error(
        getPaymentApiErrorMessage(
          response,
          'Failed to submit payment form. Please try again.',
        ),
      );
    }
    return response;
  }, [portalForm]);

  const persistAndSubmit = useCallback(
    async ({ createPayload, patchPayload, signatures = [] }) => {
      setSaving(true);
      try {
        const { formId } = await persistPortalForm({ createPayload, patchPayload });
        await uploadSignatures(signatures, formId);
        await submitPortalForm(formId);
        return { formId };
      } finally {
        setSaving(false);
      }
    },
    [persistPortalForm, submitPortalForm, uploadSignatures],
  );

  return {
    portalForm,
    loading,
    saving,
    loadPortalForm,
    persistPortalForm,
    uploadSignatures,
    submitPortalForm,
    persistAndSubmit,
  };
};

export default usePortalPaymentForm;
