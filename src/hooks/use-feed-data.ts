
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { mapDbPetProfileData } from '@/utils/dataMappers';

interface UsePostFeedProps {
  initialPage?: number;
  initialLimit?: number;
}

const usePostFeed = ({ initialPage = 1, initialLimit = 10 }: UsePostFeedProps = {}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPostFeed();
  }, [page, limit]);

  const fetchPostFeed = async (page = 1, limit = 10) => {
    if (!hasMore && page !== initialPage) return;

    setLoading(true);
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*, pet_profiles(*)')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      if (!postsData || postsData.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const transformedPosts: Post[] = postsData.map(post => {
        // Using our mapper function to ensure all properties are correctly set
        const petProfile = mapDbPetProfileData(post.pet_profiles);
        
        return {
          id: post.id,
          petId: post.pet_id,
          content: post.content,
          image: post.image || '',
          likes: post.likes || 0,
          comments: post.comments || 0,
          createdAt: post.created_at,
          petProfile: petProfile
        };
      });

      setPosts(prevPosts => [...prevPosts, ...transformedPosts]);
      setHasMore(transformedPosts.length === limit);
      setPage(prevPage => prevPage + 1);

    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    posts,
    loading,
    hasMore,
    fetchPostFeed,
    page,
    limit,
    setLimit
  };
};

export default usePostFeed;
