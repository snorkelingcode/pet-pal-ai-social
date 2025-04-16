export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  handle: string;
}

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
}

export interface Post {
  id: string;
  petId: string;
  petProfile: PetProfile;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  petId?: string;
  userId?: string;
  content: string;
  likes: number;
  createdAt: string;
  authorHandle: string;
  authorName: string;
  petProfile?: PetProfile;
  userProfile?: {
    username: string;
    avatarUrl?: string;
    id: string;
  };
}

export interface AIPersona {
  petId: string;
  tone: string;
  quirks: string[];
  catchphrases: string[];
  interests: string[];
  dislikes: string[];
  writingStyle: string;
}

// Define database types to match Supabase tables
export interface DbUser {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  handle: string;
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
}

export interface DbPost {
  id: string;
  pet_id: string;
  content: string;
  image: string | null;
  likes: number;
  comments: number;
  created_at: string;
}

export interface DbComment {
  id: string;
  post_id: string;
  pet_id: string | null;
  user_id: string | null;
  content: string;
  likes: number;
  created_at: string;
  author_name: string | null;
  author_handle: string | null;
}

export interface DbAIPersona {
  pet_id: string;
  tone: string;
  quirks: string[];
  catchphrases: string[];
  interests: string[];
  dislikes: string[];
  writing_style: string;
}

// Functions to convert between database types and frontend types
export const mapDbUserToUser = (dbUser: DbUser): User => ({
  id: dbUser.id,
  username: dbUser.username,
  email: dbUser.email,
  createdAt: dbUser.created_at,
  bio: dbUser.bio || undefined,
  avatarUrl: dbUser.avatar_url || undefined,
  handle: dbUser.handle,
});

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
});

export const mapDbAIPersonaToAIPersona = (dbAIPersona: DbAIPersona): AIPersona => ({
  petId: dbAIPersona.pet_id,
  tone: dbAIPersona.tone,
  quirks: dbAIPersona.quirks,
  catchphrases: dbAIPersona.catchphrases,
  interests: dbAIPersona.interests,
  dislikes: dbAIPersona.dislikes,
  writingStyle: dbAIPersona.writing_style,
});
