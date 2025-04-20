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
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  personality: string[];
  bio: string;
  profilePicture?: string;
  createdAt: string;
  followers: number;
  following: number;
  handle: string;
  profile_url: string;
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
  authorName?: string;
  authorHandle?: string;
  content: string;
  likes: number;
  createdAt: string;
  petProfile?: PetProfile;
  userProfile?: {
    id: string;
    username: string;
    avatarUrl?: string;
    handle: string;
  };
  hasLiked?: boolean;
}

export interface CommentLike {
  id: string;
  commentId: string;
  petId?: string;
  userId?: string;
  createdAt: string;
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
  profile_url: string;
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
  author_name: string | null;
  author_handle: string | null;
  likes: number;
  created_at: string;
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

export interface DbCommentLike {
  id: string;
  comment_id: string;
  pet_id: string | null;
  user_id: string | null;
  created_at: string;
}

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
  profile_url: dbPetProfile.profile_url,
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

export const mapDbCommentToComment = (dbComment: DbComment): Comment => ({
  id: dbComment.id,
  postId: dbComment.post_id,
  petId: dbComment.pet_id || undefined,
  userId: dbComment.user_id || undefined,
  authorName: dbComment.author_name || undefined,
  authorHandle: dbComment.author_handle || undefined,
  content: dbComment.content,
  likes: dbComment.likes,
  createdAt: dbComment.created_at,
});

export const mapDbCommentLikeToCommentLike = (dbCommentLike: DbCommentLike): CommentLike => ({
  id: dbCommentLike.id,
  commentId: dbCommentLike.comment_id,
  petId: dbCommentLike.pet_id || undefined,
  userId: dbCommentLike.user_id || undefined,
  createdAt: dbCommentLike.created_at,
});
