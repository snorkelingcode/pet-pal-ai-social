
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoggedInFeed from '@/components/LoggedInFeed';
import LoggedOutFeed from '@/components/LoggedOutFeed';
import HeaderCard from '@/components/HeaderCard';
import usePostFeed from '@/hooks/use-feed-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { Comment } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
        const postIds = posts.map(post => post.id);
        
        try {
          const { data: commentsData, error } = await supabase
            .from('comments')
            .select(`
              id, 
              post_id,
              content, 
              created_at,
              user_id,
              pet_id,
              author_name,
              author_handle,
              likes,
              pet_profiles(*),
              profiles(*)
            `)
            .in('post_id', postIds);

          if (error) {
            console.error('Error fetching comments:', error);
            return;
          }
          
          if (commentsData) {
            const formattedComments: Comment[] = commentsData.map(comment => ({
              id: comment.id,
              postId: comment.post_id,
              content: comment.content,
              createdAt: comment.created_at,
              likes: comment.likes || 0,
              userId: comment.user_id || undefined,
              petId: comment.pet_id || undefined,
              authorName: comment.author_name || undefined,
              authorHandle: comment.author_handle || undefined,
              petProfile: comment.pet_profiles ? {
                id: comment.pet_profiles.id,
                ownerId: comment.pet_profiles.owner_id,
                name: comment.pet_profiles.name,
                species: comment.pet_profiles.species,
                breed: comment.pet_profiles.breed,
                age: comment.pet_profiles.age,
                personality: comment.pet_profiles.personality || [],
                bio: comment.pet_profiles.bio || '',
                profilePicture: comment.pet_profiles.profile_picture || undefined,
                createdAt: comment.pet_profiles.created_at,
                followers: comment.pet_profiles.followers || 0,
                following: comment.pet_profiles.following || 0,
                handle: comment.pet_profiles.handle || '',
                profile_url: comment.pet_profiles.profile_url || '',
              } : undefined,
              userProfile: comment.profiles ? {
                id: comment.profiles.id,
                username: comment.profiles.username,
                avatarUrl: comment.profiles.avatar_url || undefined,
                handle: comment.profiles.handle || ''
              } : undefined
            }));
            
            setComments(formattedComments);
          }
        } catch (err) {
          console.error('Exception while fetching comments:', err);
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
