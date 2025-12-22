import React, { useMemo, useRef } from 'react';
import { Card, Button, Tag, Empty } from 'antd';
import { FileOutlined, DownloadOutlined, LinkOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useApplication } from '../contexts/applicationContext';

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
  const { personalDetail, professionalDetail } = useApplication();
  const hasApplication = Boolean(personalDetail && professionalDetail);

  const membershipCategory = hasApplication
    ? professionalDetail?.professionalDetails?.membershipCategory || 'general'
    : '';
  const memberName = hasApplication
    ? `${personalDetail?.personalInfo?.forename ?? ''} ${personalDetail?.personalInfo?.surname ?? ''}`.trim()
    : '';
  const membershipNumber = hasApplication ? personalDetail?.ApplicationId || '' : '';
  const branch = hasApplication ? professionalDetail?.professionalDetails?.branch || '' : '';
  const section = hasApplication ? professionalDetail?.professionalDetails?.section || '' : '';

  const cardRef = useRef(null);

  const educationalResources = useMemo(() => {
    if (!hasApplication) return [];

    const base = [
      {
        id: 'rb',
        title: 'Rule Book',
        type: 'PDF',
        category: 'Links',
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Membership Card Section */}
        <Card 
          title={<span className="text-lg sm:text-xl font-bold">Membership Card</span>}
          className="shadow-sm"
          bodyStyle={{ padding: '16px' }}
        >
          {!hasApplication ? (
            <Empty description="No application data" />
          ) : (
            <div className="flex flex-col gap-4">
              <div ref={cardRef} id="membership-card" className="border-2 border-blue-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-white to-blue-50 shadow-sm">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">MEMBERSHIP CARD</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">{membershipCategoryLabels[membershipCategory] || membershipCategory}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="font-semibold text-gray-600 py-1">Name</div>
                  <div className="text-gray-800 py-1 break-words">{memberName || 'N/A'}</div>
                  <div className="font-semibold text-gray-600 py-1">Membership Number</div>
                  <div className="text-gray-800 py-1 break-words">{membershipNumber || 'N/A'}</div>
                  <div className="font-semibold text-gray-600 py-1">Branch</div>
                  <div className="text-gray-800 py-1 break-words">{branch || 'N/A'}</div>
                  <div className="font-semibold text-gray-600 py-1">Section</div>
                  <div className="text-gray-800 py-1 break-words">{section || 'N/A'}</div>
                </div>
                <div className="mt-4 sm:mt-5 text-center sm:text-right text-xs text-gray-500">Digital Card Preview</div>
              </div>
              <div className="flex justify-center sm:justify-start">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<DownloadOutlined />} 
                  onClick={handleDownloadMembershipCard}
                  className="w-full sm:w-auto touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Resources Library Section */}
        <Card 
          title={<span className="text-lg sm:text-xl font-bold">Resources Library</span>}
          className="shadow-sm"
          bodyStyle={{ padding: '16px' }}
        >
          {educationalResources.length === 0 ? (
            <Empty description="No resources available" />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {educationalResources.map(item => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-300 active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <FileOutlined className="text-lg sm:text-xl text-blue-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 break-words">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                        <Tag color="blue" className="text-xs sm:text-sm m-0">
                          {item.category}
                        </Tag>
                        <Tag 
                          color={item.type === 'PDF' ? 'green' : item.type === 'Video' ? 'purple' : 'geekblue'}
                          className="text-xs sm:text-sm m-0"
                        >
                          {item.type}
                        </Tag>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        type="primary"
                        size="small"
                        icon={
                          item.type === 'PDF' ? <DownloadOutlined /> : 
                          item.type === 'Video' ? <PlayCircleOutlined /> : 
                          <LinkOutlined />
                        }
                        onClick={() => handleResourceAction(item)}
                        className="touch-manipulation"
                        style={{ minHeight: '36px', minWidth: '80px' }}
                      >
                        <span className="hidden sm:inline">
                          {item.type === 'PDF' ? 'Download' : 'Open'}
                        </span>
                        <span className="sm:hidden">
                          {item.type === 'PDF' ? 'DL' : 'Open'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Resources; 