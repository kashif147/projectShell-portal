import React, { useMemo } from 'react';
import { Card, Table, Empty } from 'antd';
import { useApplication } from '../contexts/applicationContext';

const membershipCategoryOptions = [
  { value: 'general', label: 'General (all grades)' },
  { value: 'postgraduate_student', label: 'Postgraduate Student' },
  { value: 'short_term_relief', label: 'Short-term/ Relief (under 15 hrs/wk average)' },
  { value: 'private_nursing_home', label: 'Private nursing home' },
  { value: 'affiliate_non_practicing', label: 'Affiliate members (non-practicing)' },
  { value: 'lecturing', label: 'Lecturing (employed in universities and IT institutes)' },
  { value: 'associate', label: 'Associate (not currently employed as a nurse/midwife)' },
  { value: 'retired_associate', label: 'Retired Associate' },
  { value: 'undergraduate_student', label: 'Undergraduate Student' },
];

const Subscriptions = () => {
  const { personalDetail, professionalDetail } = useApplication();

  const hasApplication = Boolean(personalDetail || professionalDetail);

  const getMembershipCategoryLabel = value => {
    const option = membershipCategoryOptions.find(opt => opt.value === value);
    return option ? option.label : 'N/A';
  };

  const dataSource = useMemo(() => {
    const membershipNo = personalDetail?.ApplicationId ?? 'N/A';
    const nameRaw = `${personalDetail?.personalInfo?.forename ?? ''} ${personalDetail?.personalInfo?.surname ?? ''}`.trim();
    const name = nameRaw || 'N/A';
    const category = getMembershipCategoryLabel(
      professionalDetail?.professionalDetails?.membershipCategory,
    );
    const section = professionalDetail?.professionalDetails?.section ?? 'N/A';
    const branch = professionalDetail?.professionalDetails?.branch ?? 'N/A';

    return [
      {
        key: 1,
        membershipNo,
        name,
        category,
        section,
        branch,
      },
    ];
  }, [personalDetail, professionalDetail]);

  const columns = [
    {
      title: 'Membership No',
      dataIndex: 'membershipNo',
      key: 'membershipNo',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Membership Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
    },
  ];

  return (
    <div>
      <Card title="Subscription Details">
        {!hasApplication ? (
          <Empty
            description="No application data found."
            className="py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table dataSource={dataSource} columns={columns} pagination={false} rowKey="key" />
        )}
      </Card>
    </div>
  );
};

export default Subscriptions; 