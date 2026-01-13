import React from 'react';
import { LookupProvider } from './lookupContext';
import { ApplicationProvider } from './applicationContext';
import { ProfileProvider } from './profileContext';
import { NotificationProvider } from './notificationContext';

export const ContextProvider = ({ children }) => {
  return (
    <LookupProvider>
      <ApplicationProvider>
        <ProfileProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </ProfileProvider>
      </ApplicationProvider>
    </LookupProvider>
  );
};
