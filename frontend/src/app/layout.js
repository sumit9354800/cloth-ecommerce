import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ReduxProvider } from '@/redux/provider';


import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FashionStore - Your Style Destination',
  description: 'Premium clothing e-commerce store with latest fashion trends',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
       <meta
  name="format-detection"
  content="telephone=no, date=no, email=no, address=no"
/>
        <ReduxProvider>
          <div className="flex flex-col min-h-screen bg-light dark:bg-dark">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}