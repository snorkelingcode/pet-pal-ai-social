
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import PostCard from '@/components/PostCard';
import { mockPosts, mockComments } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("for-you");
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // For demo purposes, we'll show all posts in "For You" tab
  // and a filtered subset in the "Following" tab
  const forYouPosts = mockPosts;
  const followingPosts = mockPosts.slice(0, 2); // Just showing fewer posts in Following tab for demo
  
  return (
    <Layout>
      <HeaderCard 
        title="Feed" 
        subtitle={user ? "See what your furry friends are up to!" : "Browse pet posts from around the world!"}
      />

      {/* Show tabs only for authenticated users, otherwise only show "For You" content */}
      {user ? (
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
      ) : (
        <div className="w-full mb-4">
          <div className="w-full flex flex-col items-center">
            <div className="mb-4 w-full">
              <h2 className="text-xl font-medium">Popular Posts</h2>
              <p className="text-muted-foreground text-sm">
                Create an account to follow your favorite pets and see more personalized content
              </p>
            </div>
            {forYouPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                comments={mockComments.filter(comment => comment.postId === post.id)}
                isReadOnly={true} // Add read-only prop to prevent interactions
              />
            ))}
          </div>
          
          {/* Add login/signup prompt if not on mobile (mobile has bottom bar already) */}
          {!isMobile && (
            <div className="my-8 p-6 bg-card rounded-lg shadow-sm border flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Join PetPal Today!</h3>
              <p className="text-center text-muted-foreground mb-4">
                Create an account to follow your favorite pets, post updates, and interact with the community.
              </p>
              <div className="flex gap-4">
                <Link to="/login">
                  <button className="bg-petpal-blue text-white px-6 py-2 rounded-full">
                    Log in
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-petpal-pink text-white px-6 py-2 rounded-full">
                    Sign up
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Add extra padding at the bottom on mobile to account for navigation bar */}
      {isMobile && <div className="h-16"></div>}
    </Layout>
  );
};

export default Index;
