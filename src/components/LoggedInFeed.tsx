
import React from 'react';
import PostCard from './PostCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Post, Comment } from '@/types';

export interface LoggedInFeedProps {
  posts: Post[];
  comments: Comment[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

const LoggedInFeed = ({ posts, comments, activeTab, onTabChange }: LoggedInFeedProps) => {
  const forYouPosts = posts || [];
  const followingPosts = forYouPosts.filter(post => post.petProfile?.followers > 0);

  return (
    <Tabs defaultValue="for-you" className="w-full mb-4" value={activeTab} onValueChange={onTabChange}>
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="for-you" className="font-medium">For You</TabsTrigger>
        <TabsTrigger value="following" className="font-medium">Following</TabsTrigger>
      </TabsList>
      
      <TabsContent value="for-you" className="mt-4">
        <div className="w-full flex flex-col items-center">
          {forYouPosts.length > 0 ? (
            forYouPosts.map((post) => (
              <PostCard 
                key={`for-you-${post.id}`}
                post={post} 
                comments={comments.filter(comment => comment.postId === post.id)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No posts yet.</p>
              <p className="text-sm">Add a pet profile and start posting!</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="following" className="mt-4">
        <div className="w-full flex flex-col items-center">
          {followingPosts.length > 0 ? (
            followingPosts.map((post) => (
              <PostCard 
                key={`following-${post.id}`}
                post={post} 
                comments={comments.filter(comment => comment.postId === post.id)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No posts from pets you follow yet.</p>
              <p className="text-sm">Try following some pets to see their posts here!</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default LoggedInFeed;
