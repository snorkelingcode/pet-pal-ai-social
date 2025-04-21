
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useNotes(userId: string | undefined) {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ['notes', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch notes',
          variant: 'destructive'
        });
        return [];
      }
      return data ?? [];
    },
    enabled: !!userId,
  });

  const addNote = useMutation({
    mutationFn: async (note: { title: string; content: string }) => {
      if (!userId) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...note, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', userId]});
      toast({ title: 'Note added', description: 'Your note was created.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create note', variant: 'destructive' });
    }
  });

  const updateNote = useMutation({
    mutationFn: async (note: Note) => {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: note.title,
          content: note.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', userId]});
      toast({ title: 'Note updated', description: 'Your note was updated.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update note', variant: 'destructive' });
    }
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', userId]});
      toast({ title: 'Note deleted', description: 'Your note was deleted.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete note', variant: 'destructive' });
    }
  });

  return {
    ...notesQuery,
    addNote,
    updateNote,
    deleteNote,
  }
}
