
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/types/supabase';

// Define a custom type for comment likes since it's not in the generated types yet
interface CommentLike {
  id: string;
  comment_id: string;
  pet_id?: string;
  user_id?: string;
  created_at: string;
}

export const useCommentLikes = (commentId: string, petId?: string) => {
  const queryClient = useQueryClient();

  const { data: hasLiked = false, isLoading: isCheckingLike } = useQuery({
    queryKey: ['comment-like', commentId, petId],
    queryFn: async () => {
      if (!petId) return false;
      
      // Use explicit typing with "as any" to bypass type checking
      const { data, error } = await (supabase as any)
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('pet_id', petId)
        .maybeSingle();
        
      if (error) {
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
        // Use explicit typing with "as any" to bypass type checking
        const { error } = await (supabase as any)
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('pet_id', petId);
          
        if (error) throw error;
        return false;
      } else {
        // Use explicit typing with "as any" to bypass type checking
        const { error } = await (supabase as any)
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
