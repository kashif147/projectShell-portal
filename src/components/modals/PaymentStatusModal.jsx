import React from 'react';
import { Modal, Result, Button as AntButton } from 'antd';

const PaymentStatusModal = ({
  open,
  status = 'success',
  title,
  subTitle,
  onClose,
  onPrimary,
  primaryText,
}) => {
  const isSuccess = status === 'success';

  const resolvedTitle = title || (isSuccess ? 'Payment update' : 'Payment failed');
  const resolvedSubTitle =
    subTitle ||
    (isSuccess
      ? 'Your payment status has been updated.'
      : 'We could not complete your payment. Please try again or use a different method.');
  const resolvedPrimaryText = primaryText || (isSuccess ? 'Go to home' : 'Back to home');

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered width={420} closable={false} maskClosable={false}>
      <Result
        status={isSuccess ? 'success' : 'error'}
        title={resolvedTitle}
        subTitle={resolvedSubTitle}
        extra={
          <AntButton type="primary" onClick={onPrimary || onClose}>
            {resolvedPrimaryText}
          </AntButton>
        }
      />
    </Modal>
  );
};

export default PaymentStatusModal;


