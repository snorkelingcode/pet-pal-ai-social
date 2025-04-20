import React, { useState, useEffect } from 'react';
import { Post, Comment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import PostCardBase from './PostCardBase';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface PostCardProps {
  post: Post;
  comments: Comment[];
  isReadOnly?: boolean;
}

const PostCard = ({ post, comments, isReadOnly = false }: PostCardProps) => {
  const { user } = useAuth();
  const [currentPetId, setCurrentPetId] = useState<string | undefined>();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const commentChannel = supabase
      .channel(`post-comments-${post.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `post_id=eq.${post.id}`
        }, 
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, [post.id, queryClient]);
  
  useEffect(() => {
    if (user) {
      const fetchUserPet = async () => {
        try {
          const { data: petProfile } = await supabase
            .from('pet_profiles')
            .select('id')
            .eq('owner_id', user.id)
            .limit(1)
            .single();
            
          if (petProfile) {
            setCurrentPetId(petProfile.id);
          }
        } catch (error) {
          console.error("Error fetching user's pet profile:", error);
        }
      };
      
      fetchUserPet();
    }
  }, [user]);
  
  if (!user && isReadOnly) {
    return (
      <div onClick={() => {}} className="w-full max-w-[600px] md:p-4 p-3 mb-4 bg-card rounded-lg shadow-sm border relative mx-auto">
        <div className="flex items-start mb-3">
          <img 
            src={post.petProfile.profilePicture || '/placeholder.svg'} 
            alt={post.petProfile.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-petpal-blue"
          />
          <div className="ml-3 flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{post.petProfile.name}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground">@{post.petProfile.handle}</p>
              <span className="text-xs text-muted-foreground">•</span>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
        
        <p className="mb-3 text-base break-words">{post.content}</p>
        
        {post.image && (
          <div className="mb-3 rounded-md overflow-hidden">
            <img src={post.image} alt="Post image" className="w-full object-cover" />
          </div>
        )}
        
        <div className="flex items-center justify-between text-muted-foreground text-sm mt-2 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{comments.length || post.comments}</span>
          </div>
          <Link 
            to="/login" 
            className="text-petpal-blue hover:underline text-sm whitespace-nowrap ml-auto"
          >
            Sign in to interact
          </Link>
        </div>
        
        {comments.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-sm font-medium mb-2">Top Comments</p>
            {comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="flex items-start mb-3">
                <img 
                  src={comment.petProfile?.profilePicture || comment.userProfile?.avatarUrl || '/placeholder.svg'}
                  alt={comment.petProfile?.name || comment.userProfile?.username || comment.authorName || 'Anonymous'}
                  className="w-8 h-8 rounded-full object-cover border border-petpal-blue flex-shrink-0"
                />
                <div className="ml-2 flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {comment.petProfile?.name || comment.userProfile?.username || comment.authorName || 'Anonymous'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 flex-wrap">
                    <span>@{comment.petProfile?.handle || comment.userProfile?.handle || comment.authorHandle || 'user'}</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-sm break-words">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length > 2 && (
              <Link 
                to="/login" 
                className="text-petpal-blue hover:underline text-sm inline-block"
              >
                Sign in to see more comments
              </Link>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return <PostCardBase post={post} comments={comments} currentPetId={currentPetId} />;
};

export default PostCard;
