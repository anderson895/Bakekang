import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/toaster';

export const metadata: Metadata = {
  title: 'Brgy. Bakakeng — Document Management System',
  description: 'Official Barangay Bakakeng Document Request and Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
