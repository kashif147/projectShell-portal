import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { BellOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseOutlined } from '@ant-design/icons';
import { Pagination } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import { fetchNotiticationRequest, readNotificationRequest } from '../api/notification.api';
import { useNotification } from '../contexts/notificationContext';
import Spinner from '../components/common/Spinner';

const Notifications = () => {
  const auth = useSelector(state => state.auth);
  const { setUnreadCountValue } = useNotification();
  
  // Get userId and tenantId from Redux auth state
  const user = auth.user || auth.userDetail;
  const userId = user?.id || user?._id || auth.userDetail?.id || auth.userDetail?._id;
  const tenantId = user?.tenantId || user?.userTenantId || auth.userDetail?.tenantId || auth.userDetail?.userTenantId;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, payment, subscription, unread
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  // Format relative time helper
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    const date = moment(dateString);
    if (!date.isValid()) return 'Unknown time';
    return date.fromNow();
  };

  // Transform API notification to component format
  const transformNotification = (apiNotification) => {
    return {
      id: apiNotification._id,
      title: apiNotification.title || 'Notification',
      message: apiNotification.body || '',
      read: apiNotification.isRead || false,
      time: formatRelativeTime(apiNotification.sentAt || apiNotification.createdAt),
      type: 'general', // Default type, can be enhanced later
      icon: 'info', // Default icon, can be enhanced later
      color: 'blue', // Default color, can be enhanced later
      sentAt: apiNotification.sentAt || apiNotification.createdAt,
    };
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId || !tenantId) {
      console.warn('UserId or TenantId not available');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchNotiticationRequest({
        page: currentPage,
        limit: pageSize,
      });

      if (response?.status === 200 && response?.data?.success) {
        const data = response.data.data;
        const notificationsList = (data.notifications || []).map(transformNotification);
        
        setNotifications(notificationsList);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setUnreadCount(data.unreadCount || 0);
        
        // Sync with NotificationContext
        if (setUnreadCountValue) {
          setUnreadCountValue(data.unreadCount || 0);
        }
      } else {
        toast.error(response?.data?.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, userId, tenantId, setUnreadCountValue]);

  // Fetch notifications on mount and when pagination changes
  useEffect(() => {
    if (userId && tenantId) {
      fetchNotifications();
    }
  }, [fetchNotifications, userId, tenantId]);

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'success':
        return <CheckCircleOutlined className="text-xl sm:text-2xl" />;
      case 'warning':
        return <WarningOutlined className="text-xl sm:text-2xl" />;
      case 'info':
      default:
        return <InfoCircleOutlined className="text-xl sm:text-2xl" />;
    }
  };

  const getIconBgColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-700',
    };
    return colors[color] || colors.blue;
  };

  // Mark single notification as read
  const markAsRead = async (id) => {
    if (!userId || !tenantId || markingAsRead) return;

    // Optimistic update
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    setMarkingAsRead(true);
    try {
      const response = await readNotificationRequest({
        notificationIds: [id],
        userId,
        tenantId,
      });

      if (response?.status === 200 && response?.data?.success) {
        // Refresh notifications to get latest state
        await fetchNotifications();
      } else {
        // Revert optimistic update on error
        await fetchNotifications();
        toast.error(response?.data?.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      await fetchNotifications();
      toast.error('Failed to mark notification as read. Please try again.');
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Mark all unread notifications as read
  const markAllAsRead = async () => {
    if (!userId || !tenantId || markingAsRead) return;

    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic update
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);

    setMarkingAsRead(true);
    try {
      const response = await readNotificationRequest({
        notificationIds: unreadIds,
        userId,
        tenantId,
      });

      if (response?.status === 200 && response?.data?.success) {
        // Refresh notifications to get latest state
        await fetchNotifications();
      } else {
        // Revert optimistic update on error
        await fetchNotifications();
        toast.error(response?.data?.message || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      await fetchNotifications();
      toast.error('Failed to mark all notifications as read. Please try again.');
    } finally {
      setMarkingAsRead(false);
    }
  };

  const deleteNotification = (id) => {
    // Note: Delete functionality not in API, keeping for UI consistency
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @media (max-width: 640px) {
          .filter-tabs-scroll::-webkit-scrollbar {
            display: none;
          }
          .filter-tabs-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <BellOutlined className="text-2xl sm:text-3xl text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  {loading ? 'Loading...' : unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && !loading && (
              <button
                onClick={markAllAsRead}
                disabled={markingAsRead}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed">
                {markingAsRead ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl p-1.5 sm:p-2 shadow-sm border border-gray-200 overflow-x-auto filter-tabs-scroll">
            <div className="flex gap-1.5 sm:gap-2 min-w-max sm:min-w-0">
              <button
                onClick={() => setFilter('all')}
                disabled={loading}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation disabled:opacity-50 ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                }`}>
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                disabled={loading}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation disabled:opacity-50 ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                }`}>
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('payment')}
                disabled={loading}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation disabled:opacity-50 ${
                  filter === 'payment'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                }`}>
                Payments ({notifications.filter(n => n.type === 'payment').length})
              </button>
              <button
                onClick={() => setFilter('subscription')}
                disabled={loading}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation disabled:opacity-50 ${
                  filter === 'subscription'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                }`}>
                Subscription ({notifications.filter(n => n.type === 'subscription').length})
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Spinner />
            <p className="text-gray-500 mt-4 font-medium">Loading notifications...</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div className="space-y-2.5 sm:space-y-3">
            {filteredNotifications.length > 0 ? (
              <>
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg sm:rounded-xl border transition-all duration-300 hover:shadow-md active:scale-[0.99] ${
                      notification.read
                        ? 'border-gray-200'
                        : 'border-blue-200 shadow-sm'
                    }`}>
                    <div className="p-3 sm:p-4 md:p-5">
                      <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBgColor(notification.color)}`}>
                          {getIcon(notification.icon)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                <h3 className={`text-sm sm:text-base font-semibold text-gray-900 truncate pr-1 ${
                                  notification.read ? '' : ''
                                }`}>
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words">
                                {notification.message}
                              </p>
                            </div>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-500 active:text-red-600 transition-colors p-1.5 hover:bg-red-50 active:bg-red-100 rounded-lg touch-manipulation flex-shrink-0">
                              <CloseOutlined className="text-base sm:text-lg" />
                            </button>
                          </div>

                          {/* Footer */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-2.5 sm:mt-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <span className="text-xs text-gray-500">{notification.time}</span>
                              <span className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                                notification.type === 'payment'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : notification.type === 'subscription'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {notification.type === 'payment' ? '💳 Payment' : notification.type === 'subscription' ? '📋 Subscription' : '📢 General'}
                              </span>
                            </div>
                            
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                disabled={markingAsRead}
                                className="w-full sm:w-auto text-xs font-medium text-blue-600 hover:text-blue-700 active:text-blue-800 px-3 py-1.5 sm:py-1 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors touch-manipulation text-left sm:text-center disabled:opacity-50 disabled:cursor-not-allowed">
                                {markingAsRead ? 'Marking...' : 'Mark as read'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      current={currentPage}
                      total={total}
                      pageSize={pageSize}
                      showSizeChanger={true}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} notification${total > 1 ? 's' : ''}`
                      }
                      onChange={handlePageChange}
                      onShowSizeChange={handlePageChange}
                      pageSizeOptions={['10', '25', '50', '100']}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <BellOutlined className="text-3xl sm:text-4xl text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-xs sm:text-sm text-gray-600 px-4">
                  {filter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : `No ${filter === 'all' ? '' : filter} notifications to display.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
