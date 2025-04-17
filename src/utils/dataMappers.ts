
import { PetProfile, User } from '@/types';

/**
 * Maps database pet profile data to the PetProfile type
 */
export function mapDbPetProfileData(pet: any): PetProfile {
  if (!pet) {
    console.warn("Attempted to map undefined or null pet profile data");
    return {
      id: '',
      ownerId: '',
      name: 'Unknown Pet',
      species: 'Unknown',
      breed: 'Unknown',
      age: 0,
      personality: [],
      bio: '',
      profilePicture: '',
      createdAt: new Date().toISOString(),
      followers: 0,
      following: 0,
      handle: 'unknown',
      profile_url: '/pet/unknown'
    };
  }

  // Generate handle if it's not present in the database record
  const handle = pet.handle || pet.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'unknown';
  // Generate profile URL if it's not present
  const profileUrl = pet.profile_url || `/pet/${handle}`;

  return {
    id: pet.id || '',
    ownerId: pet.owner_id || '',
    name: pet.name || 'Unknown Pet',
    species: pet.species || 'Unknown',
    breed: pet.breed || 'Unknown',
    age: pet.age || 0,
    personality: pet.personality || [],
    bio: pet.bio || '',
    profilePicture: pet.profile_picture || '',
    createdAt: pet.created_at || new Date().toISOString(),
    followers: pet.followers || 0,
    following: pet.following || 0,
    handle: handle,
    profile_url: profileUrl
  };
}

/**
 * Maps database user profile to the User type
 */
export function mapDbUserProfile(profile: any): User {
  if (!profile) {
    console.warn("Attempted to map undefined or null user profile data");
    return {
      id: '',
      username: 'Anonymous',
      email: '',
      createdAt: new Date().toISOString(),
      handle: 'anonymous'
    };
  }

  return {
    id: profile.id || '',
    username: profile.username || 'Anonymous',
    email: profile.email || '',
    bio: profile.bio || undefined,
    avatarUrl: profile.avatar_url || undefined,
    createdAt: profile.created_at || new Date().toISOString(),
    handle: profile.handle || profile.username?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user',
  };
}

/**
 * Safely tries to access profile data
 */
export function safelyAccessProfileData<T>(data: any, fallback: T): T {
  if (!data) return fallback;
  if (data.error) return fallback;
  return data as T;
}
