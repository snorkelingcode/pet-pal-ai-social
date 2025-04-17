
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoggedInFeed from '@/components/LoggedInFeed';
import LoggedOutFeed from '@/components/LoggedOutFeed';
import HeaderCard from '@/components/HeaderCard';
import usePostFeed from '@/hooks/use-feed-data';
import { useMobile } from '@/hooks/use-mobile';
import { Comment } from '@/types';

const Index = () => {
  const { user } = useAuth();
  const { posts, loading } = usePostFeed();
  const isMobile = useMobile();
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<string>("for-you");

  // Initial empty array for comments - in a real app, we'd fetch them
  useEffect(() => {
    setComments([]);
  }, []);
  
  return (
    <>
      <HeaderCard 
        title="PetPal AI" 
        subtitle={user ? "Your social network for pets" : "Join the social network for pets"}
      />
      
      {user ? (
        <LoggedInFeed 
          posts={posts} 
          comments={comments} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      ) : (
        <LoggedOutFeed 
          posts={posts} 
          comments={comments}
          isMobile={isMobile}
        />
      )}
    </>
  );
};

export default Index;
