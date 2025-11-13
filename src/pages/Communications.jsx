import React, { useState } from 'react';
import { Empty } from 'antd';
import { 
  MessageOutlined, 
  MailOutlined, 
  BellOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { dummyData } from '../services/dummyData';

const Communications = () => {
  const [filter, setFilter] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const filteredCommunications = dummyData.communications?.filter(comm => {
    const statusMatch = filter === 'all' || comm.status.toLowerCase() === filter.toLowerCase();
    const typeMatch = selectedType === 'all' || comm.type.toLowerCase() === selectedType.toLowerCase();
    return statusMatch && typeMatch;
  }) || [];

  const getTypeIcon = (type) => {
    const icons = {
      'Email': <MailOutlined className="text-lg" />,
      'Notification': <BellOutlined className="text-lg" />,
      'Newsletter': <FileTextOutlined className="text-lg" />,
      'Message': <MessageOutlined className="text-lg" />,
    };
    return icons[type] || <MessageOutlined className="text-lg" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      'Email': 'from-blue-500 to-blue-600',
      'Notification': 'from-orange-500 to-orange-600',
      'Newsletter': 'from-green-500 to-green-600',
      'Message': 'from-purple-500 to-purple-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getTypeBgColor = (type) => {
    const colors = {
      'Email': 'bg-blue-50',
      'Notification': 'bg-orange-50',
      'Newsletter': 'bg-green-50',
      'Message': 'bg-purple-50',
    };
    return colors[type] || 'bg-gray-50';
  };

  const statusFilters = [
    { value: 'all', label: 'All', count: dummyData.communications?.length || 0 },
    { value: 'unread', label: 'Unread', count: dummyData.communications?.filter(c => c.status === 'Unread').length || 0 },
    { value: 'read', label: 'Read', count: dummyData.communications?.filter(c => c.status === 'Read').length || 0 },
  ];

  const typeFilters = [
    { value: 'all', label: 'All Types' },
    { value: 'email', label: 'Email' },
    { value: 'notification', label: 'Notification' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'message', label: 'Message' },
  ];

  const stats = [
    { 
      label: 'Total', 
      value: dummyData.communications?.length || 0, 
      icon: <MessageOutlined />,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      label: 'Unread', 
      value: dummyData.communications?.filter(c => c.status === 'Unread').length || 0, 
      icon: <BellOutlined />,
      color: 'from-orange-500 to-orange-600'
    },
    { 
      label: 'Read', 
      value: dummyData.communications?.filter(c => c.status === 'Read').length || 0, 
      icon: <CheckCircleOutlined />,
      color: 'from-green-500 to-green-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Communications</h1>
            <p className="text-blue-100 text-sm">
              Stay updated with all your messages and notifications
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <MessageOutlined className="text-5xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-full shadow-md`}>
                {React.cloneElement(stat.icon, { className: 'text-white text-xl' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Status Filter */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Status</p>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  filter === tab.value
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.value 
                    ? 'bg-white/20' 
                    : 'bg-white'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedType(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  selectedType === tab.value
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Communications List */}
      {filteredCommunications.length > 0 ? (
        <div className="space-y-3">
          {filteredCommunications.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm border ${
                item.status === 'Unread' 
                  ? 'border-blue-200 bg-blue-50/30' 
                  : 'border-gray-200'
              } overflow-hidden hover:shadow-md transition-all duration-300 group`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`bg-gradient-to-br ${getTypeColor(item.type)} p-3 rounded-full shadow-md flex-shrink-0`}>
                    {React.cloneElement(getTypeIcon(item.type), { className: 'text-white text-lg' })}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`text-base font-bold group-hover:text-blue-600 transition-colors ${
                        item.status === 'Unread' ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 font-medium">
                          {item.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTypeBgColor(item.type)} ${
                        item.type === 'Email' ? 'text-blue-700' :
                        item.type === 'Notification' ? 'text-orange-700' :
                        item.type === 'Newsletter' ? 'text-green-700' :
                        'text-purple-700'
                      }`}>
                        {item.type}
                      </span>

                      <div className="flex items-center gap-1">
                        {item.status === 'Read' ? (
                          <>
                            <CheckCircleOutlined className="text-green-600 text-sm" />
                            <span className="text-xs font-medium text-green-600">Read</span>
                          </>
                        ) : (
                          <>
                            <ClockCircleOutlined className="text-orange-600 text-sm" />
                            <span className="text-xs font-medium text-orange-600">Unread</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-3">
                      <button className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        <EyeOutlined />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <Empty
            description={
              <div className="space-y-2">
                <p className="text-gray-900 font-semibold">No Communications Found</p>
                <p className="text-gray-500 text-sm">
                  There are no communications matching your filters.
                </p>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}
    </div>
  );
};

export default Communications; 