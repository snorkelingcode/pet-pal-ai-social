import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Comment } from '@/types';

type CommentResponseData = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  pet_id: string | null;
  likes: number;
  author_handle: string | null;
  author_name: string | null;
  profiles?: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
  pet_profiles?: {
    id: string;
    name: string;
    species: string;
    breed: string;
    profile_picture: string | null;
    handle: string;
  } | null;
};

export const usePostInteractions = (postId: string, petId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: hasLiked = false, isLoading: isCheckingLike } = useQuery({
    queryKey: ['post-like', postId],
    queryFn: async () => {
      if (!petId || !user) return false;
      
      const { data, error } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('post_id', postId)
        .eq('pet_id', petId)
        .eq('interaction_type', 'like')
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking like status:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!petId && !!user,
  });
  
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!petId || !user) throw new Error("Must be logged in with a pet profile to like posts");
      
      if (hasLiked) {
        const { error } = await supabase
          .from('post_interactions')
          .delete()
          .eq('post_id', postId)
          .eq('pet_id', petId)
          .eq('interaction_type', 'like');
          
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase
          .from('post_interactions')
          .insert({
            post_id: postId,
            pet_id: petId,
            interaction_type: 'like'
          });
          
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newLiked) => {
      queryClient.invalidateQueries({ queryKey: ['post-like', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Could not process your interaction. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id, 
            content, 
            created_at,
            pet_id,
            user_id,
            likes,
            author_handle,
            author_name,
            pet_profiles:pet_id (
              id,
              name,
              species,
              breed,
              profile_picture,
              handle
            ),
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        return (data || []).map(comment => {
          const defaultHandle = comment.pet_profiles?.handle || 
            (comment.pet_profiles?.name ? comment.pet_profiles.name.toLowerCase().replace(/[^a-z0-9]/g, '') : '') ||
            (comment.profiles?.username ? comment.profiles.username.toLowerCase().replace(/[^a-z0-9]/g, '') : 'anonymous');
          
          const defaultName = comment.pet_profiles?.name || 
            comment.profiles?.username || 'Anonymous';
          
          return {
            id: comment.id,
            postId,
            content: comment.content,
            createdAt: comment.created_at,
            petId: comment.pet_id || undefined,
            userId: comment.user_id || undefined,
            likes: comment.likes,
            authorHandle: comment.author_handle || defaultHandle,
            authorName: comment.author_name || defaultName,
            petProfile: comment.pet_id && comment.pet_profiles ? {
              id: comment.pet_profiles.id,
              name: comment.pet_profiles.name,
              species: comment.pet_profiles.species,
              breed: comment.pet_profiles.breed,
              profilePicture: comment.pet_profiles.profile_picture || undefined,
              handle: comment.pet_profiles.handle,
              age: 0,
              personality: [],
              bio: '',
              ownerId: '',
              createdAt: '',
              followers: 0,
              following: 0
            } : undefined,
            userProfile: comment.user_id && comment.profiles ? {
              id: comment.profiles.id,
              username: comment.profiles.username,
              avatarUrl: comment.profiles.avatar_url || undefined
            } : undefined
          };
        });
      } catch (err) {
        console.error("Error fetching comments:", err);
        return [];
      }
    }
  });
  
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Must be logged in to comment");
      
      const petName = petId ? await getPetName(petId) : null;
      const authorName = petName || user.username;
      const authorHandle = petId ? 
        await getPetHandle(petId) :
        (user?.username?.toLowerCase().replace(/[^a-z0-9]/g, '') || user.id);
      
      const commentData = {
        post_id: postId,
        content: content,
        user_id: petId ? null : user.id,
        pet_id: petId || null,
        author_name: authorName,
        author_handle: authorHandle
      };
      
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();
        
      if (error) {
        console.error("Error in comment insertion:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Failed to create comment");
      }
      
      const commentResponse = data as CommentResponseData;
      
      return {
        id: commentResponse.id,
        postId,
        content: commentResponse.content,
        createdAt: commentResponse.created_at,
        petId: commentResponse.pet_id || undefined,
        userId: commentResponse.user_id || undefined,
        authorName: commentResponse.author_name || authorName,
        authorHandle: commentResponse.author_handle || authorHandle,
        likes: 0
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully."
      });
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Could not post your comment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getPetName = async (petId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('name')
        .eq('id', petId)
        .single();
      
      if (error) {
        console.error("Error fetching pet name:", error);
        return null;
      }
      
      return data?.name || null;
    } catch (err) {
      console.error("Exception in getPetName:", err);
      return null;
    }
  };

  const getPetHandle = async (petId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('name, handle')
        .eq('id', petId)
        .single();
      
      if (error) {
        console.error("Error fetching pet handle:", error);
        return petId;
      }
      
      return data?.handle || (data?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || petId);
    } catch (err) {
      console.error("Exception in getPetHandle:", err);
      return petId;
    }
  };
  
  return {
    hasLiked,
    isCheckingLike,
    toggleLike,
    comments,
    isLoadingComments,
    addComment,
    isSubmittingComment: addComment.isPending
  };
};
