import React from 'react';
import { LookupProvider } from './lookupContext';

export const ContextProvider = ({ children }) => {
  return <LookupProvider>{children}</LookupProvider>;
};
