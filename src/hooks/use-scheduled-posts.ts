
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useScheduledPosts(petId?: string) {
  return useQuery({
    queryKey: ['scheduled-posts', petId],
    queryFn: async () => {
      if (!petId) return [];

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          posts(*)
        `)
        .eq('pet_id', petId)
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled posts:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch scheduled posts',
          variant: 'destructive',
        });
        return [];
      }

      return data || [];
    },
    enabled: !!petId,
    refetchInterval: 60000, // Refetch every minute to keep status updated
  });
}
