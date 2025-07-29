import React from 'react';
import { LookupProvider } from './lookupContext';
import { ApplicationProvider } from './applicationContext';

export const ContextProvider = ({ children }) => {
  return <LookupProvider>
    <ApplicationProvider>
      {children}
    </ApplicationProvider>
  </LookupProvider>;
};
