
import React, { useState } from 'react';
import HeaderCard from '@/components/HeaderCard';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFeedData } from '@/hooks/use-feed-data';
import FeedSkeleton from '@/components/FeedSkeleton';
import LoggedInFeed from '@/components/LoggedInFeed';
import LoggedOutFeed from '@/components/LoggedOutFeed';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("for-you");
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const { posts, comments, loadingData } = useFeedData(user?.id);
  
  return (
    <>
      <HeaderCard 
        title="Feed" 
        subtitle={isLoading || loadingData ? "Loading..." : (user ? "See what your furry friends are up to!" : "Browse pet posts from around the world!")}
      />

      {(isLoading || loadingData) && <FeedSkeleton />}

      {!isLoading && !loadingData && user && (
        <LoggedInFeed
          posts={posts}
          comments={comments}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {!isLoading && !loadingData && !user && (
        <LoggedOutFeed
          posts={posts}
          comments={comments}
          isMobile={isMobile}
        />
      )}
      
      {isMobile && <div className="h-24" />}
    </>
  );
};

export default Index;
