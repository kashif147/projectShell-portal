import React, { useMemo, useEffect, useState } from 'react';
import { Card, Table, Empty, Tag, Spin } from 'antd';
import { useProfile } from '../contexts/profileContext';
import { useLookup } from '../contexts/lookupContext';
import { useApplication } from '../contexts/applicationContext';
import { formatToDDMMYYYY } from '../helpers/date.helper';
import { getSubscriptionRequest } from '../api/subscription.api';

const Subscriptions = () => {
  const {
    personalDetail,
    professionalDetail,
  } = useApplication();
  const { profileDetail } = useProfile();
  const { categoryLookups } = useLookup();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  useEffect(() => {
    const profileId = profileDetail?.profileId;
    if (!profileId) return;

    setLoadingSubscriptions(true);
    getSubscriptionRequest(profileId)
      .then(res => {
        const items = res?.data?.data?.data || res?.data?.data || [];
        setSubscriptions(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        setSubscriptions([]);
      })
      .finally(() => {
        setLoadingSubscriptions(false);
      });
  }, [profileDetail?.profileId]);

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
    const membershipNo = profileDetail?.membershipNumber ?? 'N/A';

    const nameRaw = `${personalDetail?.personalInfo?.forename ?? ''} ${
      personalDetail?.personalInfo?.surname ?? ''
    }`.trim();
    const name = nameRaw || 'N/A';

    return subscriptions.map((sub, index) => {
      const category = sub?.membershipCategory
        ? getMembershipCategoryLabel(sub?.membershipCategory)
        : 'N/A';

      const subscriptionStartDate = sub?.startDate
        ? formatToDDMMYYYY(sub?.startDate)
        : 'N/A';

      const subscriptionStatus = sub?.subscriptionStatus ?? 'N/A';

      const section =
        sub?.primarySection ||
        sub?.section ||
        professionalDetail?.professionalDetails?.primarySection ||
        'N/A';

      const branch =
        sub?.branch || professionalDetail?.professionalDetails?.branch || 'N/A';

      return {
        key: sub?._id || sub?.id || index,
        membershipNo,
        name,
        category,
        subscriptionStartDate,
        subscriptionStatus,
        section,
        branch,
      };
    });
  }, [subscriptions, profileDetail, personalDetail, professionalDetail, categoryLookups]);

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
      title: 'Subscription Start Date',
      dataIndex: 'subscriptionStartDate',
      key: 'subscriptionStartDate',
    },
    {
      title: 'Subscription Status',
      dataIndex: 'subscriptionStatus',
      key: 'subscriptionStatus',
      render: subscriptionStatusValue => {
        const status = String(subscriptionStatusValue || '').toLowerCase();

        let color = 'default';
        if (status.includes('active')) color = 'green';
        else if (status.includes('pending') || status.includes('in review'))
          color = 'gold';
        else if (status.includes('cancel')) color = 'red';

        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {subscriptionStatusValue || 'N/A'}
          </Tag>
        );
      },
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
        {loadingSubscriptions ? (
          <div className="py-12 flex items-center justify-center">
            <Spin />
          </div>
        ) : subscriptions.length === 0 ? (
          <Empty
            description="No subscriptions found."
            className="py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            rowKey="key"
          />
        )}
      </Card>
    </div>
  );
};

export default Subscriptions; 