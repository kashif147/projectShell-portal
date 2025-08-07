import React, { forwardRef } from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    padding: 32,
    fontFamily: 'Helvetica',
    color: '#222',
    width: 600,
  },
  header: {
    borderBottom: '4px solid #1a3a5d',
    marginBottom: 24,
    paddingBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 24,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '50%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '50%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  signature: {
    marginTop: 32,
  },
});

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

export const ReceiptPDF = ({ data }) => (
  <Document>
    <Page size={{ width: 600, height: 842 }} style={styles.page}>
      <View style={styles.header}>
        <Text style={{ fontSize: 20 }}>Payment Due Receipt</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.bold}>Bill To:</Text>
        <Text>{data.forename} {data.surname}</Text>
        {data.addressLine1 && <Text>{data.addressLine1}</Text>}
        {data.addressLine3 && <Text>{data.addressLine3}, </Text>}
        {data.addressLine4 && <Text>{data.addressLine4}</Text>}
        <Text>{data.personalEmail}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.bold}>Payment Method:</Text>
        <Text>{data.paymentData?.paymentMethod === 'card' ? 'Credit Card' : data.paymentData?.paymentMethod}</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Description</Text>
          <Text style={styles.tableColHeader}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCol}>Membership Subscription</Text>
          <Text style={styles.tableCol}>${data.paymentData?.total}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCol, styles.bold]}>Total Due</Text>
          <Text style={[styles.tableCol, styles.bold]}>${data.paymentData?.total}</Text>
        </View>
      </View>
      <View style={styles.signature}>
        <Text style={styles.bold}>Authorized Signature:</Text> ___________________________
      </View>
    </Page>
  </Document>
);

export default Receipt; 