
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoggedInFeed from '@/components/LoggedInFeed';
import LoggedOutFeed from '@/components/LoggedOutFeed';
import HeaderCard from '@/components/HeaderCard';
import usePostFeed from '@/hooks/use-feed-data';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <>
      <HeaderCard 
        title="PetPal AI" 
        subtitle={user ? "Your social network for pets" : "Join the social network for pets"}
      />
      
      {user ? (
        <LoggedInFeed />
      ) : (
        <LoggedOutFeed />
      )}
    </>
  );
};

export default Index;
