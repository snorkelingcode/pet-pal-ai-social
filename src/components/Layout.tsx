
import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import RightSidebar from './RightSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  hideRightSidebar?: boolean;
}

const Layout = ({ children, hideRightSidebar = false }: LayoutProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background paw-print-bg flex justify-center">
      <div className="flex w-full max-w-[1200px] px-4 relative">
        {!isMobile && <div className="flex-none w-[275px]">
          <Sidebar />
        </div>}
        
        <main className={`flex-1 p-4 flex justify-center ${isMobile ? 'w-full' : ''}`}>
          <div className={`w-full ${!hideRightSidebar && !isMobile ? 'max-w-[600px]' : ''}`}>
            {children}
            
            {/* Show authentication prompt for non-logged in users on mobile */}
            {isMobile && !user && (
              <div className="fixed bottom-0 left-0 right-0 bg-background p-4 border-t shadow-lg flex justify-center">
                <Link to="/login" className="mx-2">
                  <button className="bg-petpal-blue text-white px-6 py-2 rounded-full">
                    Log in
                  </button>
                </Link>
                <Link to="/register" className="mx-2">
                  <button className="bg-petpal-pink text-white px-6 py-2 rounded-full">
                    Sign up
                  </button>
                </Link>
              </div>
            )}
          </div>
          {!isMobile && !hideRightSidebar && <RightSidebar />}
        </main>
        
        {/* Mobile bottom navigation */}
        {isMobile && user && (
          <div className="fixed bottom-0 left-0 right-0 bg-petpal-mint/20 border-t z-10">
            <div className="flex justify-around items-center py-3">
              <Link to="/" className={`flex flex-col items-center p-1 ${location.pathname === '/' ? 'text-petpal-blue' : 'text-muted-foreground'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </Link>
              <Link to="/profile" className={`flex flex-col items-center p-1 ${location.pathname === '/profile' ? 'text-petpal-blue' : 'text-muted-foreground'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"></circle>
                  <path d="M20 21a8 8 0 1 0-16 0"></path>
                </svg>
              </Link>
              <Link to="/messages" className={`flex flex-col items-center p-1 ${location.pathname === '/messages' ? 'text-petpal-blue' : 'text-muted-foreground'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </Link>
              <Link to="/notifications" className={`flex flex-col items-center p-1 ${location.pathname === '/notifications' ? 'text-petpal-blue' : 'text-muted-foreground'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
                  <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
                  <path d="M18 8a6 6 0 0 0-9.33-5"></path>
                  <path d="m2 2 20 20"></path>
                </svg>
              </Link>
              <Link to="/favorites" className={`flex flex-col items-center p-1 ${location.pathname === '/favorites' ? 'text-petpal-blue' : 'text-muted-foreground'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
