import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../services/auth.services';
import {
  SESSION_TIMEOUT_MS,
  WARNING_BEFORE_LOGOUT_MS,
} from '../config/sessionTimeout.config';

const { Title, Text } = Typography;

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
];

const SessionTimeoutModal = ({ isEnabled }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isPrompted, setIsPrompted] = React.useState(false);
  const [remainingSeconds, setRemainingSeconds] = React.useState(
    Math.floor(WARNING_BEFORE_LOGOUT_MS / 1000),
  );
  const promptTimeoutRef = React.useRef(null);
  const logoutTimeoutRef = React.useRef(null);
  const countdownIntervalRef = React.useRef(null);

  const clearTimers = React.useCallback(() => {
    clearTimeout(promptTimeoutRef.current);
    clearTimeout(logoutTimeoutRef.current);
    clearInterval(countdownIntervalRef.current);
  }, []);

  const performLogout = React.useCallback(() => {
    clearTimers();
    setIsPrompted(false);
    dispatch(signOut(navigate));
  }, [clearTimers, dispatch, navigate]);

  const startCountdown = React.useCallback(() => {
    const warningSeconds = Math.floor(WARNING_BEFORE_LOGOUT_MS / 1000);
    setRemainingSeconds(warningSeconds);
    clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }, []);

  const scheduleTimers = React.useCallback(() => {
    clearTimers();

    if (!isEnabled) {
      return;
    }

    // Keep at least a brief active-session window after continuing the session.
    // If warning duration is equal to or longer than session duration, the modal
    // would immediately reopen after timer reset.
    const safeWarningBeforeLogoutMs =
      SESSION_TIMEOUT_MS > 1000
        ? Math.min(WARNING_BEFORE_LOGOUT_MS, SESSION_TIMEOUT_MS - 1000)
        : 0;
    const warningStartMs = Math.max(SESSION_TIMEOUT_MS - safeWarningBeforeLogoutMs, 0);

    if (warningStartMs === 0) {
      setIsPrompted(true);
      startCountdown();
    } else {
      promptTimeoutRef.current = setTimeout(() => {
        setIsPrompted(true);
        startCountdown();
      }, warningStartMs);
    }

    logoutTimeoutRef.current = setTimeout(() => {
      performLogout();
    }, SESSION_TIMEOUT_MS);
  }, [clearTimers, isEnabled, performLogout, startCountdown]);

  React.useEffect(() => {
    if (!isEnabled) {
      setIsPrompted(false);
      clearTimers();
      return;
    }

    const handleActivity = () => {
      if (isPrompted) {
        setIsPrompted(false);
      }
      scheduleTimers();
    };

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    scheduleTimers();

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [clearTimers, isEnabled, isPrompted, scheduleTimers]);

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  const handleContinue = () => {
    setIsPrompted(false);
    scheduleTimers();
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <Modal open={isPrompted} footer={null} closable={false} centered width={500}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />
        <Title level={3} style={{ margin: 0 }}>
          Session Timeout Warning
        </Title>
      </div>

      <Text type="secondary" style={{ display: 'block', marginTop: '12px', textAlign: 'center' }}>
        You have been inactive. You will be logged out in{' '}
        <span style={{ fontWeight: 700, color: '#ff4d4f' }}>{formatTime(remainingSeconds)}</span>.
      </Text>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <Button className="butn primary-btn" onClick={handleContinue}>
          Continue Session
        </Button>
        <Button className="butn secoundry-btn" onClick={performLogout}>
          Logout Now
        </Button>
      </div>
    </Modal>
  );
};

export default SessionTimeoutModal;
