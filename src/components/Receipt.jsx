import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    padding: 40,
    fontFamily: 'Helvetica',
    color: '#222',
  },
  header: {
    borderBottom: '3px solid #4f46e5',
    marginBottom: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 10,
    color: '#444',
    marginBottom: 3,
    lineHeight: 1.4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  column: {
    flex: 1,
    paddingRight: 8,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginVertical: 16,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '70%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
    padding: 10,
  },
  tableColHeaderAmount: {
    width: '30%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
    padding: 10,
  },
  tableCol: {
    width: '70%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#d1d5db',
    padding: 10,
  },
  tableColAmount: {
    width: '30%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    padding: 10,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tableText: {
    fontSize: 10,
    color: '#444',
  },
  tableTotalRow: {
    backgroundColor: '#f9fafb',
  },
  bold: {
    fontWeight: 'bold',
  },
  signature: {
    marginTop: 24,
    paddingTop: 16,
    borderTop: '1px solid #e5e7eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 8,
  },
});

const getMembershipCategoryLabel = (data) => {
  // Use the resolved category name if available
  if (data.membershipCategoryName) {
    return data.membershipCategoryName;
  }
  
  // Fallback to code-based lookup for backward compatibility
  const value = data.membershipCategory;
  const categories = {
    'general': 'General (all grades)',
    'postgraduate_student': 'Postgraduate Student',
    'short_term_relief': 'Short-term/ Relief (under 15 hrs/wk average)',
    'private_nursing_home': 'Private nursing home',
    'affiliate_non_practicing': 'Affiliate members (non-practicing)',
    'lecturing': 'Lecturing (employed in universities and IT institutes)',
    'associate': 'Associate (not currently employed as a nurse/midwife)',
    'retired_associate': 'Retired Associate',
    'undergraduate_student': 'Undergraduate Student',
  };
  return categories[value] || value || 'N/A';
};

const formatCurrency = (amount) => {
  if (!amount) return '€0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `€${num.toFixed(2)}`;
};

const Receipt = forwardRef(({ data }, ref) => {
  const FIXED_WIDTH = 650;
  const FIXED_PADDING = 40;
  const TOTAL_WIDTH = FIXED_WIDTH + (FIXED_PADDING * 2);
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (wrapperRef.current && containerRef.current) {
        const containerWidth = wrapperRef.current.offsetWidth || wrapperRef.current.clientWidth;
        const containerHeight = wrapperRef.current.offsetHeight || wrapperRef.current.clientHeight;
        
        // Get actual receipt height (before scaling)
        const receiptHeight = containerRef.current.scrollHeight;
        
        // Account for wrapper padding (16px on each side = 32px total)
        const availableWidth = Math.max(100, containerWidth - 32);
        const availableHeight = Math.max(100, containerHeight - 32);
        
        // Calculate scale based on both width and height
        const widthScale = availableWidth / TOTAL_WIDTH;
        const heightScale = availableHeight / receiptHeight;
        
        // Use the smaller scale to ensure it fits both dimensions
        const calculatedScale = Math.min(1, Math.min(widthScale, heightScale));
        setScale(Math.max(0.25, calculatedScale)); // Minimum scale of 0.25 for readability
      }
    };

    // Initial calculation with delay to ensure DOM is ready
    const timeoutId = setTimeout(calculateScale, 150);
    
    // Use ResizeObserver for accurate container size detection
    let resizeObserver;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        setTimeout(calculateScale, 10);
      });
      
      if (wrapperRef.current) {
        resizeObserver.observe(wrapperRef.current);
      }
    }

    // Also listen to window resize for modal size changes
    window.addEventListener('resize', calculateScale);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateScale);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [data]);

  return (
    <div 
      ref={(node) => {
        wrapperRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className="receipt-wrapper"
      style={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '16px',
        overflow: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <div 
        ref={containerRef}
        className="receipt-container"
        style={{ 
          width: `${FIXED_WIDTH}px`,
          margin: '0 auto', 
          background: '#fff', 
          padding: `${FIXED_PADDING}px`,
          fontFamily: 'Arial, sans-serif', 
          color: '#222', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
          flexShrink: 0
        }}>
        <style>{`
          .receipt-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
          }
          .receipt-title {
            font-size: 28px;
            margin: 0;
          }
          .receipt-subtitle {
            font-size: 12px;
            margin: 8px 0 0 0;
          }
          .receipt-date {
            text-align: right;
            margin-bottom: 20px;
            font-size: 11px;
          }
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            border: 1px solid #d1d5db;
            display: table;
            table-layout: fixed;
          }
          .receipt-table th,
          .receipt-table td {
            padding: 12px;
            word-wrap: break-word;
          }
          .receipt-signature-line {
            width: 100%;
            max-width: 300px;
          }
        `}</style>
    {/* Header */}
    <div style={{ borderBottom: '3px solid #4f46e5', marginBottom: 20, paddingBottom: 12, textAlign: 'center' }}>
      <h1 className="receipt-title" style={{ color: '#1a1a1a', fontWeight: 'bold' }}>Payment Receipt</h1>
      <p className="receipt-subtitle" style={{ color: '#666' }}>Membership Subscription Payment</p>
    </div>

    {/* Date */}
    <div className="receipt-date" style={{ color: '#666' }}>
      <b>Date:</b> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>

    {/* Member Information Section */}
    <div className="receipt-grid">
      {/* Bill To */}
      <div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: 13, color: '#4f46e5', textTransform: 'uppercase', fontWeight: 'bold' }}>Bill To</h3>
        <div style={{ fontSize: 11, lineHeight: 1.6, color: '#444' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{data.title || ''} {data.forename} {data.surname}</div>
          {data.addressLine1 && <div>{data.addressLine1}</div>}
          {data.addressLine2 && <div>{data.addressLine2}</div>}
          {data.addressLine3 && <div>{data.addressLine3}</div>}
          {data.addressLine4 && <div>{data.addressLine4}</div>}
          {data.eircode && <div>Eircode: {data.eircode}</div>}
          {data.country && <div>{data.country}</div>}
        </div>
      </div>

      {/* Member Details */}
      <div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: 13, color: '#4f46e5', textTransform: 'uppercase', fontWeight: 'bold' }}>Member Details</h3>
        <div style={{ fontSize: 11, lineHeight: 1.6, color: '#444' }}>
          {data.personalEmail && <div><b>Email:</b> {data.personalEmail}</div>}
          {data.workEmail && <div><b>Work Email:</b> {data.workEmail}</div>}
          {data.mobileNo && <div><b>Mobile:</b> {data.mobileNo}</div>}
          {data.homeWorkTelNo && <div><b>Tel:</b> {data.homeWorkTelNo}</div>}
          {data.nmbiNumber && <div><b>NMBI Number:</b> {data.nmbiNumber}</div>}
        </div>
      </div>
    </div>

    {/* Professional Information */}
    {(data.membershipCategory || data.membershipCategoryName || data.grade || data.workLocation) && (
      <div style={{ marginBottom: 24, padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: 13, color: '#4f46e5', textTransform: 'uppercase', fontWeight: 'bold' }}>Professional Information</h3>
        <div className="receipt-grid" style={{ gap: 12, fontSize: 11, color: '#444' }}>
          {(data.membershipCategory || data.membershipCategoryName) && (
            <div>
              <b>Membership Category:</b>
              <div style={{ marginTop: 2 }}>{getMembershipCategoryLabel(data)}</div>
            </div>
          )}
          {data.grade && (
            <div>
              <b>Grade:</b>
              <div style={{ marginTop: 2 }}>{data.grade}</div>
            </div>
          )}
          {data.workLocation && (
            <div>
              <b>Work Location:</b>
              <div style={{ marginTop: 2 }}>{data.workLocation}</div>
            </div>
          )}
          {data.branch && (
            <div>
              <b>Branch:</b>
              <div style={{ marginTop: 2 }}>{data.branch}</div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Payment Method */}
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: 13, color: '#4f46e5', textTransform: 'uppercase', fontWeight: 'bold' }}>Payment Method</h3>
      <div style={{ fontSize: 11, color: '#444' }}>
        {data.paymentData?.paymentMethod === 'card' ? 'Credit Card' : data.paymentData?.paymentMethod || 'Credit Card'}
      </div>
    </div>

    {/* Payment Details Table */}
    <table className="receipt-table">
      <thead>
        <tr>
          <th style={{ border: '1px solid #d1d5db', padding: 12, background: '#f3f4f6', textAlign: 'left', fontSize: 12, fontWeight: 'bold' }}>Description</th>
          <th style={{ border: '1px solid #d1d5db', padding: 12, background: '#f3f4f6', textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: '1px solid #d1d5db', padding: 12, fontSize: 11 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Membership Subscription</div>
            <div style={{ color: '#666', fontSize: 10 }}>
              {(data.membershipCategory || data.membershipCategoryName) && <div>{getMembershipCategoryLabel(data)}</div>}
            </div>
          </td>
          <td style={{ border: '1px solid #d1d5db', padding: 12, textAlign: 'right', fontSize: 11 }}>
            {formatCurrency(data.paymentData?.total)}
          </td>
        </tr>
        <tr style={{ background: '#f9fafb' }}>
          <td style={{ border: '1px solid #d1d5db', padding: 12, fontWeight: 'bold', fontSize: 12 }}>Total Due</td>
          <td style={{ border: '1px solid #d1d5db', padding: 12, textAlign: 'right', fontWeight: 'bold', fontSize: 14, color: '#4f46e5' }}>
            {formatCurrency(data.paymentData?.total)}
          </td>
        </tr>
      </tbody>
    </table>

    {/* Signature */}
    <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, color: '#444' }}>
        <b>Authorized Signature:</b>
        <div className="receipt-signature-line" style={{ borderBottom: '1px solid #444', marginTop: 20 }}></div>
      </div>
    </div>

    {/* Footer */}
    <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: 9, color: '#999' }}>
      <p style={{ margin: 0 }}>Thank you for your payment. This is an official receipt for your records.</p>
      <p style={{ margin: '4px 0 0 0' }}>For any queries, please contact the membership office.</p>
    </div>
      </div>
    </div>
  );
});

export const ReceiptPDF = ({ data }) => {
  const formatAmount = (amount) => {
    if (!amount) return '€0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `€${num.toFixed(2)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment Receipt</Text>
          <Text style={styles.subtitle}>Membership Subscription Payment</Text>
        </View>

        {/* Date */}
        <View style={{ textAlign: 'right', marginBottom: 16 }}>
          <Text style={[styles.text, { fontSize: 9, color: '#666' }]}>
            Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Member Information Section */}
        <View style={styles.row}>
          {/* Bill To */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={[styles.text, styles.bold]}>{data.title || ''} {data.forename} {data.surname}</Text>
            {data.addressLine1 && <Text style={styles.text}>{data.addressLine1}</Text>}
            {data.addressLine2 && <Text style={styles.text}>{data.addressLine2}</Text>}
            {data.addressLine3 && <Text style={styles.text}>{data.addressLine3}</Text>}
            {data.addressLine4 && <Text style={styles.text}>{data.addressLine4}</Text>}
            {data.eircode && <Text style={styles.text}>Eircode: {data.eircode}</Text>}
            {data.country && <Text style={styles.text}>{data.country}</Text>}
          </View>

          {/* Member Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Member Details</Text>
            {data.personalEmail && <Text style={styles.text}>Email: {data.personalEmail}</Text>}
            {data.workEmail && <Text style={styles.text}>Work Email: {data.workEmail}</Text>}
            {data.mobileNo && <Text style={styles.text}>Mobile: {data.mobileNo}</Text>}
            {data.homeWorkTelNo && <Text style={styles.text}>Tel: {data.homeWorkTelNo}</Text>}
            {data.nmbiNumber && <Text style={styles.text}>NMBI Number: {data.nmbiNumber}</Text>}
          </View>
        </View>

        {/* Professional Information */}
        {(data.membershipCategory || data.membershipCategoryName || data.grade || data.workLocation) && (
          <View style={[styles.section, { backgroundColor: '#f9fafb', padding: 12, borderRadius: 4, border: '1px solid #e5e7eb' }]}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            <View style={styles.row}>
              <View style={styles.column}>
                {(data.membershipCategory || data.membershipCategoryName) && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={[styles.text, styles.bold]}>Membership Category:</Text>
                    <Text style={styles.text}>{getMembershipCategoryLabel(data)}</Text>
                  </View>
                )}
                {data.workLocation && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={[styles.text, styles.bold]}>Work Location:</Text>
                    <Text style={styles.text}>{data.workLocation}</Text>
                  </View>
                )}
              </View>
              <View style={styles.column}>
                {data.grade && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={[styles.text, styles.bold]}>Grade:</Text>
                    <Text style={styles.text}>{data.grade}</Text>
                  </View>
                )}
                {data.branch && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={[styles.text, styles.bold]}>Branch:</Text>
                    <Text style={styles.text}>{data.branch}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={styles.text}>
            {data.paymentData?.paymentMethod === 'card' ? 'Credit Card' : data.paymentData?.paymentMethod || 'Credit Card'}
          </Text>
        </View>

        {/* Payment Details Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, styles.tableHeaderText]}>Description</Text>
            <Text style={[styles.tableColHeaderAmount, styles.tableHeaderText, { textAlign: 'right' }]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={[styles.tableText, styles.bold]}>Membership Subscription</Text>
              {(data.membershipCategory || data.membershipCategoryName) && (
                <Text style={[styles.tableText, { fontSize: 9, color: '#666', marginTop: 2 }]}>
                  {getMembershipCategoryLabel(data)}
                </Text>
              )}
            </View>
            <Text style={[styles.tableColAmount, styles.tableText, { textAlign: 'right' }]}>
              {formatAmount(data.paymentData?.total)}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.tableTotalRow]}>
            <Text style={[styles.tableCol, styles.tableHeaderText]}>Total Due</Text>
            <Text style={[styles.tableColAmount, { fontSize: 12, fontWeight: 'bold', textAlign: 'right', color: '#4f46e5' }]}>
              {formatAmount(data.paymentData?.total)}
            </Text>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={[styles.text, styles.bold]}>Authorized Signature:</Text>
          <View style={{ borderBottom: '1px solid #444', width: 250, marginTop: 16 }}></View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your payment. This is an official receipt for your records.</Text>
          <Text style={{ marginTop: 4 }}>For any queries, please contact the membership office.</Text>
        </View>
      </Page>
    </Document>
  );
};


export default Receipt; 