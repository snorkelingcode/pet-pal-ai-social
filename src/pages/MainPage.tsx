
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Index from './Index';
import Profile from './Profile';
import Messages from './Messages';
import Notifications from './Notifications';
import Favorites from './Favorites';
import Settings from './Settings';
import OwnerProfile from './OwnerProfile';
import { useLocation, useNavigate } from 'react-router-dom';

type SectionType = 'feed' | 'profile' | 'messages' | 'notifications' | 'favorites' | 'settings' | 'owner-profile';

// Define a context to share section information with child components
export const MainPageContext = React.createContext<{
  activeSection: SectionType;
}>({
  activeSection: 'feed'
});

const MainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract section from URL hash if present, default to feed
  const getInitialSection = (): SectionType => {
    const hash = location.hash.replace('#', '') as SectionType;
    return ['feed', 'profile', 'messages', 'notifications', 'favorites', 'settings', 'owner-profile'].includes(hash) 
      ? hash 
      : 'feed';
  };
  
  const [activeSection, setActiveSection] = useState<SectionType>(getInitialSection());
  
  // Update URL hash when section changes
  const changeSection = (section: SectionType) => {
    setActiveSection(section);
    navigate(`/#${section}`, { replace: true });
  };
  
  // Render the appropriate component based on activeSection
  const renderContent = () => {
    switch(activeSection) {
      case 'feed':
        return <Index />;
      case 'profile':
        return <Profile />;
      case 'messages':
        return <Messages />;
      case 'notifications':
        return <Notifications />;
      case 'favorites':
        return <Favorites />;
      case 'settings':
        return <Settings />;
      case 'owner-profile':
        return <OwnerProfile />;
      default:
        return <Index />;
    }
  };
  
  // Provide context value to child components
  const contextValue = {
    activeSection
  };
  
  // Pass the section change handler to Layout
  return (
    <MainPageContext.Provider value={contextValue}>
      <Layout onSectionChange={changeSection} activeSection={activeSection}>
        {renderContent()}
      </Layout>
    </MainPageContext.Provider>
  );
};

export default MainPage;
