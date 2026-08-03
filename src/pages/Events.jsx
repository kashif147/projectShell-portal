import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Empty } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import EventCard from '../components/events/EventCard';
import EventDetailModal from '../components/dashboard/EventDetailModal';
import Spinner from '../components/common/Spinner';
import {
  fetchMyRegistrations,
  fetchPublishedCourses,
  fetchPublishedEvents,
} from '../api/events.api';
import {
  applyRegistrationStatus,
  filterEventsBySearch,
  filterRegisteredItems,
  parseEventsResponse,
  parseRegistrationsResponse,
} from '../helpers/events.helper';
import { useProfile } from '../contexts/profileContext';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'event', label: 'Events' },
  { value: 'course', label: 'Courses' },
  { value: 'my-event', label: 'My Events' },
  { value: 'my-course', label: 'My Courses' },
];

const tagItems = (items, kind) =>
  (items || []).map(item => ({
    ...item,
    kind,
    category:
      item.category || (kind === 'course' ? 'Course' : 'Event'),
  }));

const excludePast = items =>
  (items || []).filter(item => item?.type !== 'past');

const EventsAndCourses = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profileDetail, getProfileDetail } = useProfile();

  const initialFilter = (() => {
    const type = searchParams.get('type');
    const scope = searchParams.get('scope');
    if (scope === 'my' && type === 'course') return 'my-course';
    if (scope === 'my' && type === 'event') return 'my-event';
    if (type === 'course') return 'course';
    if (type === 'event') return 'event';
    return 'all';
  })();

  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profileId = profileDetail?.profileId;
      const [eventsRes, coursesRes, registrationsRes] = await Promise.all([
        fetchPublishedEvents(),
        fetchPublishedCourses(),
        fetchMyRegistrations(profileId),
      ]);

      const eventsOk = eventsRes?.status >= 200 && eventsRes?.status < 300;
      const coursesOk = coursesRes?.status >= 200 && coursesRes?.status < 300;

      if (!eventsOk && !coursesOk) {
        setItems([]);
        setRegistrations([]);
        toast.error('Unable to load events and courses. Please try again.');
        return;
      }

      const regs = registrationsRes
        ? parseRegistrationsResponse(registrationsRes)
        : [];
      const events = eventsOk
        ? tagItems(parseEventsResponse(eventsRes), 'event')
        : [];
      const courses = coursesOk
        ? tagItems(parseEventsResponse(coursesRes), 'course')
        : [];

      setRegistrations(regs);
      setItems(
        applyRegistrationStatus([...events, ...courses], regs),
      );
    } catch (error) {
      console.error('Failed to fetch events and courses:', error);
      setItems([]);
      setRegistrations([]);
      toast.error('Unable to load events and courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [profileDetail?.profileId]);

  useEffect(() => {
    getProfileDetail?.();
  }, [getProfileDetail]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const type = searchParams.get('type');
    const scope = searchParams.get('scope');
    if (scope === 'my' && type === 'course') setFilter('my-course');
    else if (scope === 'my' && type === 'event') setFilter('my-event');
    else if (type === 'course') setFilter('course');
    else if (type === 'event') setFilter('event');
    else if (!type && !scope) setFilter('all');
  }, [searchParams]);

  const handleFilterChange = value => {
    setFilter(value);
    setSearchQuery('');
    if (value === 'all') {
      setSearchParams({});
    } else if (value === 'event') {
      setSearchParams({ type: 'event' });
    } else if (value === 'course') {
      setSearchParams({ type: 'course' });
    } else if (value === 'my-event') {
      setSearchParams({ type: 'event', scope: 'my' });
    } else if (value === 'my-course') {
      setSearchParams({ type: 'course', scope: 'my' });
    }
  };

  const activeItems = useMemo(() => excludePast(items), [items]);

  const myEvents = useMemo(
    () =>
      excludePast(
        filterRegisteredItems(activeItems, registrations, 'event'),
      ),
    [activeItems, registrations],
  );

  const myCourses = useMemo(
    () =>
      excludePast(
        filterRegisteredItems(activeItems, registrations, 'course'),
      ),
    [activeItems, registrations],
  );

  const filteredItems = useMemo(() => {
    let source = activeItems;
    if (filter === 'event') {
      source = activeItems.filter(item => item.kind === 'event');
    } else if (filter === 'course') {
      source = activeItems.filter(item => item.kind === 'course');
    } else if (filter === 'my-event') {
      source = myEvents;
    } else if (filter === 'my-course') {
      source = myCourses;
    }
    return filterEventsBySearch(source, searchQuery);
  }, [filter, activeItems, myEvents, myCourses, searchQuery]);

  const filterTabs = useMemo(
    () =>
      FILTERS.map(tab => {
        let count = activeItems.length;
        if (tab.value === 'event') {
          count = activeItems.filter(item => item.kind === 'event').length;
        } else if (tab.value === 'course') {
          count = activeItems.filter(item => item.kind === 'course').length;
        } else if (tab.value === 'my-event') {
          count = myEvents.length;
        } else if (tab.value === 'my-course') {
          count = myCourses.length;
        }
        return { ...tab, count };
      }),
    [activeItems, myEvents, myCourses],
  );

  const registerPath = item =>
    item?.kind === 'course'
      ? `/courses/${item.courseId || item.id}/register`
      : `/events/${item.id}/register`;

  const emptyTitle =
    filter === 'my-event'
      ? 'No My Events yet'
      : filter === 'my-course'
        ? 'No My Courses yet'
        : filter === 'event'
          ? 'No events found'
          : filter === 'course'
            ? 'No courses found'
            : 'No events or courses found';

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Events & Courses
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse current events and CPD courses, or view what you have already
          registered for.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleFilterChange(tab.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  filter === tab.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {tab.label}
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    filter === tab.value ? 'bg-white/20' : 'bg-white'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full shrink-0 sm:w-72 md:w-80">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span className="text-slate-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.5 3.5a5 5 0 013.973 8.09l3.218 3.219a.75.75 0 11-1.06 1.06l-3.22-3.217A5 5 0 118.5 3.5zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
                placeholder="Search events and courses..."
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
          <Spinner />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-3 sm:gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          {filteredItems.map(item => (
            <EventCard
              key={`${item.kind}-${item.id}`}
              event={item}
              onViewDetails={setSelectedItem}
              onRegister={selected => {
                navigate(registerPath(selected));
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
          <Empty
            description={
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">{emptyTitle}</p>
                <p className="text-sm text-slate-500">
                  {filter.startsWith('my-')
                    ? 'Register for an item to see it here.'
                    : 'There are no current items matching this filter.'}
                </p>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}

      <EventDetailModal
        event={selectedItem}
        onClose={() => setSelectedItem(null)}
        onRegister={() => {
          if (selectedItem?.id) {
            navigate(registerPath(selectedItem));
          }
          setSelectedItem(null);
        }}
      />
    </div>
  );
};

export default EventsAndCourses;
