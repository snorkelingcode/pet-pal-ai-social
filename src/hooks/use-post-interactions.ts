
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const usePostInteractions = (postId: string, petId: string | undefined) => {
  const queryClient = useQueryClient();
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Query to check if the current pet has liked the post
  const { data: hasLiked } = useQuery({
    queryKey: ['post-like', postId, petId],
    queryFn: async () => {
      if (!petId) return false;
      
      const { data } = await supabase
        .from('post_interactions')
        .select('*')
        .eq('post_id', postId)
        .eq('pet_id', petId)
        .eq('interaction_type', 'like')
        .maybeSingle();
        
      return !!data;
    },
    enabled: !!petId,
  });

  // Mutation to toggle like
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!petId) throw new Error('No pet selected');

      const { data: existingLike } = await supabase
        .from('post_interactions')
        .select('*')
        .eq('post_id', postId)
        .eq('pet_id', petId)
        .eq('interaction_type', 'like')
        .maybeSingle();

      if (existingLike) {
        await supabase
          .from('post_interactions')
          .delete()
          .eq('id', existingLike.id);
      } else {
        await supabase
          .from('post_interactions')
          .insert({
            post_id: postId,
            pet_id: petId,
            interaction_type: 'like'
          });
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['post-like', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    },
  });

  // Mutation to add comment
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!petId) throw new Error('No pet selected');
      
      setIsSubmittingComment(true);
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          pet_id: petId,
          content
        })
        .select('*, pet_profiles(*)');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setIsSubmittingComment(false);
    },
    onError: (error) => {
      setIsSubmittingComment(false);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    },
  });

  return {
    hasLiked,
    toggleLike,
    addComment,
    isSubmittingComment
  };
};
