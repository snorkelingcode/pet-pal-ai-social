
import { PetProfile, User } from '@/types';

/**
 * Maps database pet profile data to the PetProfile type
 */
export function mapDbPetProfileData(pet: any): PetProfile {
  const handle = pet.handle || pet.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
  return {
    id: pet.id,
    ownerId: pet.owner_id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    personality: pet.personality || [],
    bio: pet.bio || '',
    profilePicture: pet.profile_picture || '',
    createdAt: pet.created_at,
    followers: pet.followers || 0,
    following: pet.following || 0,
    handle: handle,
    profile_url: pet.profile_url || `/pet/${handle}`
  };
}

/**
 * Maps database user profile to the User type
 */
export function mapDbUserProfile(profile: any): User {
  return {
    id: profile.id,
    username: profile.username || 'Anonymous',
    email: profile.email || '',
    bio: profile.bio || undefined,
    avatarUrl: profile.avatar_url || undefined,
    createdAt: profile.created_at,
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
