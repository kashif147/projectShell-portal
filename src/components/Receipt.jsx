import React, { forwardRef } from 'react';

const Receipt = forwardRef(({ data }, ref) => (
  <div ref={ref} style={{ width: 600, margin: '0 auto', background: '#fff', padding: 32, fontFamily: 'Arial', color: '#222' }}>
    <div style={{ borderBottom: '4px solid #1a3a5d', marginBottom: 24, paddingBottom: 16 }}>
      <h2 style={{ textAlign: 'center', margin: 0 }}>Payment Due Receipt</h2>
    </div>
    <div style={{ marginBottom: 24 }}>
      <b>Bill To:</b><br />
      {data.forename} {data.surname}<br />
      {data.addressLine1 && <>{data.addressLine1}<br /></>}
      {data.addressLine3 && <>{data.addressLine3}, </>}
      {data.addressLine4 && <>{data.addressLine4}<br /></>}
      {data.personalEmail}
    </div>
    <div style={{ marginBottom: 24 }}>
      <b>Payment Method:</b><br />
      {data.paymentData?.paymentMethod === 'card' ? 'Credit Card' : data.paymentData?.paymentMethod}
    </div>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: 8, background: '#f5f5f5' }}>Description</th>
          <th style={{ border: '1px solid #ccc', padding: 8, background: '#f5f5f5' }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: '1px solid #ccc', padding: 8 }}>Membership Subscription</td>
          <td style={{ border: '1px solid #ccc', padding: 8 }}>${data.paymentData?.total}</td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #ccc', padding: 8, fontWeight: 'bold' }}>Total Due</td>
          <td style={{ border: '1px solid #ccc', padding: 8, fontWeight: 'bold' }}>${data.paymentData?.total}</td>
        </tr>
      </tbody>
    </table>
    <div style={{ marginTop: 32 }}>
      <b>Authorized Signature:</b> ___________________________
    </div>
  </div>
));

export default Receipt; 