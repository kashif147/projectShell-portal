import React, { useState } from 'react';
import { Empty } from 'antd';
import Button from '../components/common/Button';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { dummyData } from '../services/dummyData';

const Events = () => {
  const [filter, setFilter] = useState('all');

  const filteredEvents = dummyData.events?.filter(event => {
    if (filter === 'all') return true;
    return event.status.toLowerCase() === filter.toLowerCase();
  }) || [];

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-green-100 text-green-700 border-green-200',
      'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
      'Full': 'bg-red-100 text-red-700 border-red-200',
      'Upcoming': 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const filters = [
    { value: 'all', label: 'All Events', count: dummyData.events?.length || 0 },
    { value: 'open', label: 'Open', count: dummyData.events?.filter(e => e.status === 'Open').length || 0 },
    { value: 'upcoming', label: 'Upcoming', count: dummyData.events?.filter(e => e.status === 'Upcoming').length || 0 },
    { value: 'closed', label: 'Closed', count: dummyData.events?.filter(e => e.status === 'Closed').length || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Events & Workshops</h1>
            <p className="text-purple-100 text-sm">
              Discover and register for upcoming professional development events
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <CalendarOutlined className="text-5xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filter === tab.value
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
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

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Event Header with Gradient */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
                      {event.status}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-full shadow-md">
                    <CalendarOutlined className="text-white text-xl" />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6 space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {event.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <CalendarOutlined className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                      <p className="text-gray-900 font-semibold">{event.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <EnvironmentOutlined className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Location</p>
                      <p className="text-gray-900 font-semibold">{event.location}</p>
                    </div>
                  </div>

                  {event.time && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="bg-pink-100 p-2 rounded-lg">
                        <ClockCircleOutlined className="text-pink-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Time</p>
                        <p className="text-gray-900 font-semibold">{event.time}</p>
                      </div>
                    </div>
                  )}

                  {event.capacity && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <TeamOutlined className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Capacity</p>
                        <p className="text-gray-900 font-semibold">{event.capacity}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100">
                  <Button
                    type="primary"
                    disabled={event.status === 'Closed' || event.status === 'Full'}
                    className={`w-full !h-11 !font-semibold ${
                      event.status === 'Open' || event.status === 'Upcoming'
                        ? '!bg-gradient-to-r !from-purple-600 !to-indigo-600 hover:!from-purple-700 hover:!to-indigo-700 !border-0 !shadow-md hover:!shadow-lg'
                        : ''
                    }`}
                  >
                    {event.status === 'Closed' ? 'Registration Closed' : 
                     event.status === 'Full' ? 'Event Full' : 
                     'Register Now'}
                  </Button>
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
                <p className="text-gray-900 font-semibold">No Events Found</p>
                <p className="text-gray-500 text-sm">
                  There are no {filter !== 'all' ? filter : ''} events at the moment.
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

export default Events; 