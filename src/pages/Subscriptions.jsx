import React, { useMemo, useEffect, useState } from 'react';
import { Card, Table, Empty, Tag, Spin } from 'antd';
import {
  CreditCardOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useProfile } from '../contexts/profileContext';
import { useLookup } from '../contexts/lookupContext';
import { useApplication } from '../contexts/applicationContext';
import { formatToDDMMYYYY } from '../helpers/date.helper';
import { getSubscriptionRequest } from '../api/subscription.api';

const Subscriptions = () => {
  const { personalDetail, professionalDetail } = useApplication();
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

    let category =
      categoryLookups?.find(
        cat => cat?._id === categoryIdOrName || cat?.id === categoryIdOrName,
      ) || null;

    if (!category && Array.isArray(categoryLookups)) {
      category =
        categoryLookups.find(item => {
          const itemName =
            item?.name ||
            item?.DisplayName ||
            item?.label ||
            item?.productType?.name ||
            item?.code;
          return String(itemName || '') === String(categoryIdOrName);
        }) || null;
    }

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
  }, [
    subscriptions,
    profileDetail,
    personalDetail,
    professionalDetail,
    categoryLookups,
  ]);

  const columns = [
    {
      title: 'Membership No',
      dataIndex: 'membershipNo',
      key: 'membershipNo',
      render: val => <span className="font-semibold text-slate-800">{val}</span>,
    },
    {
      title: 'Member Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Membership Category',
      dataIndex: 'category',
      key: 'category',
      render: val => (
        <span className="font-medium text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
          {val}
        </span>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'subscriptionStartDate',
      key: 'subscriptionStartDate',
      render: val => (
        <span className="text-slate-600 font-medium">{val}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'subscriptionStatus',
      key: 'subscriptionStatus',
      render: subscriptionStatusValue => {
        const status = String(subscriptionStatusValue || '').toLowerCase();

        let color = 'default';
        if (status.includes('active')) color = 'success';
        else if (status.includes('pending') || status.includes('in review'))
          color = 'warning';
        else if (
          status.includes('cancel') ||
          status.includes('rejected') ||
          status.includes('resigned')
        )
          color = 'error';

        return (
          <Tag color={color} className="font-semibold px-2.5 py-0.5 capitalize text-xs rounded-full">
            {subscriptionStatusValue || 'N/A'}
          </Tag>
        );
      },
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: val => <span className="text-slate-600">{val}</span>,
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
      render: val => <span className="text-slate-600">{val}</span>,
    },
  ];

  const activeSubCount = dataSource.filter(d =>
    String(d.subscriptionStatus).toLowerCase().includes('active'),
  ).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <CreditCardOutlined />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Subscriptions
              </p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {dataSource.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <CheckCircleOutlined />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Status
              </p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">
                {activeSubCount > 0 ? `${activeSubCount} Active` : 'None Active'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
              <ApartmentOutlined />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Primary Category
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate max-w-[180px]">
                {dataSource[0]?.category || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="font-poppins text-lg font-bold text-slate-900">
              Subscription Records
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {dataSource.length} total
            </span>
          </div>
        }
        className="overflow-hidden border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)]">
        {loadingSubscriptions ? (
          <div className="py-16 flex items-center justify-center">
            <Spin size="large" />
          </div>
        ) : subscriptions.length === 0 ? (
          <Empty
            description="No subscriptions found."
            className="py-16"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                rowKey="key"
                className="w-full"
              />
            </div>

            {/* Mobile Stacked Card View */}
            <div className="block sm:hidden space-y-3 p-1">
              {dataSource.map(item => (
                <div
                  key={item.key}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      ID: {item.membershipNo}
                    </span>
                    <Tag
                      color={
                        String(item.subscriptionStatus).toLowerCase().includes('active')
                          ? 'success'
                          : 'default'
                      }
                      className="font-semibold px-2 py-0.5 rounded-full text-xs">
                      {item.subscriptionStatus}
                    </Tag>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Category
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {item.category}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-500">Start Date:</span>{' '}
                      <span className="font-semibold text-slate-700">
                        {item.subscriptionStartDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Section:</span>{' '}
                      <span className="font-semibold text-slate-700">
                        {item.section}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Subscriptions;