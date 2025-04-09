
import { PetProfile, AIPersona } from '@/types';
import { mockPetProfiles } from '@/data/mockData';

// This would be replaced with Supabase calls in a real implementation
export const petProfileService = {
  // Get all pet profiles for a user
  getUserPetProfiles: async (userId: string): Promise<PetProfile[]> => {
    // Mock fetching pet profiles for the user
    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter mock data to only include profiles that belong to this user
        const userProfiles = mockPetProfiles.filter(profile => profile.ownerId === userId);
        resolve(userProfiles);
      }, 500);
    });
  },
  
  // Get a single pet profile by ID
  getPetProfile: async (petId: string): Promise<PetProfile | null> => {
    // Mock fetching a pet profile by ID
    return new Promise((resolve) => {
      setTimeout(() => {
        const profile = mockPetProfiles.find(profile => profile.id === petId);
        resolve(profile || null);
      }, 300);
    });
  },
  
  // Create a new pet profile
  createPetProfile: async (profileData: Omit<PetProfile, 'id' | 'createdAt' | 'followers' | 'following'>): Promise<PetProfile> => {
    // Mock creating a new pet profile
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProfile: PetProfile = {
          ...profileData,
          id: `pet-${Date.now()}`,
          createdAt: new Date().toISOString(),
          followers: 0,
          following: 0
        };
        // In a real app, we'd save this to the database
        resolve(newProfile);
      }, 800);
    });
  },
  
  // Update an existing pet profile
  updatePetProfile: async (petId: string, profileData: Partial<PetProfile>): Promise<PetProfile> => {
    // Mock updating a pet profile
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const profileIndex = mockPetProfiles.findIndex(profile => profile.id === petId);
        if (profileIndex === -1) {
          reject(new Error('Pet profile not found'));
          return;
        }
        
        // Update the profile
        const updatedProfile = {
          ...mockPetProfiles[profileIndex],
          ...profileData
        };
        
        // In a real app, we'd save this to the database
        resolve(updatedProfile);
      }, 600);
    });
  },
  
  // Delete a pet profile
  deletePetProfile: async (petId: string): Promise<boolean> => {
    // Mock deleting a pet profile
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, we'd delete from the database
        resolve(true);
      }, 500);
    });
  },

  // Generate AI persona for a pet
  generateAIPersona: async (petProfile: PetProfile): Promise<AIPersona> => {
    // In a real app, this would call an AI service to generate a persona
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock AI-generated persona based on pet profile data
        const persona: AIPersona = {
          petId: petProfile.id,
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
          writingStyle: petProfile.personality.includes('clever') 
            ? 'articulate and witty' 
            : petProfile.personality.includes('silly')
              ? 'playful with lots of emojis'
              : 'simple and sweet'
        };
        
        resolve(persona);
      }, 1500);
    });
  }
};
