
import React, { useState, useEffect, useCallback } from 'react';
import { Post, Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircleReply, Share, User } from 'lucide-react';
import { usePostInteractions } from '@/hooks/use-post-interactions';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CommentItem from './CommentItem';
import { petAIService } from '@/services/petAIService';
import { toast } from '@/components/ui/use-toast';

interface PostCardBaseProps {
  post: Post;
  comments: Comment[];
  currentPetId?: string;
}

const PostCardBase = ({ post, comments, currentPetId }: PostCardBaseProps) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<number>(post.likes);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const { user } = useAuth();
  const { hasLiked, toggleLike, addComment, isSubmittingComment } = usePostInteractions(post.id, currentPetId);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);
  
  useEffect(() => {
    setOptimisticLikeCount(post.likes);
  }, [post.likes]);

  useEffect(() => {
    const channel = supabase
      .channel('public:comments')
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
      supabase.removeChannel(channel);
    };
  }, [post.id, queryClient]);

  useEffect(() => {
    const channel = supabase
      .channel('public:post_interactions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'post_interactions',
          filter: `post_id=eq.${post.id}`
        }, 
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['post-like', post.id] });
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, queryClient]);

  useEffect(() => {
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'posts',
          filter: `id=eq.${post.id}`
        }, 
        (payload) => {
          if (payload.new && 'likes' in payload.new) {
            setOptimisticLikeCount(payload.new.likes as number);
          }
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, queryClient]);

  const handleLike = async () => {
    setOptimisticLikeCount(prevCount => hasLiked ? prevCount - 1 : prevCount + 1);
    
    try {
      toggleLike.mutate();
    } catch (error) {
      setOptimisticLikeCount(post.likes);
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    
    addComment.mutate(commentText, {
      onSuccess: (newComment: any) => {
        setCommentText('');
        setIsCommenting(false);
        
        if (newComment) {
          const updatedComments = [...localComments, {
            id: newComment.id || `temp-${Date.now()}`,
            postId: post.id,
            userId: user?.id,
            content: commentText,
            likes: 0,
            createdAt: new Date().toISOString(),
            userProfile: {
              id: newComment.userProfile?.id || user?.id || '',
              username: newComment.userProfile?.username || user?.username || 'User',
              avatarUrl: newComment.userProfile?.avatarUrl || user?.avatarUrl,
              handle: newComment.userProfile?.handle || user?.email?.split('@')[0] || 'user'
            }
          }];
          setLocalComments(updatedComments as Comment[]);
          
          // Generate AI pet response if the comment is not by the post author's pet
          if (currentPetId && currentPetId !== post.petId) {
            generatePetResponse(commentText);
          }
        }
      }
    });
  };

  const generatePetResponse = async (commentContent: string) => {
    if (!post.petId) return;
    
    setIsGeneratingResponse(true);
    
    try {
      const response = await petAIService.generateMessage(post.petId, currentPetId || '', commentContent);
      
      if (response) {
        // Create a comment from the post owner's pet in response
        const { data: newComment, error } = await supabase
          .from('comments')
          .insert({
            post_id: post.id,
            content: response,
            pet_id: post.petId
          })
          .select(`
            id, 
            content, 
            created_at, 
            likes,
            pet_id,
            pet_profile:pet_id (id, name, profile_picture, handle)
          `)
          .single();
          
        if (error) throw error;
        
        // No need to manually update localComments as the realtime subscription will handle it
      }
    } catch (error) {
      console.error("Error generating pet response:", error);
      toast({
        title: "Error",
        description: "The pet couldn't respond to your comment right now.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleCommentReply = (content: string, parentCommentId: string) => {
    if (!content.trim()) return;
    
    addComment.mutate(content, {
      onSuccess: (newComment: any) => {
        if (newComment) {
          const updatedComments = [...localComments, {
            id: newComment.id || `temp-${Date.now()}`,
            postId: post.id,
            userId: user?.id,
            content: content,
            likes: 0,
            createdAt: new Date().toISOString(),
            userProfile: {
              id: newComment.userProfile?.id || user?.id || '',
              username: newComment.userProfile?.username || user?.username || 'User',
              avatarUrl: newComment.userProfile?.avatarUrl || user?.avatarUrl,
              handle: newComment.userProfile?.handle || user?.email?.split('@')[0] || 'user'
            }
          }];
          setLocalComments(updatedComments as Comment[]);
          
          // Also generate a pet response to replies
          if (currentPetId && currentPetId !== post.petId) {
            generatePetResponse(content);
          }
        }
      }
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-[600px] p-4 mb-4 bg-card rounded-lg shadow-sm border relative">
      <div className="flex items-start mb-3">
        <Avatar>
          <AvatarImage 
            src={post.petProfile.profilePicture || '/placeholder.svg'} 
            alt={post.petProfile.name}
          />
          <AvatarFallback>{post.petProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-semibold text-base">{post.petProfile.name}</h3>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">@{post.petProfile.handle}</p>
            <span className="text-xs text-muted-foreground">•</span>
            <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </div>
      
      <p className="mb-3 text-base">{post.content}</p>
      
      {post.image && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img src={post.image} alt="Post image" className="w-full object-cover" />
        </div>
      )}
      
      <div className="flex items-center justify-between mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={hasLiked ? "text-red-500" : "text-muted-foreground"} 
          onClick={handleLike}
          disabled={!currentPetId || toggleLike.isPending}
        >
          <Heart className="mr-1 h-4 w-4" fill={hasLiked ? "currentColor" : "none"} /> {optimisticLikeCount}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground"
          onClick={() => setIsCommenting(!isCommenting)}
        >
          <MessageCircleReply className="mr-1 h-4 w-4" /> {localComments.length}
        </Button>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Share className="mr-1 h-4 w-4" /> Share
        </Button>
      </div>
      
      {(isCommenting || localComments.length > 0) && (
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm font-medium mb-2">Comments</p>
          
          {isCommenting && (
            <div className="flex flex-col mb-3">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="mb-2"
                disabled={!user || isSubmittingComment}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCommenting(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleComment}
                  disabled={!commentText.trim() || !user || isSubmittingComment}
                >
                  Post as {user ? user.username : 'User'}
                </Button>
              </div>
            </div>
          )}
          
          {isGeneratingResponse && (
            <div className="my-3 p-3 bg-muted/30 rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground animate-pulse">
                {post.petProfile.name} is thinking of a response...
              </p>
            </div>
          )}
          
          {localComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentPetId={currentPetId}
              onReply={handleCommentReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCardBase;
