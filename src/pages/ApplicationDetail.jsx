import React from 'react';
import { Tag } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  IdcardOutlined,
  CreditCardOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { formatToDDMMYYYY } from '../helpers/date.helper';

const ApplicationDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const application = location.state?.application;

  if (!application) {
    return (
      <div className="px-1 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/application')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftOutlined />
          <span className="text-sm font-medium">Back to Applications</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileTextOutlined className="text-3xl sm:text-4xl text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Application Data</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              The application data could not be found or loaded.
            </p>
            <button
              onClick={() => navigate('/application')}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm sm:text-base">
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { personalDetail, professionalDetail, subscriptionDetail } =
    application;

  const getIconConfig = (type) => {
    const configs = {
      personal: {
        icon: <UserOutlined className="text-2xl" />,
        bgColor: 'from-blue-500 to-blue-600',
        lightBg: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-200',
      },
      professional: {
        icon: <IdcardOutlined className="text-2xl" />,
        bgColor: 'from-green-500 to-green-600',
        lightBg: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
      },
      subscription: {
        icon: <CreditCardOutlined className="text-2xl" />,
        bgColor: 'from-purple-500 to-purple-600',
        lightBg: 'from-purple-50 to-pink-50',
        borderColor: 'border-purple-200',
      },
    };
    return configs[type] || configs.personal;
  };

  const renderSection = (title, data, type) => {
    if (!data || Object.keys(data).length === 0) return null;

    const nonNullData = Object.entries(data).filter(
      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        value !== false,
    );

    if (nonNullData.length === 0) return null;

    const config = getIconConfig(type);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
        {/* Section Header */}
        <div className={`bg-gradient-to-r ${config.lightBg} px-3 sm:px-6 py-3 sm:py-4 border-b ${config.borderColor}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${config.bgColor} rounded-lg flex items-center justify-center shadow-md`}>
              {React.cloneElement(config.icon, { className: 'text-white text-lg sm:text-xl' })}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Section Body */}
        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {nonNullData.map(([key, value]) => (
              <div key={key} className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, s => s.toUpperCase())}
                </p>
                <div className="text-sm font-semibold text-gray-900">
                  {typeof value === 'boolean' ? (
                    <Tag
                      color={value ? 'success' : 'error'}
                      className="px-2 py-1 text-xs font-medium rounded-md">
                      {value ? 'Yes' : 'No'}
                    </Tag>
                  ) : typeof value === 'string' && value.includes('_') ? (
                    <span className="capitalize">
                      {value
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ) : (
                    <span>{String(value)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const formatPersonalInfo = () => {
    const personalInfo = personalDetail?.personalInfo || {};
    const contactInfo = personalDetail?.contactInfo || {};

    return { ...personalInfo, ...contactInfo };
  };

  const formatProfessionalInfo = () => {
    const professionalInfo = professionalDetail?.professionalDetails || {};
    return {
      ...professionalInfo,
    };
  };

  const formatSubscriptionInfo = () => {
    return subscriptionDetail?.subscriptionDetails || {};
  };

  const hasAnyData = () => {
    const personalInfo = formatPersonalInfo();
    const professionalInfo = formatProfessionalInfo();
    const subscriptionInfo = formatSubscriptionInfo();

    return (
      Object.keys(personalInfo).length > 0 ||
      Object.keys(professionalInfo).length > 0 ||
      Object.keys(subscriptionInfo).length > 0
    );
  };

  return (
    <div className="px-1 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/application')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group">
        <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Applications</span>
      </button>

      {/* Header */}
      {/* <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
            <FileTextOutlined className="text-2xl sm:text-3xl text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Application Details</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Complete overview of your membership application
            </p>
          </div>
        </div>
      </div> */}

      {/* Application Overview Card */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-3 sm:p-6 border border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <FileTextOutlined className="text-white text-lg sm:text-xl" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Application #{application?.id || 'N/A'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {application?.submissionDate 
                  ? `Submitted on ${formatToDDMMYYYY(application.submissionDate)}`
                  : 'Not yet submitted'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {personalDetail && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Personal
              </div>
            )}
            {professionalDetail && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Professional
              </div>
            )}
            {subscriptionDetail && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Subscription
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Data Sections */}
      {hasAnyData() ? (
        <div className="space-y-4 sm:space-y-6">
          {renderSection(
            'Personal Information',
            formatPersonalInfo(),
            'personal',
          )}

          {renderSection(
            'Professional Information',
            formatProfessionalInfo(),
            'professional',
          )}

          {renderSection(
            'Subscription Information',
            formatSubscriptionInfo(),
            'subscription',
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileTextOutlined className="text-3xl sm:text-4xl text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              No application data available to display at this time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;
