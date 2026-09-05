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
  isRegistrationLocked,
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