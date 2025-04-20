
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface PetMemory {
  id: string;
  petId: string;
  content: string;
  memoryType: string;
  sentiment: number;
  importance: number;
  createdAt: string;
  lastAccessedAt?: string;
  accessCount?: number;
  relatedPetId?: string;
  relatedPostId?: string;
  similarity?: number;
}

// Map database response to frontend model
const mapDbMemoryToPetMemory = (dbMemory: any): PetMemory => ({
  id: dbMemory.id,
  petId: dbMemory.pet_id,
  content: dbMemory.content,
  memoryType: dbMemory.memory_type,
  sentiment: dbMemory.sentiment || 0,
  importance: dbMemory.importance || 5,
  createdAt: dbMemory.created_at,
  lastAccessedAt: dbMemory.last_accessed_at,
  accessCount: dbMemory.access_count,
  relatedPetId: dbMemory.related_pet_id,
  relatedPostId: dbMemory.related_post_id,
  similarity: dbMemory.similarity,
});

export const petMemoryService = {
  // Store a new memory for a pet
  storeMemory: async (
    petId: string, 
    content: string, 
    type: string, 
    relatedPetId?: string,
    relatedPostId?: string
  ): Promise<PetMemory | null> => {
    try {
      const relatedId = relatedPetId || relatedPostId;
      const relatedType = relatedPetId ? 'pet' : relatedPostId ? 'post' : undefined;
      
      const { data, error } = await supabase.functions.invoke('pet-ai-learning', {
        body: {
          action: 'store_memory',
          petId,
          content,
          type,
          relatedId,
          relatedType,
        },
      });

      if (error) throw error;
      
      return data?.memory ? mapDbMemoryToPetMemory(data.memory) : null;
    } catch (error) {
      console.error('Error storing memory:', error);
      toast({
        title: 'Error',
        description: 'Failed to store pet memory',
        variant: 'destructive',
      });
      return null;
    }
  },

  // Retrieve memories relevant to specific context
  getRelevantMemories: async (
    petId: string,
    context: string
  ): Promise<PetMemory[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-learning', {
        body: {
          action: 'retrieve_relevant_memories',
          petId,
          content: context,
        },
      });

      if (error) throw error;
      
      return (data?.memories || []).map(mapDbMemoryToPetMemory);
    } catch (error) {
      console.error('Error retrieving memories:', error);
      toast({
        title: 'Error',
        description: 'Failed to retrieve pet memories',
        variant: 'destructive',
      });
      return [];
    }
  },
  
  // Get all memories for a pet
  getAllMemories: async (petId: string): Promise<PetMemory[]> => {
    try {
      // Use the edge function to get memories instead of direct database access
      // This avoids type errors since pet_memories is not in the generated types
      const { data, error } = await supabase.functions.invoke('pet-ai-learning', {
        body: {
          action: 'get_all_memories',
          petId,
        },
      });
      
      if (error) throw error;
      
      return (data?.memories || []).map(mapDbMemoryToPetMemory);
    } catch (error) {
      console.error('Error fetching all memories:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pet memories',
        variant: 'destructive',
      });
      return [];
    }
  },
  
  // Get pet relationships
  getPetRelationships: async (petId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-learning', {
        body: {
          action: 'get_relationships',
          petId,
        },
      });

      if (error) throw error;
      
      return data?.relationships || [];
    } catch (error) {
      console.error('Error fetching relationships:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pet relationships',
        variant: 'destructive',
      });
      return [];
    }
  }
};
