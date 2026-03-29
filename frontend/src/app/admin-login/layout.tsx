import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-zinc-900 via-black to-black text-white">
      {children}
    </div>
  );
}
