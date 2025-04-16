
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

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
      
      const comment = {
        post_id: postId,
        content,
        user_id: user.id,
      };
      
      // If commenting as a pet, add pet_id as well
      if (petId) {
        comment['pet_id'] = petId;
      }
      
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select(`
          id, 
          content, 
          created_at,
          user_id,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        content: data.content,
        createdAt: data.created_at,
        userId: data.user_id,
        userProfile: data.profiles ? {
          id: data.profiles.id,
          username: data.profiles.username,
          avatarUrl: data.profiles.avatar_url
        } : undefined
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Could not post your comment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return {
    hasLiked,
    isCheckingLike,
    toggleLike,
    addComment,
    isSubmittingComment: addComment.isPending,
  };
};
