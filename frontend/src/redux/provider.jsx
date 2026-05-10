'use client'; // Ye Next.js ko batata hai ki yeh client-side code hai

import { Provider } from 'react-redux';
import { store } from './store';

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}