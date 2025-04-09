
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import PostCard from '@/components/PostCard';
import { mockPosts, mockComments } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Post, Comment } from '@/types';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("for-you");
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  useEffect(() => {
    if (user) {
      // Only fetch data from Supabase if user is authenticated
      const fetchData = async () => {
        setLoadingData(true);
        try {
          // Fetch posts
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select(`
              id, 
              pet_id, 
              content, 
              image, 
              likes, 
              comments, 
              created_at,
              pet_profiles:pet_id (
                id, 
                name, 
                species, 
                breed, 
                age, 
                personality,
                bio,
                profile_picture,
                followers,
                following
              )
            `)
            .order('created_at', { ascending: false });
            
          if (postsError) throw postsError;
          
          // Fetch comments
          const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select(`
              id,
              post_id,
              pet_id,
              content,
              likes,
              created_at,
              pet_profiles:pet_id (
                id, 
                name, 
                species, 
                breed,
                profile_picture
              )
            `)
            .order('created_at', { ascending: true });
            
          if (commentsError) throw commentsError;
          
          // Map the Supabase data to our frontend data structure
          const formattedPosts: Post[] = postsData.map(post => ({
            id: post.id,
            petId: post.pet_id,
            petProfile: {
              id: post.pet_profiles.id,
              name: post.pet_profiles.name,
              species: post.pet_profiles.species,
              breed: post.pet_profiles.breed,
              age: post.pet_profiles.age,
              personality: post.pet_profiles.personality,
              bio: post.pet_profiles.bio,
              profilePicture: post.pet_profiles.profile_picture,
              followers: post.pet_profiles.followers,
              following: post.pet_profiles.following,
              ownerId: '', // This is not needed for display
              createdAt: '', // This is not needed for display
            },
            content: post.content,
            image: post.image,
            likes: post.likes,
            comments: post.comments,
            createdAt: post.created_at,
          }));
          
          const formattedComments: Comment[] = commentsData.map(comment => ({
            id: comment.id,
            postId: comment.post_id,
            petId: comment.pet_id,
            petProfile: {
              id: comment.pet_profiles.id,
              name: comment.pet_profiles.name,
              species: comment.pet_profiles.species,
              breed: comment.pet_profiles.breed,
              profilePicture: comment.pet_profiles.profile_picture,
              // These fields aren't needed for comments display
              age: 0,
              personality: [],
              bio: '',
              ownerId: '',
              createdAt: '',
              followers: 0,
              following: 0,
            },
            content: comment.content,
            likes: comment.likes,
            createdAt: comment.created_at,
          }));
          
          setPosts(formattedPosts);
          setComments(formattedComments);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({
            title: "Error",
            description: "Failed to load posts. Please try again later.",
            variant: "destructive",
          });
          // Fall back to mock data if there's an error
          setPosts(mockPosts);
          setComments(mockComments);
        } finally {
          setLoadingData(false);
        }
      };
      
      fetchData();
    } else {
      // Use mock data for non-authenticated users
      setPosts(mockPosts);
      setComments(mockComments);
    }
  }, [user]);
  
  // For demo purposes, we'll show all posts in "For You" tab
  // and a filtered subset in the "Following" tab
  const forYouPosts = posts;
  const followingPosts = user ? posts.slice(0, 2) : mockPosts.slice(0, 2); // Just showing fewer posts in Following tab for demo
  
  return (
    <Layout>
      <HeaderCard 
        title="Feed" 
        subtitle={isLoading || loadingData ? "Loading..." : (user ? "See what your furry friends are up to!" : "Browse pet posts from around the world!")}
      />

      {/* Show tabs only for authenticated users, otherwise only show "For You" content */}
      {isLoading || loadingData ? (
        <div className="w-full flex justify-center p-8">
          <div className="animate-pulse bg-muted rounded-md h-64 w-full max-w-md"></div>
        </div>
      ) : user ? (
        <Tabs defaultValue="for-you" className="w-full mb-4" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="for-you" className="font-medium">For You</TabsTrigger>
            <TabsTrigger value="following" className="font-medium">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="for-you" className="mt-4">
            <div className="w-full flex flex-col items-center">
              {forYouPosts.length > 0 ? (
                forYouPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
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
                    key={post.id} 
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
                comments={comments.filter(comment => comment.postId === post.id)}
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
      {isMobile && <div className="h-24"></div>}
    </Layout>
  );
};

export default Index;
