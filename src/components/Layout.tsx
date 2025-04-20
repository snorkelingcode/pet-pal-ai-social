import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import RightSidebar from './RightSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bell } from 'lucide-react';

type SectionType = 'feed' | 'profile' | 'messages' | 'notifications' | 'favorites' | 'owner-profile';

interface LayoutProps {
  children: React.ReactNode;
  hideRightSidebar?: boolean;
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

const Layout = ({ 
  children, 
  hideRightSidebar = false, 
  activeSection, 
  onSectionChange 
}: LayoutProps) => {
  const isMobile = useIsMobile();
  const { user, isLoading } = useAuth();
  const [authReady, setAuthReady] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      setAuthReady(true);
    }
  }, [isLoading]);

  const handleNavigation = (section: SectionType) => {
    onSectionChange(section);
  };

  return (
    <div className="min-h-screen bg-background paw-print-bg flex justify-center">
      <div className="flex w-full max-w-[1200px] px-4 relative">
        {!isMobile && <div className="flex-none w-[275px]">
          <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
        </div>}
        
        <main className={`flex-1 p-4 flex justify-center ${isMobile ? 'w-full px-2' : ''}`}>
          <div className={`w-full ${!hideRightSidebar && !isMobile ? 'max-w-[600px]' : ''}`}>
            {children}
          </div>
          {!isMobile && !hideRightSidebar && <RightSidebar />}
        </main>
        
        {authReady && isMobile && user && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background border-t z-10">
            <div className="flex justify-around items-center py-3">
              <button 
                onClick={() => handleNavigation('feed')}
                className={`flex flex-col items-center p-1 ${activeSection === 'feed' ? 'text-petpal-blue' : 'text-muted-foreground'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </button>
              <button 
                onClick={() => handleNavigation('profile')}
                className={`flex flex-col items-center p-1 ${activeSection === 'profile' ? 'text-petpal-blue' : 'text-muted-foreground'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"></circle>
                  <path d="M20 21a8 8 0 1 0-16 0"></path>
                </svg>
              </button>
              <button 
                onClick={() => handleNavigation('messages')}
                className={`flex flex-col items-center p-1 ${activeSection === 'messages' ? 'text-petpal-blue' : 'text-muted-foreground'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
              <button 
                onClick={() => handleNavigation('notifications')}
                className={`flex flex-col items-center p-1 ${activeSection === 'notifications' ? 'text-petpal-blue' : 'text-muted-foreground'}`}
              >
                <Bell className="h-6 w-6" />
              </button>
              <button 
                onClick={() => handleNavigation('favorites')}
                className={`flex flex-col items-center p-1 ${activeSection === 'favorites' ? 'text-petpal-blue' : 'text-muted-foreground'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </button>
              <button 
                onClick={() => handleNavigation('owner-profile')}
                className={`flex flex-col items-center p-1 ${activeSection === 'owner-profile' ? 'text-petpal-blue' : 'text-muted-foreground'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-xs mt-0.5">Owner</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
