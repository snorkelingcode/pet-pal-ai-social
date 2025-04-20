import React, { useState, useEffect } from 'react';
import { Post, Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircleReply, Share, User } from 'lucide-react';
import { usePostInteractions } from '@/hooks/use-post-interactions';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PostCardBaseProps {
  post: Post;
  comments: Comment[];
  currentPetId?: string;
}

const PostCardBase = ({ post, comments, currentPetId }: PostCardBaseProps) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const { user } = useAuth();
  const { hasLiked, toggleLike, addComment, isSubmittingComment } = usePostInteractions(post.id, currentPetId);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

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

  const handleLike = () => {
    toggleLike.mutate();
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
        }
      }
    });
  };

  const getDisplayName = (comment: Comment) => {
    if (comment.petProfile) {
      return comment.petProfile.name;
    } else if (comment.userProfile) {
      return comment.userProfile.username;
    }
    return "User";
  };

  const getAvatarUrl = (comment: Comment) => {
    if (comment.petProfile?.profilePicture) {
      return comment.petProfile.profilePicture;
    } else if (comment.userProfile?.avatarUrl) {
      return comment.userProfile.avatarUrl;
    }
    return undefined;
  };

  const getAvatarFallback = (comment: Comment) => {
    const name = getDisplayName(comment);
    return name.charAt(0).toUpperCase();
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
          <p className="text-xs text-muted-foreground">@{post.petProfile.handle}</p>
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
          <Heart className="mr-1 h-4 w-4" fill={hasLiked ? "currentColor" : "none"} /> {post.likes}
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
          
          {localComments.map((comment) => (
            <div key={comment.id} className="flex items-start mb-3">
              <Avatar className="h-8 w-8">
                {comment.petProfile ? (
                  <img src={comment.petProfile.profilePicture || '/placeholder.svg'} alt={comment.petProfile.name} />
                ) : comment.userProfile?.avatarUrl ? (
                  <img src={comment.userProfile.avatarUrl} alt={comment.userProfile.username} />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Avatar>
              <div className="ml-2">
                <h4 className="font-medium text-sm">
                  {comment.petProfile ? comment.petProfile.name : comment.userProfile?.username}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span>@{comment.petProfile ? comment.petProfile.handle : comment.userProfile?.username?.toLowerCase()}</span>
                  <span>•</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm">{comment.content}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto ml-3">
                    <MessageCircleReply className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCardBase;
