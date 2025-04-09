
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
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
