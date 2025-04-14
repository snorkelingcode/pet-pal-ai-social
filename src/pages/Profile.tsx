import React, { useState, useEffect } from 'react';
import HeaderCard from '@/components/HeaderCard';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PostCard from '@/components/PostCard';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Edit, Heart, Share, Grid3X3, Bookmark, MessageSquare, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { PetProfile, Post, Comment } from '@/types';

interface PostWithPetProfile extends Post {
  petProfile: PetProfile;
}

const Profile = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const paramPetId = searchParams.get('petId');
  
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [posts, setPosts] = useState<PostWithPetProfile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!paramPetId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('id', paramPetId)
          .single();
          
        if (profileError) throw profileError;
        
        if (!profileData) {
          setPetProfile(null);
          setPosts([]);
          setComments([]);
          setLoading(false);
          return;
        }
        
        const formattedProfile: PetProfile = {
          id: profileData.id,
          ownerId: profileData.owner_id,
          name: profileData.name,
          species: profileData.species,
          breed: profileData.breed,
          age: profileData.age,
          personality: profileData.personality,
          bio: profileData.bio,
          profilePicture: profileData.profile_picture,
          createdAt: profileData.created_at,
          followers: profileData.followers || 0,
          following: profileData.following || 0
        };
        
        setPetProfile(formattedProfile);
        
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('pet_id', paramPetId)
          .order('created_at', { ascending: false });
          
        if (postsError) throw postsError;
        
        const formattedPosts: PostWithPetProfile[] = postsData.map(post => ({
          id: post.id,
          petId: post.pet_id,
          petProfile: formattedProfile,
          content: post.content,
          image: post.image,
          likes: post.likes,
          comments: post.comments,
          createdAt: post.created_at,
        }));
        
        setPosts(formattedPosts);
        
        const postIds = postsData.map(post => post.id);
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .in('post_id', postIds)
          .order('created_at', { ascending: true });
          
        if (commentsError) throw commentsError;
        
        const formattedComments: Comment[] = commentsData.map(comment => ({
          id: comment.id,
          postId: comment.post_id,
          petId: comment.pet_id,
          petProfile: {
            id: formattedProfile.id,
            name: formattedProfile.name,
            species: formattedProfile.species,
            breed: formattedProfile.breed,
            profilePicture: formattedProfile.profilePicture,
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
        
        setComments(formattedComments);
        
        // Check if the current user is following this profile
        if (user) {
          const { data: followingData, error: followingError } = await supabase
            .from('followers')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', paramPetId);
            
          if (followingError) throw followingError;
          
          setIsFollowing(followingData && followingData.length > 0);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again later.",
          variant: "destructive",
        });
        setPetProfile(null);
        setPosts([]);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [paramPetId, user]);
  
  const handleFollow = async () => {
    if (!user || !petProfile) return;
    
    try {
      setLoading(true);
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', petProfile.id);
          
        if (error) throw error;
        
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You have unfollowed ${petProfile.name}.`,
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert([{ follower_id: user.id, following_id: petProfile.id }]);
          
        if (error) throw error;
        
        setIsFollowing(true);
        toast({
          title: "Followed",
          description: `You are now following ${petProfile.name}!`,
        });
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      toast({
        title: "Error",
        description: "Failed to follow/unfollow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderCard 
          title="Pet Profile" 
          subtitle="Loading..."
        />
        <div className="w-full flex justify-center p-8">
          <div className="animate-pulse bg-muted rounded-md h-64 w-full max-w-md"></div>
        </div>
      </>
    );
  }
  
  if (!petProfile) {
    return (
      <>
        <HeaderCard 
          title="Pet Profile" 
          subtitle="Profile not found"
        />
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No Profile Selected</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {user ? 'Please select or create a pet profile' : 'Sign in to view and create pet profiles'}
          </p>
          {user ? (
            <Button 
              className="bg-petpal-pink hover:bg-petpal-pink/90"
              onClick={() => {
                const createProfileEvent = new CustomEvent('open-create-profile');
                window.dispatchEvent(createProfileEvent);
              }}
            >
              Create Pet Profile
            </Button>
          ) : (
            <div className="flex gap-4">
              <Link to="/login">
                <Button className="bg-petpal-blue hover:bg-petpal-blue/90">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-petpal-pink hover:bg-petpal-pink/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Profile Header */}
      <div className="relative mb-6">
        <div 
          className="h-48 bg-cover bg-center rounded-md"
          style={{ backgroundImage: `url(${petProfile.profilePicture || '/placeholder.svg'})` }}
        ></div>
        <div className="absolute left-4 bottom-[-60px] flex items-end">
          <Avatar className="h-24 w-24 border-4 border-white">
            <img src={petProfile.profilePicture || '/placeholder.svg'} alt={petProfile.name} className="object-cover" />
          </Avatar>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">{petProfile.name}</h1>
            <p className="text-muted-foreground">{petProfile.species} • {petProfile.breed}</p>
          </div>
        </div>
        
        {/* Edit Profile Button - only show if the logged in user owns the profile */}
        {user && petProfile.ownerId === user.id && (
          <Link to={`/pet-edit/${petProfile.id}`} className="absolute top-4 right-4">
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        )}
        
        {/* Follow Button - only show if the logged in user doesn't own the profile */}
        {user && petProfile.ownerId !== user.id && (
          <Button 
            className="absolute top-4 right-4"
            onClick={handleFollow}
            disabled={loading}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
        
        <div className="absolute bottom-4 right-4 flex items-center">
          <div className="flex items-center mr-4">
            <Heart className="h-5 w-5 mr-1 text-petpal-pink" />
            <span className="text-sm">{petProfile.followers}</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-1 text-petpal-blue" />
            <span className="text-sm">{posts.reduce((acc, post) => acc + post.comments, 0)}</span>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="posts" className="font-medium">
            <Grid3X3 className="h-4 w-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="saved" className="font-medium">
            <Bookmark className="h-4 w-4 mr-2" />
            Saved
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-4">
          <div className="w-full flex flex-col items-center">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  comments={comments.filter(comment => comment.postId === post.id)}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <User className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No posts yet.</p>
                {user && petProfile.ownerId === user.id && (
                  <p className="text-sm">Share your first post!</p>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="mt-4">
          <div className="text-center py-8">
            <Bookmark className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No saved posts yet.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add extra padding at the bottom on mobile to account for navigation bar */}
      {isMobile && <div className="h-24"></div>}
    </>
  );
};

export default Profile;
