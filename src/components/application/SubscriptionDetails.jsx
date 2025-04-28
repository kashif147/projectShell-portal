import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Card } from '../ui/Card';

const SubscriptionDetails = ({ formData, onFormDataChange }) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Subscription Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Membership Type"
            name="membershipType"
            required
            value={formData?.membershipType || ''}
            onChange={handleInputChange}
            options={[
              { value: 'regular', label: 'Regular Membership' },
              { value: 'premium', label: 'Premium Membership' },
              { value: 'student', label: 'Student Membership' }
            ]}
          />
          <Select
            label="Payment Frequency"
            name="paymentFrequency"
            required
            value={formData?.paymentFrequency || ''}
            onChange={handleInputChange}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'annually', label: 'Annually' }
            ]}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox
            label="Professional Development Access"
            name="professionalDevelopment"
            checked={formData?.professionalDevelopment || false}
            onChange={handleInputChange}
          />
          <Checkbox
            label="Networking Events Access"
            name="networkingEvents"
            checked={formData?.networkingEvents || false}
            onChange={handleInputChange}
          />
          <Checkbox
            label="CPD Tracking"
            name="cpdTracking"
            checked={formData?.cpdTracking || false}
            onChange={handleInputChange}
          />
          <Checkbox
            label="Premium Content Access"
            name="premiumContent"
            checked={formData?.premiumContent || false}
            onChange={handleInputChange}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Card Number"
            name="cardNumber"
            type="text"
            required
            value={formData?.cardNumber || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Card Holder Name"
            name="cardHolderName"
            required
            value={formData?.cardHolderName || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Expiry Date"
            name="expiryDate"
            type="month"
            required
            value={formData?.expiryDate || ''}
            onChange={handleInputChange}
          />
          <Input
            label="CVV"
            name="cvv"
            type="text"
            required
            value={formData?.cvv || ''}
            onChange={handleInputChange}
          />
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionDetails; 