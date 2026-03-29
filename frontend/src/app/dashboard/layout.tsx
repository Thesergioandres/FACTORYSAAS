import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
         <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-(--primary) shadow-sm"></div>
            <span className="font-bold text-[1.1rem] tracking-tight text-zinc-900">FACTORY <span className="text-(--primary)">SaaS</span></span>
         </div>
      </header>
      <main className="flex-1 overflow-auto bg-zinc-50 flex flex-col">
         {children}
      </main>
    </div>
  );
}
