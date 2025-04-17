import { useState, useEffect } from 'react';
import { Post, Comment, mapDbCommentToComment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type CommentData = {
  id: string;
  post_id: string;
  pet_id: string | null;
  user_id: string | null;
  content: string;
  likes: number;
  created_at: string;
  pet_profiles?: {
    id: string;
    name: string;
    species: string;
    breed: string;
    profile_picture: string | null;
    handle: string;
  } | null;
  profiles?: {
    id: string;
    username: string;
    avatar_url: string | null;
    handle: string;
  } | null;
};

export const useFeedData = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const postsResponse = await supabase
          .from('posts')
          .select(`
            id,
            pet_id,
            content,
            image,
            likes,
            comments,
            created_at,
            pet_profiles:pet_id (
              id,
              name,
              species,
              breed,
              age,
              personality,
              bio,
              profile_picture,
              followers,
              following,
              handle
            )
          `)
          .order('created_at', { ascending: false });

        if (postsResponse.error) {
          throw postsResponse.error;
        }

        if (!postsResponse.data || postsResponse.data.length === 0) {
          setPosts([]);
          setComments([]);
          setLoadingData(false);
          return;
        }

        const postIds = postsResponse.data.map(post => post.id);

        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id,
            post_id,
            pet_id,
            user_id,
            content,
            likes,
            created_at,
            pet_profiles:pet_id (
              id,
              name,
              species,
              breed,
              profile_picture,
              handle
            ),
            profiles:user_id (
              id,
              username,
              avatar_url,
              handle
            )
          `)
          .in('post_id', postIds);

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          toast({
            title: "Warning",
            description: "Could not load comments. Some features may be limited.",
            variant: "destructive",
          });

          const formattedPosts = mapPostsData(postsResponse.data);
          setPosts(formattedPosts);
          setComments([]);
          setLoadingData(false);
          return;
        }

        const formattedPosts = mapPostsData(postsResponse.data);
        const formattedComments: Comment[] = [];

        if (commentsData) {
          const typedCommentsData = commentsData as unknown as CommentData[];

          typedCommentsData.forEach(comment => {
            if (!comment) return;

            const formattedComment: Comment = {
              id: comment.id,
              postId: comment.post_id,
              petId: comment.pet_id || undefined,
              userId: comment.user_id || undefined,
              content: comment.content,
              likes: comment.likes,
              createdAt: comment.created_at,
              petProfile: comment.pet_id && comment.pet_profiles ? {
                id: comment.pet_profiles.id,
                name: comment.pet_profiles.name,
                species: comment.pet_profiles.species,
                breed: comment.pet_profiles.breed,
                profilePicture: comment.pet_profiles.profile_picture || undefined,
                age: 0,
                personality: [],
                bio: '',
                ownerId: '',
                createdAt: '',
                followers: 0,
                following: 0,
                handle: comment.pet_profiles.handle || comment.pet_profiles.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
              } : undefined,
              userProfile: comment.user_id && comment.profiles ? {
                id: comment.profiles.id,
                username: comment.profiles.username,
                avatarUrl: comment.profiles.avatar_url || undefined,
                handle: comment.profiles.handle
              } : undefined
            };
            formattedComments.push(formattedComment);
          });
        }

        setPosts(formattedPosts);
        setComments(formattedComments);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again later.",
          variant: "destructive",
        });
        setPosts([]);
        setComments([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();

    const postsChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchData();
      })
      .subscribe();

    const commentsChannel = supabase
      .channel('public:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchData();
      })
      .subscribe();

    const interactionsChannel = supabase
      .channel('public:post_interactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_interactions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(interactionsChannel);
    };
  }, [userId]);

  const mapPostsData = (postsData: any[]): Post[] => {
    return postsData.map(post => ({
      id: post.id,
      petId: post.pet_id,
      petProfile: {
        id: post.pet_profiles.id,
        name: post.pet_profiles.name,
        species: post.pet_profiles.species,
        breed: post.pet_profiles.breed,
        age: post.pet_profiles.age,
        personality: post.pet_profiles.personality,
        bio: post.pet_profiles.bio,
        profilePicture: post.pet_profiles.profile_picture,
        followers: post.pet_profiles.followers,
        following: post.pet_profiles.following,
        ownerId: '',
        createdAt: '',
        handle: post.pet_profiles.handle,
        profile_url: `/pet/${post.pet_profiles.handle}`,
      },
      content: post.content,
      image: post.image,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.created_at,
    }));
  };

  return { posts, comments, loadingData };
};
