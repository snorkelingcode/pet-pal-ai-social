
import { supabase } from '@/integrations/supabase/client';
import { User, PetProfile } from '@/types';
import { mapDbPetProfileData } from '@/utils/dataMappers';

export const profileService = {
  getPetProfiles: async (userId: string): Promise<PetProfile[]> => {
    try {
      const { data: petProfiles, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('owner_id', userId);
        
      if (error) throw error;
      
      return petProfiles.map(mapDbPetProfileData);
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
      
      return mapDbPetProfileData(petProfile);
    } catch (error) {
      console.error('Error fetching pet profile:', error);
      throw error;
    }
  }
};
