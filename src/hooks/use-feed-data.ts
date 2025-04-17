import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { mapDbPetProfileData } from '@/utils/dataMappers';

interface UsePostFeedProps {
  initialPage?: number;
  initialLimit?: number;
  petId?: string;
}

const usePostFeed = ({ initialPage = 1, initialLimit = 10, petId }: UsePostFeedProps = {}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchPostFeed = async (fetchPage = initialPage, fetchLimit = initialLimit, reset = false) => {
    if (!hasMore && fetchPage !== initialPage && !reset) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*, pet_profiles(*)')
        .order('created_at', { ascending: false });
        
      if (petId) {
        query = query.eq('pet_id', petId);
      }
      
      query = query.range((fetchPage - 1) * fetchLimit, fetchPage * fetchLimit - 1);
      
      const { data: postsData, error } = await query;

      if (error) {
        throw error;
      }

      if (!postsData || postsData.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const transformedPosts: Post[] = postsData.map(post => {
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

      if (reset || initialLoad) {
        setPosts(transformedPosts);
        setInitialLoad(false);
      } else {
        const existingPostIds = new Set(posts.map(post => post.id));
        const newPosts = transformedPosts.filter(post => !existingPostIds.has(post.id));
        
        if (newPosts.length > 0) {
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
        }
      }

      setHasMore(transformedPosts.length === fetchLimit);
      setPage(fetchPage + 1);

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

  const refreshFeed = () => {
    setPage(initialPage);
    setHasMore(true);
    fetchPostFeed(initialPage, limit, true);
  };

  useEffect(() => {
    fetchPostFeed(page, limit);
  }, []);

  return {
    posts,
    loading,
    hasMore,
    fetchPostFeed,
    refreshFeed,
    page,
    limit,
    setLimit
  };
};

export default usePostFeed;
