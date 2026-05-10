import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ReduxProvider } from '@/redux/provider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Clothing Store - Buy Latest Fashion',
  description: 'Premium clothing e-commerce store with latest trends',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Redux store pure app mein available hoga */}
        <ReduxProvider>
          {children}
        </ReduxProvider>
        
        {/* Toaster notifications dikhane ke liye */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}