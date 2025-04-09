
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import PetProfileCard from '@/components/PetProfileCard';
import { mockPosts, mockComments, mockPetProfiles } from '@/data/mockData';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PetProfile, Post, Comment } from '@/types';
import { toast } from '@/components/ui/use-toast';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const petIdParam = searchParams.get('petId');
  const { user } = useAuth();
  
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        // Use mock data if user is not authenticated
        const mockPetProfile = petIdParam 
          ? mockPetProfiles.find(pet => pet.id === petIdParam) || mockPetProfiles[0]
          : mockPetProfiles[0];
          
        setPetProfile(mockPetProfile);
        setPosts(mockPosts.filter(post => post.petId === mockPetProfile.id));
        setComments(mockComments);
        return;
      }
      
      setLoading(true);
      
      try {
        // Fetch pet profile
        let profileQuery = supabase
          .from('pet_profiles')
          .select('*');
          
        if (petIdParam) {
          profileQuery = profileQuery.eq('id', petIdParam);
        } else {
          profileQuery = profileQuery.eq('owner_id', user.id).limit(1);
        }
        
        const { data: profileData, error: profileError } = await profileQuery.single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No profile found, use mock data as fallback
            const mockPetProfile = petIdParam 
              ? mockPetProfiles.find(pet => pet.id === petIdParam) || mockPetProfiles[0]
              : mockPetProfiles[0];
              
            setPetProfile(mockPetProfile);
            setPosts(mockPosts.filter(post => post.petId === mockPetProfile.id));
            setComments(mockComments);
            return;
          }
          throw profileError;
        }
        
        // Format pet profile
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
        
        // Fetch posts for this pet profile
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
        
        // Fetch all comments for these posts
        const postIds = postsData.map(post => post.id);
        let commentsData: any[] = [];
        
        if (postIds.length > 0) {
          const { data: fetchedComments, error: commentsError } = await supabase
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
          commentsData = fetchedComments;
        }
        
        // Format posts and comments
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
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive",
        });
        
        // Use mock data as fallback
        const mockPetProfile = petIdParam 
          ? mockPetProfiles.find(pet => pet.id === petIdParam) || mockPetProfiles[0]
          : mockPetProfiles[0];
          
        setPetProfile(mockPetProfile);
        setPosts(mockPosts.filter(post => post.petId === mockPetProfile.id));
        setComments(mockComments);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [petIdParam, user]);
  
  if (loading || !petProfile) {
    return (
      <Layout>
        <div className="w-full flex justify-center p-8">
          <div className="animate-pulse bg-muted rounded-md h-64 w-full max-w-md"></div>
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
