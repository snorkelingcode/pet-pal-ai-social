import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Index from './Index';
import Profile from './Profile';
import Messages from './Messages';
import Notifications from './Notifications';
import Favorites from './Favorites';
import OwnerProfile from './OwnerProfile';
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';

type SectionType = 'feed' | 'profile' | 'messages' | 'notifications' | 'favorites' | 'owner-profile';

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
    const hash = location.hash.replace('#', '') as SectionType;
    // If we're on a pet profile URL, default to the profile section
    if (petIdFromParams) {
      return 'profile';
    }
    return ['feed', 'profile', 'messages', 'notifications', 'favorites', 'owner-profile'].includes(hash) 
      ? hash 
      : 'feed';
  };
  
  const [activeSection, setActiveSection] = useState<SectionType>(getInitialSection());
  
  // Effect to update section when URL params change
  useEffect(() => {
    if (petIdFromParams) {
      setActiveSection('profile');
    }
  }, [petIdFromParams]);
  
  const changeSection = (section: SectionType) => {
    setActiveSection(section);
    // If we're on a pet profile URL, maintain that in the hash navigation
    if (petIdFromParams) {
      navigate(`/pet/${petIdFromParams}#${section}`);
    } else {
      const petId = searchParams.get('petId');
      const newHash = `#${section}`;
      if (petId) {
        navigate(`${location.pathname}?petId=${petId}${newHash}`);
      } else {
        navigate(`${location.pathname}${newHash}`);
      }
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
