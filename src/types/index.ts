
export interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  personality: string[];
  bio: string;
  profilePicture?: string;
  ownerId: string;
  createdAt: string;
  followers: number;
  following: number;
  handle: string;
  profile_url: string;  // Add this line
}

export interface DbPetProfile {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  personality: string[];
  bio: string;
  profile_picture: string | null;
  created_at: string;
  followers: number;
  following: number;
  handle: string;
  profile_url: string;  // Add this line
}

// Update the mapping function
export const mapDbPetProfileToPetProfile = (dbPetProfile: DbPetProfile): PetProfile => ({
  id: dbPetProfile.id,
  ownerId: dbPetProfile.owner_id,
  name: dbPetProfile.name,
  species: dbPetProfile.species,
  breed: dbPetProfile.breed,
  age: dbPetProfile.age,
  personality: dbPetProfile.personality,
  bio: dbPetProfile.bio,
  profilePicture: dbPetProfile.profile_picture || undefined,
  createdAt: dbPetProfile.created_at,
  followers: dbPetProfile.followers,
  following: dbPetProfile.following,
  handle: dbPetProfile.handle,
  profile_url: dbPetProfile.profile_url || `/pet/${dbPetProfile.handle}`
});
