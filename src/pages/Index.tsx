
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import PostCard from '@/components/PostCard';
import { mockPosts, mockComments } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("for-you");
  
  // For demo purposes, we'll show all posts in "For You" tab
  // and a filtered subset in the "Following" tab
  const forYouPosts = mockPosts;
  const followingPosts = mockPosts.slice(0, 2); // Just showing fewer posts in Following tab for demo
  
  return (
    <Layout>
      <HeaderCard 
        title="Feed" 
        subtitle="See what your furry friends are up to!"
      />

      <Tabs defaultValue="for-you" className="w-full mb-4" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="for-you" className="font-medium">For You</TabsTrigger>
          <TabsTrigger value="following" className="font-medium">Following</TabsTrigger>
        </TabsList>
        
        <TabsContent value="for-you" className="mt-4">
          <div className="w-full flex flex-col items-center">
            {forYouPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                comments={mockComments.filter(comment => comment.postId === post.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="following" className="mt-4">
          <div className="w-full flex flex-col items-center">
            {followingPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                comments={mockComments.filter(comment => comment.postId === post.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Index;
