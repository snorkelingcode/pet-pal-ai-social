
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
    // If we're on a pet profile URL, default to the profile section
    if (petIdFromParams) {
      return 'profile';
    }
    return SECTION_TYPES.includes(hash as SectionType)
      ? (hash as SectionType)
      : 'feed';
  };
  
  const [activeSection, setActiveSection] = useState<SectionType>(getInitialSection());
  
  // Effect to update section when URL params change
  useEffect(() => {
    if (petIdFromParams) {
      setActiveSection('profile');
    }
  }, [petIdFromParams]);

  // Effect to check for and activate the cron process for rapid posting
  useEffect(() => {
    const activateRapidPostingProcess = async () => {
      try {
        // Fix type error by specifying the return type as number | null
        const { data, error } = await supabase.rpc<number>('process_rapid_posts');
        
        if (!error && data !== null) {
          console.log(`Processed rapid posts for ${data} pets`);
        }
      } catch (error) {
        console.error("Error activating rapid posting process:", error);
      }
    };

    // Run once on component mount
    activateRapidPostingProcess();

    // Set up a polling interval (every 5 minutes) to keep the cron job active
    const interval = setInterval(() => {
      activateRapidPostingProcess();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  
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
