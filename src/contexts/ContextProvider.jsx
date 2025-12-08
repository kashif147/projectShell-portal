import React from 'react';
import { LookupProvider } from './lookupContext';
import { ApplicationProvider } from './applicationContext';
import { ProfileProvider } from './profileContext';

export const ContextProvider = ({ children }) => {
  return (
    <LookupProvider>
      <ApplicationProvider>
        <ProfileProvider>{children}</ProfileProvider>
      </ApplicationProvider>
    </LookupProvider>
  );
};
