import React from 'react';
import { Result } from 'antd';
import Button from './common/Button';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Something went wrong"
          subTitle="Sorry, an unexpected error has occurred."
          extra={
            <Button type="primary" key="reload" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryClass; 