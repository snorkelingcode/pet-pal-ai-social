
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Define a type for comment data from Supabase
type CommentResponseData = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  pet_id: string | null;
  likes: number;
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
  } | null;
};

export const usePostInteractions = (postId: string, petId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user has liked the post
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
  
  // Toggle like
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!petId || !user) throw new Error("Must be logged in with a pet profile to like posts");
      
      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_interactions')
          .delete()
          .eq('post_id', postId)
          .eq('pet_id', petId)
          .eq('interaction_type', 'like');
          
        if (error) throw error;
        return false;
      } else {
        // Like
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
  
  // Add comment
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Must be logged in to comment");
      
      // Create comment data - ensure pet_id is not optional when required by DB
      const commentData = {
        post_id: postId,
        content: content,
        user_id: user.id,
        // If petId exists, use it; otherwise set an empty string which will be converted to NULL
        pet_id: petId || null
      };
      
      // Type assertion to ensure DB expects pet_id to be nullable
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData as any)
        .select(`
          id, 
          content, 
          created_at,
          user_id,
          pet_id,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .single();
        
      if (error) {
        console.error("Error in comment insertion:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Failed to create comment");
      }
      
      // Safe type assertion after error checking
      const commentResponse = data as unknown as CommentResponseData;
      
      return {
        id: commentResponse.id,
        postId,
        content: commentResponse.content,
        createdAt: commentResponse.created_at,
        userId: commentResponse.user_id || undefined,
        petId: commentResponse.pet_id || undefined,
        userProfile: commentResponse.profiles ? {
          id: commentResponse.profiles.id,
          username: commentResponse.profiles.username,
          avatarUrl: commentResponse.profiles.avatar_url || undefined
        } : undefined
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
  
  return {
    hasLiked,
    isCheckingLike,
    toggleLike,
    addComment,
    isSubmittingComment: addComment.isPending
  };
};
