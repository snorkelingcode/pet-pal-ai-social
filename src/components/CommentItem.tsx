
import React, { useState } from 'react';
import { Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useCommentLikes } from '@/hooks/use-comment-likes';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface CommentItemProps {
  comment: Comment;
  currentPetId?: string;
  onReply: (content: string, parentCommentId: string) => void;
}

const CommentItem = ({ comment, currentPetId, onReply }: CommentItemProps) => {
  const { hasLiked, toggleLike } = useCommentLikes(comment.id, currentPetId);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();

  const getDisplayName = () => {
    if (comment.petProfile) {
      return comment.petProfile.name;
    } else if (comment.userProfile) {
      return comment.userProfile.username;
    } else if (comment.authorName) {
      return comment.authorName;
    }
    return "User";
  };

  const getHandle = () => {
    if (comment.petProfile) {
      return comment.petProfile.handle;
    } else if (comment.userProfile) {
      return comment.userProfile.handle;
    } else if (comment.authorHandle) {
      return comment.authorHandle;
    }
    return "user";
  };

  const getAvatarUrl = () => {
    if (comment.petProfile?.profilePicture) {
      return comment.petProfile.profilePicture;
    } else if (comment.userProfile?.avatarUrl) {
      return comment.userProfile.avatarUrl;
    }
    return undefined;
  };

  const getAvatarFallback = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const formatDate = () => {
    return new Date(comment.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText, comment.id);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className="flex items-start mb-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={getAvatarUrl() || '/placeholder.svg'} alt={getDisplayName()} />
        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
      </Avatar>
      <div className="ml-2 flex-1">
        <h4 className="font-medium text-sm">{getDisplayName()}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span>@{getHandle()}</span>
          <span>•</span>
          <span>{formatDate()}</span>
        </div>
        <p className="text-sm">{comment.content}</p>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-1 p-0 h-auto ${hasLiked ? 'text-red-500' : 'hover:text-gray-500'}`}
            onClick={toggleLike}
            disabled={!currentPetId}
          >
            <Heart className="h-4 w-4" fill={hasLiked ? "currentColor" : "none"} />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </Button>
          <span 
            className="ml-3 cursor-pointer hover:text-primary transition-colors"
            onClick={() => setIsReplying(!isReplying)}
          >
            Reply
          </span>
        </div>

        {isReplying && (
          <div className="mt-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="mb-2"
              disabled={!user}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || !user}
              >
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
