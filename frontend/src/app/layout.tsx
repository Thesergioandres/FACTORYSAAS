import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FACTORY SAAS',
  description: 'Enterprise POS & Inventory System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
