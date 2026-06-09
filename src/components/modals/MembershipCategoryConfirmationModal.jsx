import React from 'react';
import { Modal } from 'antd';
import Button from '../common/Button';

const MembershipCategoryConfirmationModal = ({
  open,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      closable={false}
      maskClosable={false}
      width={480}>
      <div className="py-1">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 leading-snug">
            Membership Category Confirmation
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-gray-600 mb-6">
          You have selected a reduced-rate membership category. Please ensure you
          meet the eligibility criteria, as this category may provide different
          benefits and entitlements than a full membership.
        </p>
        <p className="text-sm font-medium text-gray-800 mb-6">
          Are you sure you want to continue?
        </p>

        <div className="flex justify-end gap-3">
          <Button type="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" onClick={onConfirm}>
            Yes, continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MembershipCategoryConfirmationModal;
