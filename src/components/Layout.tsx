
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
    <div className="min-h-screen bg-background paw-print-bg flex justify-center">
      <div className="flex w-full max-w-[1200px] px-4 relative">
        <div className="flex-none w-[275px]">
          <Sidebar />
        </div>
        <main className={`flex-1 p-4 flex justify-center`}>
          <div className="w-full max-w-[600px]">{children}</div>
          {!isMobile && <RightSidebar />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
