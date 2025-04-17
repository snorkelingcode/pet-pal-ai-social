import { PetProfile, AIPersona, DbPetProfile, DbAIPersona, mapDbPetProfileToPetProfile, mapDbAIPersonaToAIPersona } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Helper function to convert a name to a basic handle (lowercase, no spaces)
const nameToBasicHandle = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Generate a unique handle for a pet profile
const generateUniqueHandle = async (baseName: string): Promise<string> => {
  try {
    // Convert name to a basic handle format
    const baseHandle = nameToBasicHandle(baseName);
    
    // Check if the handle is already taken
    const { data, error } = await supabase
      .from('pet_profiles')
      .select('id')
      .eq('handle', baseHandle)
      .single();
    
    // If handle is available, return it
    if (error && error.code === 'PGRST116') {
      return baseHandle;
    }
    
    // If handle is taken, add a random number suffix
    const suffix = Math.floor(Math.random() * 10000).toString();
    return `${baseHandle}${suffix}`;
  } catch (error) {
    console.error('Error generating unique handle:', error);
    // Fallback to a timestamp-based handle in case of error
    return `pet${Date.now().toString().substring(7)}`;
  }
};

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
    profileData: Omit<PetProfile, 'id' | 'createdAt' | 'followers' | 'following' | 'handle'>
  ): Promise<PetProfile> => {
    try {
      console.log("Creating pet profile with data:", profileData);
      
      // Generate a unique handle for the pet
      const handle = await generateUniqueHandle(profileData.name);
      
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
        handle: handle,
      };
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .insert([dbPetProfile])
        .select()
        .single();
        
      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      
      console.log("Pet profile created successfully:", data);
      
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
      console.log("Updating pet profile:", petId, profileData);
      
      // Convert from frontend structure to database structure
      const updates: Partial<DbPetProfile> = {};
      
      if (profileData.name !== undefined) updates.name = profileData.name;
      if (profileData.species !== undefined) updates.species = profileData.species;
      if (profileData.breed !== undefined) updates.breed = profileData.breed;
      if (profileData.age !== undefined) updates.age = profileData.age;
      if (profileData.personality !== undefined) updates.personality = profileData.personality;
      if (profileData.bio !== undefined) updates.bio = profileData.bio;
      if (profileData.profilePicture !== undefined) updates.profile_picture = profileData.profilePicture;
      if (profileData.handle !== undefined) updates.handle = profileData.handle;
      
      // If name changes but handle doesn't, update the handle too
      if (profileData.name !== undefined && profileData.handle === undefined) {
        const newHandle = await generateUniqueHandle(profileData.name);
        updates.handle = newHandle;
      }
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .update(updates)
        .eq('id', petId)
        .select()
        .single();
        
      if (error) throw error;
      
      console.log("Pet profile updated successfully:", data);
      
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
      console.log("Generating AI persona for pet:", petProfile.id);
      
      // First, check if a persona already exists for this pet
      const { data: existingPersona, error: fetchError } = await supabase
        .from('ai_personas')
        .select('*')
        .eq('pet_id', petProfile.id)
        .single();
        
      if (existingPersona) {
        console.log("Existing AI persona found:", existingPersona);
        return mapDbAIPersonaToAIPersona(existingPersona as DbAIPersona);
      }
      
      console.log("No existing persona, creating new one");
      
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
        
      if (insertError) {
        console.error("Error inserting AI persona:", insertError);
        throw insertError;
      }
      
      console.log("AI persona created successfully:", insertedPersona);
      
      return mapDbAIPersonaToAIPersona(insertedPersona as DbAIPersona);
    } catch (error) {
      console.error('Error generating AI persona:', error);
      throw error;
    }
  },
  
  // Upload a profile image to Supabase storage
  uploadProfileImage: async (file: File): Promise<string | null> => {
    try {
      console.log("Uploading profile image:", file.name);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pets')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading profile image:', uploadError);
        return null;
      }
      
      const { data } = supabase.storage.from('pets').getPublicUrl(filePath);
      console.log("Image uploaded successfully, URL:", data.publicUrl);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      return null;
    }
  }
};
