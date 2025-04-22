import React from 'react';
import { Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';

const ErrorBoundary = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="500"
      title="Something went wrong"
      subTitle="Sorry, an unexpected error has occurred."
      extra={
        <Button type="primary" key="home" onClick={() => navigate('/')}>
          Back Home
        </Button>
      }
    />
  );
};

export default ErrorBoundary;
 