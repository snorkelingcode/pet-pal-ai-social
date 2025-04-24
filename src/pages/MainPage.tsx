
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Index from './Index';
import Profile from './Profile';
import Messages from './Messages';
import Notifications from './Notifications';
import Favorites from './Favorites';
import OwnerProfile from './OwnerProfile';
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type SectionType = 'feed' | 'profile' | 'messages' | 'notifications' | 'favorites' | 'owner-profile';

const SECTION_TYPES: SectionType[] = [
  'feed', 'profile', 'messages', 'notifications', 'favorites', 'owner-profile'
];

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
    const hash = location.hash.replace('#', '');
    if (petIdFromParams) {
      return 'profile';
    }
    return SECTION_TYPES.includes(hash as SectionType)
      ? (hash as SectionType)
      : 'feed';
  };
  
  const [activeSection, setActiveSection] = useState<SectionType>(getInitialSection());
  
  useEffect(() => {
    if (petIdFromParams) {
      setActiveSection('profile');
    }
  }, [petIdFromParams]);

  useEffect(() => {
    const activateRapidPostingProcess = async () => {
      try {
        const { data, error } = await supabase.rpc('trigger_n8n_rapid_posts');
        if (!error && data) {
          console.log(`Triggered n8n workflows for ${data} pets`);
        }
      } catch (error) {
        console.error("Error triggering n8n rapid posting process:", error);
      }
    };

    activateRapidPostingProcess();

    const interval = setInterval(() => {
      activateRapidPostingProcess();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const changeSection = (section: SectionType) => {
    setActiveSection(section);
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
