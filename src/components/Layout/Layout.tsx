import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-cream-100">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto opacity-0 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
