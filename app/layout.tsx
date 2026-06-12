import type { Metadata } from 'next';
import { Kantumruy_Pro } from 'next/font/google';
import './globals.css';

// Load beautiful Khmer Kantumruy Pro font
const kantumruy = Kantumruy_Pro({
  subsets: ['khmer', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kantumruy',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SecureAttend - ប្រព័ន្ធវត្តមាន និងបើកប្រាក់បៀវត្សរ៍',
  description: 'SecureAttend - Multi-Tenant Automated Employee Geofence, AI Face Match, QR, and NFC Attendance System with Khmer Localized UI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" className={`${kantumruy.variable}`}>
      <body className="font-kantumruy antialiased bg-slate-900 text-slate-100 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
