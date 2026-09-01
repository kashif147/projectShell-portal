import React, { useMemo, useRef } from 'react';
import { Card, Tag, Empty } from 'antd';
import {
  FilePdfOutlined,
  DownloadOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  IdcardOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { useProfile } from '../contexts/profileContext';

const membershipCategoryLabels = {
  general: 'General (all grades)',
  postgraduate_student: 'Postgraduate Student',
  short_term_relief: 'Short-term/ Relief (under 15 hrs/wk average)',
  private_nursing_home: 'Private nursing home',
  affiliate_non_practicing: 'Affiliate members (non-practicing)',
  lecturing: 'Lecturing (employed in universities and IT institutes)',
  associate: 'Associate (not currently employed as a nurse/midwife)',
  retired_associate: 'Retired Associate',
  undergraduate_student: 'Undergraduate Student',
};

const Resources = () => {
  const { personalDetail, professionalDetail, subscriptionDetail } = useApplication();
  const { profileDetail } = useProfile();
  const hasApplication = Boolean(personalDetail && professionalDetail);

  const membershipCategory = hasApplication
    ? professionalDetail?.professionalDetails?.membershipCategory || 'general'
    : '';
  const memberName = hasApplication
    ? `${personalDetail?.personalInfo?.forename ?? ''} ${personalDetail?.personalInfo?.surname ?? ''}`.trim()
    : '';
  const membershipNumber = hasApplication
    ? profileDetail?.membershipNumber ||
      personalDetail?.ApplicationId ||
      personalDetail?.applicationId ||
      ''
    : '';
  const branch = hasApplication ? professionalDetail?.professionalDetails?.branch || '' : '';
  const section = hasApplication ? subscriptionDetail?.subscriptionDetails?.primarySection || '' : '';

  const cardRef = useRef(null);

  const educationalResources = useMemo(() => {
    if (!hasApplication) return [];

    const base = [
      {
        id: 'rb',
        title: 'Rule Book & Constitutional Guidelines',
        type: 'PDF',
        category: 'Governance',
        action: 'download-rule-book',
      },
    ];

    const byCategory = {
      general: [
        { id: 'g1', title: 'Clinical Safety Best Practices', type: 'PDF', category: 'Guidelines', action: 'download-pdf' },
        { id: 'g2', title: 'Professional Webinar: Patient Advocacy', type: 'Video', category: 'Webinar', url: 'https://example.com/webinar' },
        { id: 'g3', title: 'Continuing Education Portal', type: 'Link', category: 'CPD', url: 'https://example.com/education' },
      ],
      postgraduate_student: [
        { id: 'p1', title: 'Research Methods Starter Kit', type: 'PDF', category: 'Study' },
        { id: 'p2', title: 'Academic Integrity Tutorial', type: 'Link', category: 'Training', url: 'https://example.com/integrity' },
      ],
      retired_associate: [
        { id: 'r1', title: 'Retired Member Benefits', type: 'PDF', category: 'Benefits' },
        { id: 'r2', title: 'Volunteer Opportunities', type: 'Link', category: 'Community', url: 'https://example.com/volunteer' },
      ],
      undergraduate_student: [
        { id: 'u1', title: 'Clinical Placement Handbook', type: 'PDF', category: 'Handbook' },
        { id: 'u2', title: 'Medication Administration (Video)', type: 'Video', category: 'Skills', url: 'https://example.com/video' },
      ],
    };

    return [...base, ...(byCategory[membershipCategory] || [])];
  }, [hasApplication, membershipCategory]);

  const handleDownloadMembershipCard = async () => {
    if (!hasApplication) return;
    try {
      const mod = await import('../components/pdf/membershipCard');
      await mod.generateMembershipCardPDF({
        categoryLabel: membershipCategoryLabels[membershipCategory] || membershipCategory,
        memberName,
        membershipNumber: membershipNumber?.toString(),
        branch,
        section,
      });
    } catch {}
  };

  const handleDownloadRuleBook = async () => {
    if (!hasApplication) return;
    try {
      const mod = await import('../components/pdf/ruleBook');
      mod.generateRuleBookPDF({
        categoryLabel: membershipCategoryLabels[membershipCategory] || membershipCategory,
      });
    } catch {}
  };

  const handleResourceAction = item => {
    if (!hasApplication) return;
    if (item.action === 'download-rule-book') {
      handleDownloadRuleBook();
      return;
    }
    if (item.type === 'Link' && item.url) {
      window.open(item.url, '_blank');
      return;
    }
    if (item.type === 'Video' && item.url) {
      window.open(item.url, '_blank');
      return;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-100/50 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 text-lg">
              <BookOutlined />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
              Member Resources & Credentials
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Access your digital membership card, organizational rulebooks, educational material, and official documents.
          </p>
        </div>
      </div>

      {/* Digital Membership Card Preview */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 font-poppins">
            <IdcardOutlined className="text-blue-600 text-xl" />
            Digital Membership Card
          </h2>
          {hasApplication && (
            <Button
              type="primary"
              size="middle"
              icon={<DownloadOutlined />}
              onClick={handleDownloadMembershipCard}>
              Download Card PDF
            </Button>
          )}
        </div>

        {!hasApplication ? (
          <Empty description="No application data available" className="py-8" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Card Widget */}
            <div
              ref={cardRef}
              id="membership-card"
              className="w-full max-w-md rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 p-6 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/20 blur-xl" />
              <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-xl" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-blue-300">
                    Official Member Card
                  </p>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">
                    {membershipCategoryLabels[membershipCategory] || membershipCategory}
                  </p>
                </div>
                <SafetyCertificateOutlined className="text-2xl text-blue-400" />
              </div>

              <div className="space-y-3 relative z-10">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">
                    Cardholder
                  </p>
                  <p className="text-lg font-bold text-white tracking-tight">
                    {memberName || 'N/A'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Membership No
                    </p>
                    <p className="font-mono font-bold text-blue-200 mt-0.5">
                      {membershipNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Branch / Section
                    </p>
                    <p className="font-semibold text-slate-200 mt-0.5 truncate">
                      {branch || 'N/A'} / {section || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory text */}
            <div className="flex-1 space-y-3 text-sm text-slate-600">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/80">
                <p className="font-semibold text-blue-900 mb-1">
                  Official Proof of Membership
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Use this digital card for verification at seminars, regional branch meetings, and partner discounts. Download the PDF version for a printable copy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resources Library */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)]">
        <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-4 font-poppins">
          Document & Media Library
        </h2>

        {educationalResources.length === 0 ? (
          <Empty description="No resources available" className="py-8" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {educationalResources.map(item => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xl">
                    {item.type === 'PDF' ? (
                      <FilePdfOutlined className="text-rose-600" />
                    ) : item.type === 'Video' ? (
                      <PlayCircleOutlined className="text-purple-600" />
                    ) : (
                      <LinkOutlined className="text-blue-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="default"
                  size="small"
                  onClick={() => handleResourceAction(item)}
                  className="shrink-0">
                  {item.type === 'PDF' ? 'Download' : 'Open'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;