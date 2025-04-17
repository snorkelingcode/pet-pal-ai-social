
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePostLikes = () => {
  const { user } = useAuth();
  const [likingPosts, setLikingPosts] = useState<Record<string, boolean>>({});

  const likePost = async (postId: string) => {
    if (!user) return;
    
    setLikingPosts(prev => ({ ...prev, [postId]: true }));
    
    try {
      // Check if user already liked the post
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('post_interactions')
        .select('*')
        .eq('post_id', postId)
        .eq('interaction_type', 'like')
        .maybeSingle();
        
      if (likeCheckError) {
        throw likeCheckError;
      }
      
      if (existingLike) {
        // Unlike the post
        const { error: unlikeError } = await supabase
          .from('post_interactions')
          .delete()
          .eq('post_id', postId)
          .eq('interaction_type', 'like');
          
        if (unlikeError) throw unlikeError;
        
        // Decrement the likes count
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes: Math.max(0, parseInt(existingLike.likes) - 1) })
          .eq('id', postId);
        
        if (updateError) throw updateError;
        
        return false; // Returned false means the post is now unliked
      } else {
        // Like the post
        const { error: likeError } = await supabase
          .from('post_interactions')
          .insert([{ post_id: postId, interaction_type: 'like' }]);
          
        if (likeError) throw likeError;
        
        // Increment the likes count
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes: supabase.rpc('increment', { row_id: postId }) })
          .eq('id', postId);
        
        if (updateError) throw updateError;
        
        return true; // Returned true means the post is now liked
      }
    } catch (err) {
      console.error('Error liking/unliking post:', err);
      return null; // Returned null means an error occurred
    } finally {
      setLikingPosts(prev => ({ ...prev, [postId]: false }));
    }
  };

  return {
    likePost,
    likingPosts
  };
};
