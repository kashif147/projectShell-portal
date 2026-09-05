import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { BellOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseOutlined, FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';
import { Pagination } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import { fetchNotiticationRequest, readNotificationRequest, deleteNotificationRequest, deleteAllNotificationRequest } from '../api/notification.api';
import notification_request from '../api/notification_request';
import { useNotification } from '../contexts/notificationContext';
import Spinner from '../components/common/Spinner';

const Notifications = () => {
  const auth = useSelector(state => state.auth);
  const { unreadCount, setUnreadCountValue } = useNotification();
  
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
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState(false);

  // Format relative time helper
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    const date = moment(dateString);
    if (!date.isValid()) return 'Unknown time';
    return date.fromNow();
  };

  // Transform API notification to component format
  const transformNotification = (apiNotification) => {
    const attachments = Array.isArray(apiNotification.attachments)
      ? apiNotification.attachments
      : Array.isArray(apiNotification?.metadata?.attachments)
      ? apiNotification.metadata.attachments
      : [];
    const pdfAttachments = attachments.filter(attachment =>
      String(attachment?.mimeType || '')
        .toLowerCase()
        .includes('pdf'),
    );

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
      attachments,
      pdfAttachments,
    };
  };

  const resolveAttachmentPath = attachment => {
    return (
      attachment?.downloadUrl ||
      attachment?.url ||
      attachment?.path ||
      ''
    );
  };

  const handleDownloadAttachment = async attachment => {
    const attachmentPath = resolveAttachmentPath(attachment);
    const base64Data = attachment?.dataBase64 || attachment?.base64Data || '';

    try {
      if (!attachmentPath && base64Data) {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i += 1) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const base64Blob = new Blob([byteArray], {
          type: attachment?.mimeType || 'application/pdf',
        });
        const base64Url = window.URL.createObjectURL(base64Blob);
        const base64Link = document.createElement('a');
        base64Link.href = base64Url;
        base64Link.download =
          attachment?.fileName ||
          attachment?.filename ||
          'notification-attachment.pdf';
        document.body.appendChild(base64Link);
        base64Link.click();
        base64Link.remove();
        window.URL.revokeObjectURL(base64Url);
        return;
      }

      if (!attachmentPath) {
        toast.error('No attachment data found for this notification');
        return;
      }

      const requestPath = attachmentPath.startsWith('http')
        ? attachmentPath
        : attachmentPath.startsWith('/')
        ? attachmentPath
        : `/${attachmentPath}`;

      const response = await notification_request.get(requestPath, {
        responseType: 'blob',
      });

      if (response?.status !== 200 || !response?.data) {
        toast.error('Failed to download attachment');
        return;
      }

      const blob = new Blob([response.data], {
        type: attachment?.mimeType || 'application/octet-stream',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment?.fileName || attachment?.filename || 'notification-attachment.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Attachment download failed:', error);
      toast.error('Failed to download attachment');
    }
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
        // setUnreadCount(data.unreadCount || 0);
        
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

  // Delete single notification
  const deleteNotification = async (id) => {
    if (!userId || !tenantId || deletingNotification) return;

    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    setTotal(prev => Math.max(0, prev - 1));

    setDeletingNotification(true);
    try {
      const response = await deleteNotificationRequest(id);

      if (response?.status === 200 && response?.data?.success) {
        toast.success('Notification deleted successfully');
        // Refresh notifications to get latest state
        await fetchNotifications();
      } else {
        // Revert optimistic update on error
        setNotifications(previousNotifications);
        setTotal(prev => prev + 1);
        toast.error(response?.data?.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Revert optimistic update on error
      setNotifications(previousNotifications);
      setTotal(prev => prev + 1);
      toast.error('Failed to delete notification. Please try again.');
    } finally {
      setDeletingNotification(false);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!userId || !tenantId || deletingNotification) return;

    if (notifications.length === 0) return;

    // Confirm before deleting all
    if (!window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }

    // Optimistic update
    const previousNotifications = [...notifications];
    const previousTotal = total;
    setNotifications([]);
    setTotal(0);

    setDeletingNotification(true);
    try {
      const response = await deleteAllNotificationRequest();

      if (response?.status === 200 && response?.data?.success) {
        toast.success('All notifications deleted successfully');
        // Refresh notifications to get latest state
        await fetchNotifications();
      } else {
        // Revert optimistic update on error
        setNotifications(previousNotifications);
        setTotal(previousTotal);
        toast.error(response?.data?.message || 'Failed to delete all notifications');
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      // Revert optimistic update on error
      setNotifications(previousNotifications);
      setTotal(previousTotal);
      toast.error('Failed to delete all notifications. Please try again.');
      await fetchNotifications();
    } finally {
      setDeletingNotification(false);
    }
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
    <div>
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
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.05)] relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/50 blur-2xl" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/25 flex-shrink-0">
                <BellOutlined className="text-2xl text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
                  Notifications
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {loading
                    ? 'Loading notifications...'
                    : unreadCount > 0
                      ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''}`
                      : 'All caught up! No unread notifications.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {unreadCount > 0 && !loading && (
                <button
                  onClick={markAllAsRead}
                  disabled={markingAsRead || deletingNotification}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-95 rounded-xl transition-all disabled:opacity-50">
                  {markingAsRead ? 'Marking...' : 'Mark all as read'}
                </button>
              )}
              {notifications.length > 0 && !loading && (
                <button
                  onClick={deleteAllNotifications}
                  disabled={deletingNotification || markingAsRead}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl transition-all disabled:opacity-50">
                  {deletingNotification ? 'Deleting...' : 'Clear all'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)] overflow-x-auto filter-tabs-scroll">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setFilter('all')}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('payment')}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'payment'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              Payments ({notifications.filter(n => n.type === 'payment').length})
            </button>
            <button
              onClick={() => setFilter('subscription')}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'subscription'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              Subscriptions ({notifications.filter(n => n.type === 'subscription').length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-16 text-center shadow-sm">
            <Spinner />
            <p className="text-slate-500 mt-4 text-sm font-medium">Loading your notifications...</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              <>
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`rounded-2xl border bg-white p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      notification.read
                        ? 'border-slate-200/80 shadow-sm'
                        : 'border-blue-200 bg-blue-50/20 shadow-[0_1px_3px_rgba(37,99,235,0.08),0_6px_16px_-4px_rgba(37,99,235,0.06)]'
                    }`}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-base shadow-sm ${getIconBgColor(
                          notification.color,
                        )}`}>
                        {getIcon(notification.icon)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 ring-2 ring-blue-100" />
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
                              {notification.message}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            disabled={deletingNotification || markingAsRead}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 hover:bg-rose-50 rounded-lg flex-shrink-0 disabled:opacity-50">
                            <CloseOutlined className="text-sm" />
                          </button>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-slate-400">
                              {notification.time}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                                notification.type === 'payment'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : notification.type === 'subscription'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-slate-100 text-slate-700'
                              }`}>
                              {notification.type === 'payment'
                                ? 'Payment'
                                : notification.type === 'subscription'
                                  ? 'Subscription'
                                  : 'General'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {notification.pdfAttachments?.length > 0 && (
                              <button
                                onClick={() =>
                                  handleDownloadAttachment(
                                    notification.pdfAttachments[0],
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                                <DownloadOutlined />
                                Download PDF
                              </button>
                            )}

                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                disabled={markingAsRead}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50">
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
                  <div className="mt-6 flex justify-center pt-2">
                    <Pagination
                      current={currentPage}
                      total={total}
                      pageSize={pageSize}
                      showSizeChanger={true}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} notifications`
                      }
                      onChange={handlePageChange}
                      onShowSizeChange={handlePageChange}
                      pageSizeOptions={['10', '25', '50', '100']}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-12 sm:p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl text-slate-400">
                  <BellOutlined />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  No notifications
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  {filter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : `No ${filter === 'all' ? '' : filter} notifications found.`}
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
