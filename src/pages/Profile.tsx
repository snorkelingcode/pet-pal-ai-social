import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import PetProfileCard from '@/components/PetProfileCard';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PetProfile, Post, Comment } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const petIdParam = searchParams.get('petId');
  const { user } = useAuth();
  
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPets, setUserPets] = useState<PetProfile[]>([]);
  
  useEffect(() => {
    const fetchUserPets = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) throw error;
        
        console.log("Fetched user pets:", data);
        
        const petProfiles: PetProfile[] = data.map(pet => ({
          id: pet.id,
          ownerId: pet.owner_id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          personality: pet.personality,
          bio: pet.bio,
          profilePicture: pet.profile_picture,
          createdAt: pet.created_at,
          followers: pet.followers || 0,
          following: pet.following || 0
        }));
        
        setUserPets(petProfiles);
        
        if (!petIdParam && petProfiles.length > 0) {
          console.log("Redirecting to first pet:", petProfiles[0].id);
          navigate(`/profile?petId=${petProfiles[0].id}`, { replace: true });
        }
      } catch (error) {
        console.error("Error fetching user pets:", error);
      }
    };
    
    fetchUserPets();
  }, [user, petIdParam, navigate]);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!petIdParam && userPets.length === 0) {
        setPetProfile(null);
        setPosts([]);
        setComments([]);
        return;
      }
      
      setLoading(true);
      
      try {
        let profileQuery = supabase
          .from('pet_profiles')
          .select('*');
          
        if (petIdParam) {
          profileQuery = profileQuery.eq('id', petIdParam);
        } else if (userPets.length > 0) {
          profileQuery = profileQuery.eq('id', userPets[0].id);
        } else {
          setPetProfile(null);
          setPosts([]);
          setComments([]);
          setLoading(false);
          return;
        }
        
        const { data: profileData, error: profileError } = await profileQuery.single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setPetProfile(null);
            setPosts([]);
            setComments([]);
            setLoading(false);
            return;
          }
          throw profileError;
        }
        
        console.log("Fetched pet profile:", profileData);
        
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
          .eq('pet_id', formattedProfile.id)
          .order('created_at', { ascending: false });
          
        if (postsError) throw postsError;
        
        console.log("Fetched pet posts:", postsData);
        
        if (postsData.length === 0) {
          setPosts([]);
          setComments([]);
          setLoading(false);
          return;
        }
        
        const postIds = postsData.map(post => post.id);
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
          .in('post_id', postIds)
          .order('created_at', { ascending: true });
            
        if (commentsError) throw commentsError;
        
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
            ownerId: '',
          },
          content: post.content,
          image: post.image,
          likes: post.likes,
          comments: post.comments,
          createdAt: post.created_at,
        }));
        
        const formattedComments: Comment[] = commentsData ? commentsData.map(comment => ({
          id: comment.id,
          postId: comment.post_id,
          petId: comment.pet_id,
          petProfile: {
            id: comment.pet_profiles.id,
            name: comment.pet_profiles.name,
            species: comment.pet_profiles.species,
            breed: comment.pet_profiles.breed,
            profilePicture: comment.pet_profiles.profile_picture,
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
        })) : [];
        
        setPosts(formattedPosts);
        setComments(formattedComments);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive",
        });
        
        setPetProfile(null);
        setPosts([]);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [petIdParam, userPets]);
  
  if (loading) {
    return (
      <Layout>
        <div className="w-full flex justify-center p-8">
          <div className="animate-pulse bg-muted rounded-md h-64 w-full max-w-md"></div>
        </div>
      </Layout>
    );
  }

  if (!petProfile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
          <h2 className="text-2xl font-bold mb-2">No Pet Profile Found</h2>
          {user ? (
            <div>
              <p className="text-muted-foreground mb-4">
                You don't have any pet profiles yet. Create one to get started!
              </p>
              <Button
                className="bg-petpal-pink hover:bg-petpal-pink/90"
                onClick={() => {
                  const createProfileEvent = new CustomEvent('open-create-profile');
                  window.dispatchEvent(createProfileEvent);
                }}
              >
                Create Pet Profile
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">
                Sign in to create a profile for your pet.
              </p>
              <div className="flex gap-4 mt-4">
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <PetProfileCard petProfile={petProfile} />
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            comments={comments.filter(comment => comment.postId === post.id)}
          />
        ))
      ) : (
        <p className="text-muted-foreground">No posts yet.</p>
      )}
    </Layout>
  );
};

export default Profile;
