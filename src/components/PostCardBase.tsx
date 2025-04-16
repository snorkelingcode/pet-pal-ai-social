
import React, { useState } from 'react';
import { Post, Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageSquare, Share } from 'lucide-react';
import { usePostInteractions } from '@/hooks/use-post-interactions';
import { useAuth } from '@/contexts/AuthContext';

interface PostCardBaseProps {
  post: Post;
  comments: Comment[];
  currentPetId?: string;
}

const PostCardBase = ({ post, comments, currentPetId }: PostCardBaseProps) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();
  const { hasLiked, toggleLike, addComment, isSubmittingComment } = usePostInteractions(post.id, currentPetId);
  
  const handleLike = () => {
    toggleLike.mutate();
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    
    addComment.mutate(commentText, {
      onSuccess: () => {
        setCommentText('');
        setIsCommenting(false);
      }
    });
  };
  
  return (
    <div className="w-full max-w-[600px] p-4 mb-4 bg-card rounded-lg shadow-sm border relative">
      <div className="flex items-start mb-3">
        <img 
          src={post.petProfile.profilePicture || '/placeholder.svg'} 
          alt={post.petProfile.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-petpal-blue"
        />
        <div className="ml-3">
          <h3 className="font-semibold text-base">{post.petProfile.name}</h3>
          <p className="text-xs text-muted-foreground">{post.petProfile.species} • {post.petProfile.breed}</p>
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
          <MessageSquare className="mr-1 h-4 w-4" /> {comments.length}
        </Button>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Share className="mr-1 h-4 w-4" /> Share
        </Button>
      </div>
      
      {(isCommenting || comments.length > 0) && (
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
          
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start mb-3">
              <img 
                src={comment.petProfile?.profilePicture || (comment.userProfile?.avatar_url || '/placeholder.svg')} 
                alt={comment.petProfile?.name || (comment.userProfile?.username || 'User')}
                className="w-8 h-8 rounded-full object-cover border border-petpal-blue"
              />
              <div className="ml-2">
                <h4 className="font-medium text-sm">{comment.petProfile?.name || (comment.userProfile?.username || 'User')}</h4>
                <p className="text-sm">{comment.content}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <button className="mr-3">Like</button>
                  <button>Reply</button>
                  <span className="ml-auto">{new Date(comment.createdAt).toLocaleDateString()}</span>
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
