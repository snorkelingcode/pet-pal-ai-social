
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  bio?: string;
  avatarUrl?: string;
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
  profilePicture: string;
  createdAt: string;
  followers: number;
  following: number;
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
  petId: string;
  petProfile: PetProfile;
  content: string;
  likes: number;
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
