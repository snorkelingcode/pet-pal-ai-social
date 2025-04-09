
import { PetProfile, AIPersona, DbPetProfile, DbAIPersona, mapDbPetProfileToPetProfile, mapDbAIPersonaToAIPersona } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const petProfileService = {
  // Get all pet profiles for a user
  getUserPetProfiles: async (userId: string): Promise<PetProfile[]> => {
    try {
      const { data: dbPetProfiles, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('owner_id', userId);
        
      if (error) throw error;
      
      return (dbPetProfiles as DbPetProfile[]).map(mapDbPetProfileToPetProfile);
    } catch (error) {
      console.error('Error fetching user pet profiles:', error);
      throw error;
    }
  },
  
  // Get a single pet profile by ID
  getPetProfile: async (petId: string): Promise<PetProfile | null> => {
    try {
      const { data: dbPetProfile, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('id', petId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, profile not found
          return null;
        }
        throw error;
      }
      
      return dbPetProfile ? mapDbPetProfileToPetProfile(dbPetProfile as DbPetProfile) : null;
    } catch (error) {
      console.error('Error fetching pet profile:', error);
      throw error;
    }
  },
  
  // Create a new pet profile
  createPetProfile: async (
    profileData: Omit<PetProfile, 'id' | 'createdAt' | 'followers' | 'following'>
  ): Promise<PetProfile> => {
    try {
      // Convert from frontend structure to database structure
      const dbPetProfile: Omit<DbPetProfile, 'id' | 'created_at' | 'followers' | 'following'> = {
        owner_id: profileData.ownerId,
        name: profileData.name,
        species: profileData.species,
        breed: profileData.breed,
        age: profileData.age,
        personality: profileData.personality,
        bio: profileData.bio,
        profile_picture: profileData.profilePicture,
      };
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .insert([dbPetProfile])
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) throw new Error('No data returned from pet profile creation');
      
      return mapDbPetProfileToPetProfile(data as DbPetProfile);
    } catch (error) {
      console.error('Error creating pet profile:', error);
      throw error;
    }
  },
  
  // Update an existing pet profile
  updatePetProfile: async (petId: string, profileData: Partial<PetProfile>): Promise<PetProfile> => {
    try {
      // Convert from frontend structure to database structure
      const updates: Partial<DbPetProfile> = {};
      
      if (profileData.name !== undefined) updates.name = profileData.name;
      if (profileData.species !== undefined) updates.species = profileData.species;
      if (profileData.breed !== undefined) updates.breed = profileData.breed;
      if (profileData.age !== undefined) updates.age = profileData.age;
      if (profileData.personality !== undefined) updates.personality = profileData.personality;
      if (profileData.bio !== undefined) updates.bio = profileData.bio;
      if (profileData.profilePicture !== undefined) updates.profile_picture = profileData.profilePicture;
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .update(updates)
        .eq('id', petId)
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) throw new Error('No data returned from pet profile update');
      
      return mapDbPetProfileToPetProfile(data as DbPetProfile);
    } catch (error) {
      console.error('Error updating pet profile:', error);
      throw error;
    }
  },
  
  // Delete a pet profile
  deletePetProfile: async (petId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pet_profiles')
        .delete()
        .eq('id', petId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting pet profile:', error);
      throw error;
    }
  },

  // Generate AI persona for a pet
  generateAIPersona: async (petProfile: PetProfile): Promise<AIPersona> => {
    try {
      // First, check if a persona already exists for this pet
      const { data: existingPersona, error: fetchError } = await supabase
        .from('ai_personas')
        .select('*')
        .eq('pet_id', petProfile.id)
        .single();
        
      if (existingPersona) {
        return mapDbAIPersonaToAIPersona(existingPersona as DbAIPersona);
      }
      
      // Create a new AI persona based on pet profile characteristics
      const newPersona: Omit<DbAIPersona, 'id'> = {
        pet_id: petProfile.id,
        tone: petProfile.personality.includes('grumpy') ? 'sarcastic and grumpy' : 'playful and friendly',
        quirks: [
          `Always ${petProfile.personality.includes('bossy') ? 'tries to be in charge' : 'wants attention'}`,
          `${petProfile.personality.includes('lazy') ? 'Loves napping in sunspots' : 'Energetic and always ready to play'}`
        ],
        catchphrases: [
          `${petProfile.personality.includes('sassy') ? "I'm too fabulous for this" : "Let's have fun together!"}`,
          `${petProfile.species === 'dog' ? 'Bork bork!' : petProfile.species === 'cat' ? 'Meow, human' : 'Hello friend!'}`
        ],
        interests: [
          petProfile.species === 'dog' ? 'chasing balls' : 'chasing laser pointers',
          'treats',
          'cuddles'
        ],
        dislikes: [
          petProfile.species === 'dog' ? 'vacuum cleaners' : 'water',
          'being alone',
          'thunder'
        ],
        writing_style: petProfile.personality.includes('clever') 
          ? 'articulate and witty' 
          : petProfile.personality.includes('silly')
            ? 'playful with lots of emojis'
            : 'simple and sweet'
      };
      
      const { data: insertedPersona, error: insertError } = await supabase
        .from('ai_personas')
        .insert([newPersona])
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      return mapDbAIPersonaToAIPersona(insertedPersona as DbAIPersona);
    } catch (error) {
      console.error('Error generating AI persona:', error);
      throw error;
    }
  }
};
