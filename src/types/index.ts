
export interface Comment {
  id: string;
  postId: string;
  petId?: string;
  petProfile?: PetProfile;
  userId?: string;
  userProfile?: {
    username: string;
    avatarUrl?: string;
    id: string;
  };
  content: string;
  likes: number;
  createdAt: string;
}
