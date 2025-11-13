import React, { useState } from 'react';
import { BellOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseOutlined } from '@ant-design/icons';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'payment',
      icon: 'info',
      title: 'Monthly Payment Due',
      message: 'Your monthly subscription payment of €24.92 is due on December 1, 2025.',
      time: '2 hours ago',
      read: false,
      color: 'blue',
    },
    {
      id: 2,
      type: 'subscription',
      icon: 'success',
      title: 'Subscription Activated',
      message: 'Your membership subscription has been successfully activated. Welcome aboard!',
      time: '1 day ago',
      read: false,
      color: 'green',
    },
    {
      id: 3,
      type: 'payment',
      icon: 'success',
      title: 'Payment Successful',
      message: 'Your payment of €299.00 has been processed successfully. Receipt #INV-2024-001234.',
      time: '2 days ago',
      read: true,
      color: 'green',
    },
    {
      id: 4,
      type: 'subscription',
      icon: 'warning',
      title: 'Subscription Renewal Reminder',
      message: 'Your annual subscription will renew on January 15, 2026. Update payment method if needed.',
      time: '3 days ago',
      read: true,
      color: 'orange',
    },
    {
      id: 5,
      type: 'payment',
      icon: 'info',
      title: 'Payment Method Updated',
      message: 'Your payment method ending in ****4242 has been updated successfully.',
      time: '5 days ago',
      read: true,
      color: 'blue',
    },
    {
      id: 6,
      type: 'subscription',
      icon: 'info',
      title: 'New Benefits Available',
      message: 'Check out the new member benefits and rewards available to you.',
      time: '1 week ago',
      read: true,
      color: 'purple',
    },
    {
      id: 7,
      type: 'payment',
      icon: 'success',
      title: 'Payment Confirmation',
      message: 'Monthly payment of €24.92 received. Thank you for your payment.',
      time: '2 weeks ago',
      read: true,
      color: 'green',
    },
    {
      id: 8,
      type: 'subscription',
      icon: 'info',
      title: 'Profile Update Required',
      message: 'Please review and update your profile information to keep your account current.',
      time: '3 weeks ago',
      read: true,
      color: 'blue',
    },
  ]);

  const [filter, setFilter] = useState('all'); // all, payment, subscription, unread

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'success':
        return <CheckCircleOutlined className="text-2xl" />;
      case 'warning':
        return <WarningOutlined className="text-2xl" />;
      case 'info':
      default:
        return <InfoCircleOutlined className="text-2xl" />;
    }
  };

  const getIconBgColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
    };
    return colors[color] || colors.blue;
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BellOutlined className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('payment')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'payment'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              Payments ({notifications.filter(n => n.type === 'payment').length})
            </button>
            <button
              onClick={() => setFilter('subscription')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'subscription'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              Subscription ({notifications.filter(n => n.type === 'subscription').length})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border transition-all duration-300 hover:shadow-md ${
                  notification.read
                    ? 'border-gray-200'
                    : 'border-blue-200 shadow-sm'
                }`}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBgColor(notification.color)}`}>
                      {getIcon(notification.icon)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-base font-semibold ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg">
                          <CloseOutlined className="text-sm" />
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                            notification.type === 'payment'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {notification.type === 'payment' ? '💳 Payment' : '📋 Subscription'}
                          </span>
                        </div>
                        
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors">
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BellOutlined className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-sm text-gray-600">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : `No ${filter === 'all' ? '' : filter} notifications to display.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

