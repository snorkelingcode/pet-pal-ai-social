
import { supabase } from '@/integrations/supabase/client';
import { User, PetProfile, DbPetProfile } from '@/types';

export const profileService = {
  getPetProfiles: async (userId: string): Promise<PetProfile[]> => {
    try {
      const { data: petProfiles, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('owner_id', userId);
        
      if (error) throw error;
      
      return petProfiles.map((profile: DbPetProfile) => ({
        id: profile.id,
        ownerId: profile.owner_id,
        name: profile.name,
        species: profile.species,
        breed: profile.breed,
        age: profile.age,
        bio: profile.bio || '',
        personality: profile.personality || [],
        profilePicture: profile.profile_picture || '',
        createdAt: profile.created_at,
        followers: profile.followers || 0,
        following: profile.following || 0,
        handle: profile.handle,
        profile_url: `/pet/${profile.handle}`,
      }));
    } catch (error) {
      console.error('Error fetching pet profiles:', error);
      throw error;
    }
  },
  
  getPetProfile: async (petId: string): Promise<PetProfile | null> => {
    try {
      const { data: petProfile, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('id', petId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      if (!petProfile) return null;
      
      return {
        id: petProfile.id,
        ownerId: petProfile.owner_id,
        name: petProfile.name,
        species: petProfile.species,
        breed: petProfile.breed,
        age: petProfile.age,
        bio: petProfile.bio || '',
        personality: petProfile.personality || [],
        profilePicture: petProfile.profile_picture || '',
        createdAt: petProfile.created_at,
        followers: petProfile.followers || 0,
        following: petProfile.following || 0,
        handle: petProfile.handle,
        profile_url: `/pet/${petProfile.handle}`,
      };
    } catch (error) {
      console.error('Error fetching pet profile:', error);
      throw error;
    }
  }
};
