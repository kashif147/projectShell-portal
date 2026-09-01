import React, { useState } from 'react';
import { Empty } from 'antd';
import { 
  MessageOutlined, 
  MailOutlined, 
  BellOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ArrowRightOutlined,
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
      'Email': 'bg-blue-600 text-white',
      'Notification': 'bg-amber-500 text-white',
      'Newsletter': 'bg-emerald-600 text-white',
      'Message': 'bg-indigo-600 text-white',
    };
    return colors[type] || 'bg-slate-600 text-white';
  };

  const getTypeBgColor = (type) => {
    const colors = {
      'Email': 'bg-blue-50 text-blue-700 border-blue-200',
      'Notification': 'bg-amber-50 text-amber-700 border-amber-200',
      'Newsletter': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Message': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[type] || 'bg-slate-50 text-slate-700 border-slate-200';
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
      label: 'Total Messages', 
      value: dummyData.communications?.length || 0, 
      icon: <MessageOutlined />,
      bgColor: 'bg-blue-50 text-blue-600'
    },
    { 
      label: 'Unread Items', 
      value: dummyData.communications?.filter(c => c.status === 'Unread').length || 0, 
      icon: <BellOutlined />,
      bgColor: 'bg-amber-50 text-amber-600'
    },
    { 
      label: 'Read & Archived', 
      value: dummyData.communications?.filter(c => c.status === 'Read').length || 0, 
      icon: <CheckCircleOutlined />,
      bgColor: 'bg-emerald-50 text-emerald-600'
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/50 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 text-lg">
              <MessageOutlined />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
              Communications
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Stay updated with official union notices, newsletters, and direct member communications.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)] flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl ${stat.bgColor}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)] space-y-3.5">
        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-16 shrink-0">Status</span>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
                  filter === tab.value
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  filter === tab.value 
                    ? 'bg-white/25 text-white' 
                    : 'bg-white text-slate-700 shadow-sm'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-16 shrink-0">Type</span>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedType(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
                  selectedType === tab.value
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
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
              className={`rounded-2xl border bg-white shadow-sm ${
                item.status === 'Unread' 
                  ? 'border-blue-200 bg-blue-50/20' 
                  : 'border-slate-200/80'
              } p-4 sm:p-5 hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={`text-sm sm:text-base font-bold group-hover:text-blue-600 transition-colors ${
                      item.status === 'Unread' ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {item.title}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                      {item.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getTypeBgColor(item.type)}`}>
                      {item.type}
                    </span>

                    <div className="flex items-center gap-1">
                      {item.status === 'Read' ? (
                        <>
                          <CheckCircleOutlined className="text-emerald-600 text-xs" />
                          <span className="text-xs font-semibold text-emerald-700">Read</span>
                        </>
                      ) : (
                        <>
                          <ClockCircleOutlined className="text-amber-600 text-xs" />
                          <span className="text-xs font-semibold text-amber-700">Unread</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                    <button className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      <EyeOutlined />
                      <span>View Details</span>
                      <ArrowRightOutlined className="text-[10px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 sm:p-16 text-center shadow-sm">
          <Empty
            description={
              <div className="space-y-1">
                <p className="text-slate-900 font-bold">No Communications Found</p>
                <p className="text-slate-500 text-xs sm:text-sm">
                  There are no communications matching your current filter.
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