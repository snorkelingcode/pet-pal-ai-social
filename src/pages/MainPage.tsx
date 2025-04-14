
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
  
  // Pass the section change handler to Layout
  return (
    <Layout onSectionChange={changeSection} activeSection={activeSection}>
      {activeSection === 'feed' && <Index />}
      {activeSection === 'profile' && <Profile />}
      {activeSection === 'messages' && <Messages />}
      {activeSection === 'notifications' && <Notifications />}
      {activeSection === 'favorites' && <Favorites />}
      {activeSection === 'settings' && <Settings />}
      {activeSection === 'owner-profile' && <OwnerProfile />}
    </Layout>
  );
};

export default MainPage;
