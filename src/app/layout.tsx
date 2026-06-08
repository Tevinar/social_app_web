import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Social App Web',
  description: 'This is a demo app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
