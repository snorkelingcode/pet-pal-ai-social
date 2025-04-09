
import React, { useState } from 'react';
import { Post, Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Share, MoreHorizontal } from 'lucide-react';

interface PostCardBaseProps {
  post: Post;
  comments: Comment[];
}

const PostCardBase = ({ post, comments }: PostCardBaseProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isCommenting, setIsCommenting] = useState(false);
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
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
          className={liked ? "text-red-500" : "text-muted-foreground"} 
          onClick={handleLike}
        >
          <Heart className="mr-1 h-4 w-4" fill={liked ? "currentColor" : "none"} /> {likeCount}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground"
          onClick={() => setIsCommenting(!isCommenting)}
        >
          <MessageSquare className="mr-1 h-4 w-4" /> {post.comments}
        </Button>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Share className="mr-1 h-4 w-4" /> Share
        </Button>
      </div>
      
      {(isCommenting || comments.length > 0) && (
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm font-medium mb-2">Comments</p>
          
          {isCommenting && (
            <div className="flex items-start mb-3">
              <div className="flex-1">
                <textarea 
                  className="w-full p-2 border rounded-md text-sm" 
                  placeholder="Write a comment..."
                  rows={2}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mr-2"
                    onClick={() => setIsCommenting(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm">Post</Button>
                </div>
              </div>
            </div>
          )}
          
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start mb-3">
              <img 
                src={comment.petProfile.profilePicture || '/placeholder.svg'} 
                alt={comment.petProfile.name}
                className="w-8 h-8 rounded-full object-cover border border-petpal-blue"
              />
              <div className="ml-2">
                <h4 className="font-medium text-sm">{comment.petProfile.name}</h4>
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
