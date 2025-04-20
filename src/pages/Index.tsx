
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoggedInFeed from '@/components/LoggedInFeed';
import LoggedOutFeed from '@/components/LoggedOutFeed';
import HeaderCard from '@/components/HeaderCard';
import usePostFeed from '@/hooks/use-feed-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { Comment } from '@/types';
import { commentService } from '@/services/commentService';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const { user } = useAuth();
  const { posts, loading, refreshFeed } = usePostFeed();
  const isMobile = useIsMobile();
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<string>("for-you");

  // Fetch comments for all posts in the feed
  useEffect(() => {
    const fetchComments = async () => {
      if (posts && posts.length > 0) {
        try {
          // Using the existing comment service for better type safety
          const allCommentsPromises = posts.map(post => commentService.getPostComments(post.id));
          const allCommentsArrays = await Promise.all(allCommentsPromises);
          
          // Flatten the array of comment arrays into a single array
          const allComments = allCommentsArrays.flat();
          setComments(allComments);
        } catch (err) {
          console.error('Error fetching comments:', err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load comments. Please try again later."
          });
        }
      }
    };

    if (posts.length > 0) {
      fetchComments();
    }
  }, [posts]);

  // Refresh the feed when the component mounts or when user auth state changes
  useEffect(() => {
    refreshFeed();
  }, [user]);
  
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
