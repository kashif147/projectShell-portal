import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Legacy /courses route — redirect into the unified Events & Courses hub. */
const Courses = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/events?type=course', { replace: true });
  }, [navigate]);

  return null;
};

export default Courses;
