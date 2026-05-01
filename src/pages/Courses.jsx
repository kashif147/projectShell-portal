import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { staticCourses } from '../services/courseData';

const filters = [
  { id: 'all', label: 'All Courses' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'certificate', label: 'Certified' },
];

const getStatusColor = status => {
  switch (status) {
    case 'enrolled':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
    case 'available':
      return { bg: 'bg-blue-50', text: 'text-blue-700' };
    case 'completed':
      return { bg: 'bg-amber-50', text: 'text-amber-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
};

const getStatusLabel = status => {
  switch (status) {
    case 'enrolled':
      return 'Enrolled';
    case 'available':
      return 'Enroll Now';
    case 'completed':
      return 'Completed';
    default:
      return 'Available';
  }
};

const getLevelColor = level => {
  switch (level) {
    case 'Beginner':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
    case 'Intermediate':
      return { bg: 'bg-blue-50', text: 'text-blue-700' };
    case 'Advanced':
      return { bg: 'bg-red-50', text: 'text-red-600' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
};

const Courses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([1, 6]);

  const filteredCourses = useMemo(() => {
    const byFilter = staticCourses.filter(course => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'beginner') return course.level === 'Beginner';
      if (selectedFilter === 'intermediate')
        return course.level === 'Intermediate';
      if (selectedFilter === 'advanced') return course.level === 'Advanced';
      if (selectedFilter === 'certificate') return course.price !== 'Free';
      return true;
    });

    const q = searchQuery.trim().toLowerCase();
    if (!q) return byFilter;

    return byFilter.filter(course => {
      return (
        course.title.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q)
      );
    });
  }, [selectedFilter, searchQuery]);

  const getEffectiveStatus = course => {
    if (!course) return 'available';
    if (course.status === 'completed') return 'completed';
    if (enrolledCourseIds.includes(course.id)) return 'enrolled';
    return course.status || 'available';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Courses
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Discover learning opportunities tailored to your growth.
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
              <span className="text-gray-500">
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
                className="flex-1 bg-transparent outline-none text-sm sm:text-base text-gray-900 placeholder-gray-400"
                placeholder="Search courses, categories, or instructors..."
              />
              {searchQuery && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
              }`}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {filteredCourses.map(course => {
          const effectiveStatus = getEffectiveStatus(course);
          const statusColors = getStatusColor(effectiveStatus);
          const levelColors = getLevelColor(course.level);

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${levelColors.bg} ${levelColors.text}`}>
                    {course.level}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}>
                    {getStatusLabel(effectiveStatus)}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                  {course.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">
                  by {course.instructor}
                </p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span role="img" aria-label="duration">
                      ⏱
                    </span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span role="img" aria-label="students">
                      👥
                    </span>
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span role="img" aria-label="rating">
                      ⭐
                    </span>
                    <span>{course.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-blue-50 text-blue-700">
                    {course.category}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-base sm:text-lg font-bold text-blue-600">
                    {course.price}
                  </span>
                  <Button
                    type={effectiveStatus === 'enrolled' ? 'default' : 'primary'}
                    disabled={effectiveStatus === 'completed'}
                    onClick={() => navigate(`/courses/${course.id}/register`)}
                    className="!h-10 !rounded-lg !px-4 !font-semibold">
                    {effectiveStatus === 'completed'
                      ? 'Completed'
                      : effectiveStatus === 'enrolled'
                      ? 'View Registration'
                      : 'Register'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <span className="text-blue-500 text-3xl">📘</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            No courses found
          </p>
          <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
            Try adjusting your search or filters to discover more learning
            opportunities.
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;
