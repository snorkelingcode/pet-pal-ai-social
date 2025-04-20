
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

type CommentResponseData = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  pet_id: string | null;
  author_name: string | null;
  author_handle: string | null;
  likes: number;
  profiles?: {
    id: string;
    username: string;
    avatar_url: string | null;
    handle: string | null;
  } | null;
  pet_profiles?: {
    id: string;
    name: string;
    species: string;
    breed: string;
    profile_picture: string | null;
    handle: string | null;
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
        // When unliking, we properly delete the interaction
        const { error } = await supabase
          .from('post_interactions')
          .delete()
          .eq('post_id', postId)
          .eq('pet_id', petId)
          .eq('interaction_type', 'like');
          
        if (error) throw error;
        
        // Also update the post's like count directly for immediate feedback
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes: supabase.rpc('decrement', { row_id: postId }) })
          .eq('id', postId);
          
        if (updateError) {
          console.error("Error decrementing like count:", updateError);
        }
        
        return false;
      } else {
        const { error } = await supabase
          .from('post_interactions')
          .insert({
            post_id: postId,
            pet_id: petId,
            interaction_type: 'like'
          });
          
        if (error) {
          if (error.code === '23505') {
            toast({
              title: "Already Liked",
              description: "You have already liked this post",
              variant: "default",
            });
            return true;
          }
          throw error;
        }
        
        // Also update the post's like count directly for immediate feedback
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes: supabase.rpc('increment', { row_id: postId }) })
          .eq('id', postId);
          
        if (updateError) {
          console.error("Error incrementing like count:", updateError);
        }
        
        return true;
      }
    },
    onSuccess: (newLiked) => {
      // Update local query cache immediately for better UX
      queryClient.setQueryData(['post-like', postId], newLiked);
      
      // Invalidate queries to refresh data
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
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id, 
          content, 
          created_at,
          user_id,
          pet_id,
          author_name,
          author_handle,
          likes,
          profiles:user_id (
            id,
            username,
            avatar_url,
            handle
          ),
          pet_profiles:pet_id (
            id,
            name,
            species,
            breed,
            profile_picture,
            handle
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching comments:", error);
        return [];
      }
      
      return data || [];
    }
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Must be logged in to comment");
      
      const commentData = {
        post_id: postId,
        content: content,
        user_id: user.id,
        pet_id: petId || null
      };
      
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData as any)
        .select(`
          id, 
          content, 
          created_at,
          user_id,
          pet_id,
          author_name,
          author_handle,
          profiles:user_id (
            id,
            username,
            avatar_url,
            handle
          ),
          pet_profiles:pet_id (
            id,
            name,
            species,
            breed,
            profile_picture,
            handle
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
      
      const commentResponse = data as unknown as CommentResponseData;
      
      return {
        id: commentResponse.id,
        postId,
        content: commentResponse.content,
        createdAt: commentResponse.created_at,
        userId: commentResponse.user_id || undefined,
        petId: commentResponse.pet_id || undefined,
        authorName: commentResponse.author_name || 
                   (commentResponse.profiles?.username) || 
                   (commentResponse.pet_profiles?.name) || 
                   'Anonymous',
        authorHandle: commentResponse.author_handle || 
                     (commentResponse.profiles?.handle) || 
                     (commentResponse.pet_profiles?.handle) || 
                     'user',
        userProfile: commentResponse.profiles ? {
          id: commentResponse.profiles.id,
          username: commentResponse.profiles.username,
          avatarUrl: commentResponse.profiles.avatar_url || undefined,
          handle: commentResponse.profiles.handle || 
                 commentResponse.profiles.username.toLowerCase().replace(/[^a-z0-9]/g, '')
        } : undefined,
        petProfile: commentResponse.pet_profiles ? {
          id: commentResponse.pet_profiles.id,
          name: commentResponse.pet_profiles.name,
          species: commentResponse.pet_profiles.species,
          breed: commentResponse.pet_profiles.breed,
          profilePicture: commentResponse.pet_profiles.profile_picture || undefined,
          handle: commentResponse.pet_profiles.handle || 
                 commentResponse.pet_profiles.name.toLowerCase().replace(/[^a-z0-9]/g, '')
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
    comments,
    isLoadingComments,
    addComment,
    isSubmittingComment: addComment.isPending
  };
};
