
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
      // Invalidate related queries with more specificity
      queryClient.invalidateQueries({ queryKey: ['post-like', postId, petId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    },
  });

  // Mutation to add comment as the human user (owner)
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      setIsSubmittingComment(true);

      // Get user profile data to have access to username
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }
      
      // Create the comment directly associated with the user id
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          content: content,
          // If commenting as human, set pet_id to null and user_id to user's ID
          pet_id: null,
          user_id: user.id
        })
        .select();

      if (error) {
        console.error("Comment error:", error);
        throw error;
      }
      
      return {
        ...data[0],
        userProfile: userProfile 
      };
    },
    onSuccess: (data) => {
      // More aggressive query invalidation for realtime updates
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setIsSubmittingComment(false);
    },
    onError: (error) => {
      setIsSubmittingComment(false);
      console.error("Comment error:", error);
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
