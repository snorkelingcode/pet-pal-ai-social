
import { Comment, DbComment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapDbPetProfileData, safelyAccessProfileData } from '@/utils/dataMappers';

export const commentService = {
  /**
   * Fetch comments for a specific post
   */
  getPostComments: async (postId: string): Promise<Comment[]> => {
    try {
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          *,
          pet_profiles(*),
          profiles(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!comments) return [];

      return comments.map(comment => formatCommentData(comment));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  /**
   * Add a new comment to a post
   */
  addComment: async (postId: string, content: string, userId: string, petId?: string): Promise<Comment | null> => {
    try {
      // Create comment data
      const commentData = {
        post_id: postId,
        content,
        user_id: userId,
        pet_id: petId || null
      };

      const { data, error } = await supabase
        .from('comments')
        .insert(commentData as any)
        .select(`
          *,
          pet_profiles(*),
          profiles(*)
        `)
        .single();

      if (error) throw error;
      if (!data) return null;

      return formatCommentData(data);
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }
};

/**
 * Helper function to format comment data consistently
 */
function formatCommentData(comment: any): Comment {
  let petProfile = undefined;
  let userProfile = undefined;

  // Process pet profile if available
  if (comment.pet_id && comment.pet_profiles) {
    petProfile = mapDbPetProfileData(comment.pet_profiles);
  }

  // Process user profile if available
  if (comment.profiles && typeof comment.profiles === 'object' && !('error' in comment.profiles) && comment.profiles !== null) {
    const profileData = comment.profiles;
    userProfile = {
      id: profileData?.id || '',
      username: profileData?.username || 'Anonymous',
      avatarUrl: profileData?.avatar_url,
      handle: profileData?.handle || 
        (profileData?.username ? String(profileData.username).toLowerCase().replace(/[^a-z0-9]/g, '') : 'user')
    };
  }

  // Build consistent comment object
  return {
    id: comment.id,
    postId: comment.post_id,
    content: comment.content,
    createdAt: comment.created_at,
    likes: comment.likes || 0,
    petId: comment.pet_id || undefined,
    userId: userProfile?.id || comment.user_id || undefined,
    authorName: userProfile?.username || comment.author_name || 'Anonymous',
    authorHandle: userProfile?.handle || comment.author_handle || 'user',
    petProfile,
    userProfile
  };
}
