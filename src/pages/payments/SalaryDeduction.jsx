import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSelector } from 'react-redux';
import { useApplication } from '../../contexts/applicationContext';
import { useProfile } from '../../contexts/profileContext';
import { useLookup } from '../../contexts/lookupContext';
import { Input } from '../../components/ui/Input';
import { DatePicker } from '../../components/ui/DatePicker';
import { Select } from '../../components/ui/Select';
import SignaturePad from '../../components/common/SignaturePad';
import Button from '../../components/common/Button';
import SalaryDeductionPrintTemplate from './SalaryDeductionPrintTemplate';

const SalaryDeduction = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { personalDetail, professionalDetail, subscriptionDetail } = useApplication();
  const { profileDetail } = useProfile();
  const { workLocationLookups } = useLookup();
  const printRef = useRef(null);

  const [formState, setFormState] = useState({
    name: '',
    employedAt: '',
    inmoNo: '',
    payrollStaffNo: '',
    commencing: '',
    signature: null,
    date: '',
  });
  const [showValidation, setShowValidation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const monthlyDeductionAmount = '19.00';
  const mappedWorkLocations = (workLocationLookups || [])
    .map(item => item?.lookup?.DisplayName || item?.lookup?.lookupname || '')
    .filter(Boolean);
  const uniqueWorkLocations = Array.from(new Set(mappedWorkLocations));
  const workLocationOptions = uniqueWorkLocations.map(name => ({
    value: name,
    label: name,
  }));
  const employedAtOptions =
    formState.employedAt &&
    !workLocationOptions.some(
      option => option.value === formState.employedAt,
    )
      ? [{ value: formState.employedAt, label: formState.employedAt }, ...workLocationOptions]
      : workLocationOptions;

  useEffect(() => {
    const name =
      personalDetail?.personalInfo?.forename && personalDetail?.personalInfo?.surname
        ? `${personalDetail.personalInfo.forename} ${personalDetail.personalInfo.surname}`
        : user?.userFirstName && user?.userLastName
        ? `${user.userFirstName} ${user.userLastName}`
        : user?.userName || '';

    const inmoNo =
      profileDetail?.membershipNumber ||
      personalDetail?.personalInfo?.membershipNumber ||
      personalDetail?.membershipNumber ||
      personalDetail?.memberNumber ||
      '';

    const employedAt =
      professionalDetail?.professionalDetails?.workLocation ||
      professionalDetail?.workLocation ||
      '';

    const payrollStaffNo =
      subscriptionDetail?.subscriptionDetails?.payrollNo ||
      subscriptionDetail?.payrollNo ||
      '';

    setFormState(prev => ({
      ...prev,
      name,
      inmoNo: inmoNo ? String(inmoNo) : '',
      employedAt,
      payrollStaffNo: payrollStaffNo ? String(payrollStaffNo) : '',
    }));
  }, [personalDetail, professionalDetail, profileDetail, subscriptionDetail, user]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignatureChange = signature => {
    setFormState(prev => ({
      ...prev,
      signature,
    }));
  };

  const validateForm = () => {
    return (
      !!formState.name &&
      !!formState.employedAt &&
      !!formState.inmoNo &&
      !!formState.payrollStaffNo &&
      !!formState.commencing &&
      !!formState.signature &&
      !!formState.date
    );
  };

  const handleSave = () => {
    setShowValidation(true);
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log('Salary Deduction Data:', formState);
    alert('Salary Deduction form saved successfully!');
    navigate('/');
  };

  const handlePrint = async () => {
    if (!printRef.current || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    try {
      const printElement = printRef.current;
      const originalStyle = {
        visibility: printElement.style.visibility,
        position: printElement.style.position,
        left: printElement.style.left,
        top: printElement.style.top,
        opacity: printElement.style.opacity,
        zIndex: printElement.style.zIndex,
      };

      printElement.style.visibility = 'visible';
      printElement.style.position = 'fixed';
      printElement.style.left = '-9999px';
      printElement.style.top = '0';
      printElement.style.opacity = '1';
      printElement.style.zIndex = '-1';

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(printElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: printElement.scrollWidth,
        height: printElement.scrollHeight,
      });

      Object.keys(originalStyle).forEach(key => {
        if (originalStyle[key]) {
          printElement.style[key] = originalStyle[key];
        } else {
          printElement.style[key] = '';
        }
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Failed to capture content');
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('salary-deduction-form.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const isFormValid = validateForm();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Salary Deduction
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                Complete the payroll deduction authorization form
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div
            ref={printRef}
            className="fixed left-[-9999px] top-0 w-[210mm] bg-white p-8"
            style={{
              opacity: 0,
              visibility: 'hidden',
              zIndex: -1,
              pointerEvents: 'none',
            }}>
            <SalaryDeductionPrintTemplate
              formState={formState}
              monthlyDeductionAmount={monthlyDeductionAmount}
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Salary Deduction Authorization
              </h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Input
                label="Name"
                name="name"
                required
                value={formState.name}
                onChange={handleInputChange}
                showValidation={showValidation}
                placeholder="Block capitals"
              />

              <Select
                label="Employed At"
                name="employedAt"
                required
                value={formState.employedAt}
                onChange={handleInputChange}
                showValidation={showValidation}
                options={employedAtOptions}
                isSearchable
                placeholder="Select work location"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Org No"
                  name="inmoNo"
                  required
                  value={formState.inmoNo}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                />

                <Input
                  label="Payroll / Staff No"
                  name="payrollStaffNo"
                  required
                  value={formState.payrollStaffNo}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                />
              </div>

              <DatePicker
                label="Commencing"
                name="commencing"
                required
                value={formState.commencing}
                onChange={handleInputChange}
                showValidation={showValidation}
                disableAgeValidation={true}
              />

              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase mb-2">
                  Signature
                </h4>
                <SignaturePad
                  onSignatureChange={handleSignatureChange}
                  value={formState.signature}
                  required
                  showValidation={showValidation}
                />
              </div>

              <DatePicker
                label="Date"
                name="date"
                required
                value={formState.date}
                onChange={handleInputChange}
                showValidation={showValidation}
                disableAgeValidation={true}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 border-t border-gray-200">
            <Button
              type="default"
              onClick={handlePrint}
              loading={isGeneratingPDF}
              disabled={isGeneratingPDF}
              className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11">
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </Button>
            <Button
              type="default"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              disabled={!isFormValid}
              className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11">
              Save Authorization
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDeduction;
