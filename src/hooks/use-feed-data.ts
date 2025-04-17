import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, PetProfile, Comment, mapDbPetProfileToPetProfile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useFeedData = (limit = 10) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async (startIndex = 0) => {
    if (startIndex === 0) {
      setLoading(true);
    }
    
    try {
      // Fetch posts with pet profile information
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          pet_profiles:pet_id (*)
        `)
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + limit - 1);

      if (postsError) {
        throw postsError;
      }

      if (!postsData || postsData.length === 0) {
        setHasMore(false);
        if (startIndex === 0) {
          setPosts([]);
        }
        return;
      }

      // Format the posts data
      const formattedPosts: Post[] = postsData.map(post => {
        const petProfile = post.pet_profiles as any;
        
        const formattedPetProfile: PetProfile = {
          id: petProfile.id,
          ownerId: petProfile.owner_id,
          name: petProfile.name,
          species: petProfile.species,
          breed: petProfile.breed,
          age: petProfile.age,
          personality: petProfile.personality || [],
          bio: petProfile.bio || '',
          profilePicture: petProfile.profile_picture,
          createdAt: petProfile.created_at,
          followers: petProfile.followers || 0,
          following: petProfile.following || 0,
          handle: petProfile.handle
        };

        return {
          id: post.id,
          petId: post.pet_id,
          petProfile: formattedPetProfile,
          content: post.content,
          image: post.image,
          likes: post.likes || 0,
          comments: post.comments || 0,
          createdAt: post.created_at
        };
      });

      if (startIndex === 0) {
        setPosts(formattedPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...formattedPosts]);
      }

      setHasMore(formattedPosts.length === limit);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = () => {
    setPosts([]);
    setHasMore(true);
    fetchPosts(0);
  };

  const loadMorePosts = () => {
    if (!loading && hasMore) {
      fetchPosts(posts.length);
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;
    
    try {
      // Check if user already liked the post
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
        
      if (likeCheckError && likeCheckError.code !== 'PGRST116') {
        throw likeCheckError;
      }
      
      if (existingLike) {
        // Unlike the post
        const { error: unlikeError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        if (unlikeError) throw unlikeError;
        
        // Decrement the likes count
        const { error: updateError } = await supabase.rpc('decrement_post_likes', {
          post_id_param: postId
        });
        
        if (updateError) throw updateError;
        
        // Update local state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, likes: Math.max(0, post.likes - 1) } 
              : post
          )
        );
      } else {
        // Like the post
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: user.id }]);
          
        if (likeError) throw likeError;
        
        // Increment the likes count
        const { error: updateError } = await supabase.rpc('increment_post_likes', {
          post_id_param: postId
        });
        
        if (updateError) throw updateError;
        
        // Update local state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, likes: post.likes + 1 } 
              : post
          )
        );
      }
    } catch (err) {
      console.error('Error liking/unliking post:', err);
    }
  };

  const addComment = async (postId: string, content: string, petId?: string) => {
    if (!user) return null;
    
    try {
      const commentData = {
        post_id: postId,
        content,
        user_id: petId ? null : user.id,
        pet_id: petId || null
      };
      
      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select(`
          *,
          pet_profiles:pet_id (*),
          profiles:user_id (*)
        `)
        .single();
        
      if (error) throw error;
      
      // Increment the comments count
      const { error: updateError } = await supabase.rpc('increment_post_comments', {
        post_id_param: postId
      });
      
      if (updateError) throw updateError;
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 } 
            : post
        )
      );
      
      // Format the comment for return
      let formattedComment: Comment;
      
      if (data.pet_id) {
        const petProfile = data.pet_profiles as any;
        formattedComment = {
          id: data.id,
          postId: data.post_id,
          petId: data.pet_id,
          petProfile: {
            id: petProfile.id,
            ownerId: petProfile.owner_id,
            name: petProfile.name,
            species: petProfile.species,
            breed: petProfile.breed,
            age: petProfile.age,
            personality: petProfile.personality || [],
            bio: petProfile.bio || '',
            profilePicture: petProfile.profile_picture,
            createdAt: petProfile.created_at,
            followers: petProfile.followers || 0,
            following: petProfile.following || 0,
            handle: petProfile.handle
          },
          content: data.content,
          likes: data.likes || 0,
          createdAt: data.created_at
        };
      } else {
        const userProfile = data.profiles as any;
        formattedComment = {
          id: data.id,
          postId: data.post_id,
          userId: data.user_id,
          userProfile: {
            id: userProfile.id,
            username: userProfile.username,
            avatarUrl: userProfile.avatar_url,
            handle: userProfile.handle
          },
          content: data.content,
          likes: data.likes || 0,
          createdAt: data.created_at
        };
      }
      
      return formattedComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      return null;
    }
  };

  const fetchComments = async (postId: string): Promise<Comment[]> => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          pet_profiles:pet_id (*),
          profiles:user_id (*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Format the comments
      const formattedComments: Comment[] = data.map(comment => {
        if (comment.pet_id) {
          const petProfile = comment.pet_profiles as any;
          return {
            id: comment.id,
            postId: comment.post_id,
            petId: comment.pet_id,
            petProfile: {
              id: petProfile.id,
              ownerId: petProfile.owner_id,
              name: petProfile.name,
              species: petProfile.species,
              breed: petProfile.breed,
              age: petProfile.age,
              personality: petProfile.personality || [],
              bio: petProfile.bio || '',
              profilePicture: petProfile.profile_picture,
              createdAt: petProfile.created_at,
              followers: petProfile.followers || 0,
              following: petProfile.following || 0,
              handle: petProfile.handle
            },
            content: comment.content,
            likes: comment.likes || 0,
            createdAt: comment.created_at
          };
        } else {
          const userProfile = comment.profiles as any;
          return {
            id: comment.id,
            postId: comment.post_id,
            userId: comment.user_id,
            userProfile: {
              id: userProfile.id,
              username: userProfile.username,
              avatarUrl: userProfile.avatar_url,
              handle: userProfile.handle
            },
            content: comment.content,
            likes: comment.likes || 0,
            createdAt: comment.created_at
          };
        }
      });
      
      return formattedComments;
    } catch (err) {
      console.error('Error fetching comments:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    refreshPosts,
    loadMorePosts,
    likePost,
    addComment,
    fetchComments
  };
};
