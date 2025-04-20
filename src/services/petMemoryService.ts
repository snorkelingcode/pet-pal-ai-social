
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

export interface PetRelationship {
  id: string;
  petId: string;
  relatedPetId: string;
  relationshipType: string;
  familiarity: number;
  sentiment: number;
  lastInteractionAt: string;
  interactionHistory?: Array<{
    interactionType: string;
    timestamp: string;
    sentiment: number;
    summary: string;
  }>;
  relatedPet?: {
    id: string;
    name: string;
    species: string;
    breed: string;
    profilePicture?: string;
    handle: string;
  };
}

export interface PersonalityEvolution {
  toneShifts: Record<string, number>;
  emergingInterests: Record<string, number>;
  fadingInterests: Record<string, number>;
  emergingQuirks: Record<string, number>;
  lastEvolution: string | null;
  evolutionStage: number;
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

const mapDbRelationshipToPetRelationship = (dbRelationship: any): PetRelationship => ({
  id: dbRelationship.id,
  petId: dbRelationship.pet_id,
  relatedPetId: dbRelationship.related_pet_id,
  relationshipType: dbRelationship.relationship_type,
  familiarity: dbRelationship.familiarity,
  sentiment: dbRelationship.sentiment || 0,
  lastInteractionAt: dbRelationship.last_interaction_at,
  interactionHistory: dbRelationship.interaction_history || [],
  relatedPet: dbRelationship.related_pet ? {
    id: dbRelationship.related_pet.id,
    name: dbRelationship.related_pet.name,
    species: dbRelationship.related_pet.species,
    breed: dbRelationship.related_pet.breed,
    profilePicture: dbRelationship.related_pet.profile_picture,
    handle: dbRelationship.related_pet.handle,
  } : undefined,
});

const mapDbPersonalityEvolution = (dbEvolution: any): PersonalityEvolution => {
  if (!dbEvolution) {
    return {
      toneShifts: {},
      emergingInterests: {},
      fadingInterests: {},
      emergingQuirks: {},
      lastEvolution: null,
      evolutionStage: 1
    };
  }
  
  return {
    toneShifts: dbEvolution.tone_shifts || {},
    emergingInterests: dbEvolution.emerging_interests || {},
    fadingInterests: dbEvolution.fading_interests || {},
    emergingQuirks: dbEvolution.emerging_quirks || {},
    lastEvolution: dbEvolution.last_evolution || null,
    evolutionStage: dbEvolution.evolution_stage || 1
  };
};

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
      // Use the edge function to get memories
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
  getPetRelationships: async (petId: string): Promise<PetRelationship[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-learning', {
        body: {
          action: 'get_relationships',
          petId,
        },
      });

      if (error) throw error;
      
      return (data?.relationships || []).map(mapDbRelationshipToPetRelationship);
    } catch (error) {
      console.error('Error fetching relationships:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pet relationships',
        variant: 'destructive',
      });
      return [];
    }
  },
  
  // Get personality evolution data
  getPersonalityEvolution: async (petId: string): Promise<PersonalityEvolution> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-learning', {
        body: {
          action: 'get_personality_evolution',
          petId,
        },
      });

      if (error) throw error;
      
      return mapDbPersonalityEvolution(data?.evolution);
    } catch (error) {
      console.error('Error fetching personality evolution:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch personality evolution data',
        variant: 'destructive',
      });
      return {
        toneShifts: {},
        emergingInterests: {},
        fadingInterests: {},
        emergingQuirks: {},
        lastEvolution: null,
        evolutionStage: 1
      };
    }
  }
};
