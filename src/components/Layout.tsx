
import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import RightSidebar from './RightSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background paw-print-bg flex">
      <Sidebar />
      <main className={`flex-1 ${!isMobile ? 'ml-72' : ''} p-4 flex justify-center`}>
        <div className="w-full max-w-[600px]">{children}</div>
        {!isMobile && <RightSidebar />}
      </main>
    </div>
  );
};

export default Layout;
