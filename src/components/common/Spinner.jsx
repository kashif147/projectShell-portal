import React from 'react';
import { BeatLoader } from 'react-spinners';

const Spinner = ({ size = 20, color = '#C0C0C0', loading = true }) => {
  return (
    <div style={styles.container}>
      <BeatLoader size={size} color={color} loading={loading} />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
};

export default Spinner;
