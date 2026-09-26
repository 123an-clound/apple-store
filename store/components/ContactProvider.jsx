'use client';

import { createContext, useContext } from 'react';
import { buildContact } from '@/lib/constants';

const ContactContext = createContext(buildContact());

export function ContactProvider({ value, children }) {
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact() {
  return useContext(ContactContext);
}
