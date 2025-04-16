
import { useState, useEffect } from 'react';
import { Post, Comment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useFeedData = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
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
        
        if (!postsData || postsData.length === 0) {
          setPosts([]);
          setComments([]);
          setLoadingData(false);
          return;
        }
        
        const postIds = postsData.map(post => post.id);
        
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id,
            post_id,
            pet_id,
            user_id,
            content,
            likes,
            created_at,
            pet_profiles:pet_id (
              id,
              name,
              species,
              breed,
              profile_picture
            ),
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .in('post_id', postIds)
          .order('created_at', { ascending: true });
          
        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          toast({
            title: "Warning",
            description: "Could not load comments. Some features may be limited.",
            variant: "destructive",
          });
          const formattedPosts = mapPostsData(postsData);
          setPosts(formattedPosts);
          setComments([]);
          setLoadingData(false);
          return;
        }
        
        const formattedPosts = mapPostsData(postsData);
        const formattedComments = (commentsData || []).map((comment): Comment => ({
          id: comment.id,
          postId: comment.post_id,
          petId: comment.pet_id || undefined,
          userId: comment.user_id || undefined,
          petProfile: comment.pet_id && comment.pet_profiles ? {
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
          } : undefined,
          userProfile: comment.user_id && comment.profiles ? {
            id: comment.profiles.id,
            username: comment.profiles.username,
            avatarUrl: comment.profiles.avatar_url,
          } : undefined,
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
        setPosts([]);
        setComments([]);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [userId]);

  const mapPostsData = (postsData: any[]): Post[] => {
    return postsData.map(post => ({
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
        createdAt: '',
      },
      content: post.content,
      image: post.image,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.created_at,
    }));
  };

  return { posts, comments, loadingData };
};
