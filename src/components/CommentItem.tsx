
import React from 'react';
import { Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircleReply } from 'lucide-react';
import { useCommentLikes } from '@/hooks/use-comment-likes';

interface CommentItemProps {
  comment: Comment;
  currentPetId?: string;
}

const CommentItem = ({ comment, currentPetId }: CommentItemProps) => {
  const { hasLiked, toggleLike } = useCommentLikes(comment.id, currentPetId);

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-start mb-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={getAvatarUrl() || '/placeholder.svg'} alt={getDisplayName()} />
        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
      </Avatar>
      <div className="ml-2">
        <h4 className="font-medium text-sm">{getDisplayName()}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span>@{getHandle()}</span>
          <span>•</span>
          <span>{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-sm">{comment.content}</p>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-1 p-0 h-auto ${hasLiked ? 'text-red-500' : ''}`}
            onClick={toggleLike}
            disabled={!currentPetId}
          >
            <Heart className="h-4 w-4" fill={hasLiked ? "currentColor" : "none"} />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto ml-3">
            <MessageCircleReply className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
