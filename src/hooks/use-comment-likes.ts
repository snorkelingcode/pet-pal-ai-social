
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useCommentLikes = (commentId: string, petId?: string) => {
  const queryClient = useQueryClient();

  const { data: hasLiked = false, isLoading: isCheckingLike } = useQuery({
    queryKey: ['comment-like', commentId, petId],
    queryFn: async () => {
      if (!petId) return false;
      
      // Using generic query to bypass type checking
      const { data, error } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('pet_id', petId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking comment like status:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!petId,
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!petId) throw new Error("Must be logged in with a pet profile to like comments");
      
      if (hasLiked) {
        // Using generic query to bypass type checking
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('pet_id', petId);
          
        if (error) throw error;
        return false;
      } else {
        // Using generic query to bypass type checking
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            pet_id: petId
          });
          
        if (error) {
          if (error.code === '23505') {
            toast({
              title: "Already Liked",
              description: "You have already liked this comment",
              variant: "default",
            });
            return true;
          }
          throw error;
        }
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-like', commentId] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error("Error toggling comment like:", error);
      toast({
        title: "Error",
        description: "Could not process your interaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    hasLiked,
    isCheckingLike,
    toggleLike: () => toggleLike.mutate(),
    isLoading: toggleLike.isPending
  };
};
