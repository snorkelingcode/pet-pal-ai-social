
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Index from './Index';
import Profile from './Profile';
import Messages from './Messages';
import Notifications from './Notifications';
import Favorites from './Favorites';
import Settings from './Settings';
import OwnerProfile from './OwnerProfile';
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';

type SectionType = 'feed' | 'profile' | 'messages' | 'notifications' | 'favorites' | 'settings' | 'owner-profile';

export const MainPageContext = React.createContext<{
  activeSection: SectionType;
}>({
  activeSection: 'feed'
});

const MainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const petIdFromParams = params.petId;
  
  const getInitialSection = (): SectionType => {
    const pathname = location.pathname.toLowerCase();
    
    // Determine section based on route
    if (pathname === '/') return 'feed';
    if (pathname === '/profile') return 'owner-profile';
    if (pathname === '/messages') return 'messages';
    if (pathname === '/notifications') return 'notifications';
    if (pathname === '/settings') return 'settings';
    
    // If we're on a pet profile URL, default to the profile section
    if (pathname.startsWith('/pet/')) {
      return 'profile';
    }
    
    // Fallback to hash-based routing if no path match
    const hash = location.hash.replace('#', '') as SectionType;
    return ['feed', 'profile', 'messages', 'notifications', 'favorites', 'settings', 'owner-profile'].includes(hash) 
      ? hash 
      : 'feed';
  };
  
  const [activeSection, setActiveSection] = useState<SectionType>(getInitialSection());
  
  // Effect to update section when URL pathname changes
  useEffect(() => {
    setActiveSection(getInitialSection());
  }, [location.pathname, petIdFromParams]);
  
  const changeSection = (section: SectionType) => {
    setActiveSection(section);
    
    // Update URL based on section
    switch(section) {
      case 'feed':
        navigate('/');
        break;
      case 'owner-profile':
        navigate('/profile');
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'profile':
        if (petIdFromParams) {
          navigate(`/pet/${petIdFromParams}`);
        } else {
          // If no pet ID, show a fallback
          navigate('/');
        }
        break;
      default:
        navigate(`/#${section}`);
        break;
    }
  };
  
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
  
  const contextValue = {
    activeSection
  };
  
  return (
    <MainPageContext.Provider value={contextValue}>
      <Layout onSectionChange={changeSection} activeSection={activeSection}>
        {renderContent()}
      </Layout>
    </MainPageContext.Provider>
  );
};

export default MainPage;
