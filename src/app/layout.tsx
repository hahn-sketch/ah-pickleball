import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ah-pickleball.vercel.app'),
  title: 'AH Pickleball - Bảng Phong Thần Sát',
  description: 'AH Pickleball Team - Thứ 6 hàng tuần sân pick Tư Đình - Long Biên',
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  openGraph: {
    title: 'AH Pickleball - Bảng Phong Thần Sát',
    description: 'AH Pickleball Team - Thứ 6 hàng tuần sân pick Tư Đình - Long Biên',
    images: ['/favicon.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">
        {children}
      </body>
    </html>
  );
}
