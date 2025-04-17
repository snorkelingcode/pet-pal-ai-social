
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
  profile_url: string;
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
  profile_url: string;
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  handle?: string;
}

export interface DbUser {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  handle?: string;
  created_at: string;
}

// Post types
export interface Post {
  id: string;
  petId: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string;
  petProfile: PetProfile;
}

export interface DbPost {
  id: string;
  pet_id: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  created_at: string;
}

// Comment types
export interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  likes: number;
  petId?: string;
  userId?: string;
  petProfile?: PetProfile;
  userProfile?: {
    id: string;
    username: string;
    avatarUrl?: string;
    handle?: string;
  };
}

export interface DbComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  likes: number;
  pet_id?: string;
  user_id?: string;
  author_name?: string;
  author_handle?: string;
}

// Mapping functions
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

export const mapDbUserToUser = (dbUser: DbUser): User => ({
  id: dbUser.id,
  email: dbUser.email,
  username: dbUser.username,
  avatarUrl: dbUser.avatar_url,
  bio: dbUser.bio,
  handle: dbUser.handle || dbUser.username?.toLowerCase().replace(/[^a-z0-9]/g, '')
});

export const mapDbPostToPost = (dbPost: DbPost, petProfile: PetProfile): Post => ({
  id: dbPost.id,
  petId: dbPost.pet_id,
  content: dbPost.content,
  image: dbPost.image,
  likes: dbPost.likes,
  comments: dbPost.comments,
  createdAt: dbPost.created_at,
  petProfile
});

export const mapDbCommentToComment = (
  dbComment: DbComment, 
  petProfile?: PetProfile, 
  userProfile?: User
): Comment => ({
  id: dbComment.id,
  postId: dbComment.post_id,
  content: dbComment.content,
  createdAt: dbComment.created_at,
  likes: dbComment.likes,
  petId: dbComment.pet_id,
  userId: dbComment.user_id,
  petProfile,
  userProfile: userProfile ? {
    id: userProfile.id,
    username: userProfile.username || dbComment.author_name || 'Anonymous',
    avatarUrl: userProfile.avatarUrl,
    handle: userProfile.handle || dbComment.author_handle
  } : undefined
});

// AI Persona types
export interface AIPersona {
  petId: string;
  tone: string;
  quirks: string[];
  catchphrases: string[];
  interests: string[];
  dislikes: string[];
  writingStyle: string;
  adaptivePreferences?: Record<string, any>;
  personalityEvolution?: Record<string, any>;
  learningRate?: number;
}

export interface DbAIPersona {
  id: string;
  pet_id: string;
  tone: string;
  quirks: string[];
  catchphrases: string[];
  interests: string[];
  dislikes: string[];
  writing_style: string;
  adaptive_preferences?: Record<string, any>;
  personality_evolution?: Record<string, any>;
  learning_rate?: number;
}

export const mapDbAIPersonaToAIPersona = (dbPersona: DbAIPersona): AIPersona => ({
  petId: dbPersona.pet_id,
  tone: dbPersona.tone,
  quirks: dbPersona.quirks,
  catchphrases: dbPersona.catchphrases,
  interests: dbPersona.interests,
  dislikes: dbPersona.dislikes,
  writingStyle: dbPersona.writing_style,
  adaptivePreferences: dbPersona.adaptive_preferences,
  personalityEvolution: dbPersona.personality_evolution,
  learningRate: dbPersona.learning_rate
});
