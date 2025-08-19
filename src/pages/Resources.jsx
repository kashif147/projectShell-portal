import React, { useMemo, useRef } from 'react';
import { Card, List, Button, Tag, Space, Empty } from 'antd';
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
    <div className="space-y-6">
      <Card title="Membership Card">
        {!hasApplication ? (
          <Empty description="No application data" />
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div ref={cardRef} id="membership-card" className="border rounded-lg p-4 w-full md:w-2/3 bg-white">
              <div className="text-center mb-2">
                <div className="text-xl font-bold">MEMBERSHIP CARD</div>
                <div className="text-sm text-gray-500">{membershipCategoryLabels[membershipCategory] || membershipCategory}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="font-semibold text-gray-600">Name</div>
                <div className="text-gray-800">{memberName}</div>
                <div className="font-semibold text-gray-600">Membership Number</div>
                <div className="text-gray-800">{membershipNumber}</div>
                <div className="font-semibold text-gray-600">Branch</div>
                <div className="text-gray-800">{branch}</div>
                <div className="font-semibold text-gray-600">Section</div>
                <div className="text-gray-800">{section}</div>
              </div>
              <div className="mt-4 text-right text-xs text-gray-500">Digital Card Preview</div>
            </div>
            <Space>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadMembershipCard}>
                Download PDF
              </Button>
            </Space>
          </div>
        )}
      </Card>

      <Card title="Resources Library">
        <List
          dataSource={educationalResources}
          locale={{ emptyText: <Empty description="No resources" /> }}
          renderItem={item => (
            <List.Item
              actions={[
                <Button key="action" type="primary" icon={
                  item.type === 'PDF' ? <DownloadOutlined /> : item.type === 'Video' ? <PlayCircleOutlined /> : <LinkOutlined />
                } onClick={() => handleResourceAction(item)}>
                  {item.type === 'PDF' ? 'Download' : 'Open'}
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileOutlined style={{ fontSize: 24 }} />}
                title={item.title}
                description={
                  <>
                    <Tag color="blue">{item.category}</Tag>
                    <Tag color={item.type === 'PDF' ? 'green' : item.type === 'Video' ? 'purple' : 'geekblue'}>{item.type}</Tag>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Resources; 