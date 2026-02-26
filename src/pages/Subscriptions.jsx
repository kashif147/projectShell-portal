import React, { useMemo, useEffect } from 'react';
import { Card, Table, Empty } from 'antd';
import { useApplication } from '../contexts/applicationContext';
import { useProfile } from '../contexts/profileContext';
import { useLookup } from '../contexts/lookupContext';

const Subscriptions = () => {
  const {
    personalDetail,
    professionalDetail,
    subscriptionDetail,
    categoryData,
    getCategoryData,
  } = useApplication();
  const { profileDetail } = useProfile();
  const { categoryLookups } = useLookup();

  const hasApplication = Boolean(
    personalDetail || professionalDetail || subscriptionDetail,
  );

  useEffect(() => {
    const membershipCategoryId =
      subscriptionDetail?.subscriptionDetails?.membershipCategory ||
      professionalDetail?.professionalDetails?.membershipCategory;

    if (membershipCategoryId) {
      getCategoryData(membershipCategoryId, categoryLookups || []);
    }
  }, [
    subscriptionDetail?.subscriptionDetails?.membershipCategory,
    professionalDetail?.professionalDetails?.membershipCategory,
    getCategoryData,
    categoryLookups,
  ]);

  const getMembershipCategoryLabel = categoryIdOrName => {
    if (!categoryIdOrName) return 'N/A';

    // First try to match by id/_id like Payments page
    let category =
      categoryLookups?.find(
        cat => cat?._id === categoryIdOrName || cat?.id === categoryIdOrName,
      ) || null;

    // If not found, try to match by name/label (handles when value is already a name)
    if (!category && Array.isArray(categoryLookups)) {
      category = categoryLookups.find(item => {
        const itemName =
          item?.name ||
          item?.DisplayName ||
          item?.label ||
          item?.productType?.name ||
          item?.code;
        return String(itemName || '') === String(categoryIdOrName);
      }) || null;
    }

    // Fallback to raw value so we never show N/A if a value exists
    return category?.name || categoryIdOrName || 'N/A';
  };

  const dataSource = useMemo(() => {
    const membershipNo =
      profileDetail?.membershipNumber ??
      personalDetail?.ApplicationId ??
      personalDetail?.applicationId ??
      'N/A';

    const nameRaw = `${personalDetail?.personalInfo?.forename ?? ''} ${
      personalDetail?.personalInfo?.surname ?? ''
    }`.trim();
    const name = nameRaw || 'N/A';
    const membershipCategoryId =
      professionalDetail?.professionalDetails?.membershipCategory ||
      subscriptionDetail?.subscriptionDetails?.membershipCategory;
    const category =
      categoryData?.name || getMembershipCategoryLabel(membershipCategoryId);
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
  }, [
    personalDetail,
    professionalDetail,
    subscriptionDetail,
    profileDetail,
    categoryLookups,
    categoryData,
  ]);

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