
import React from 'react';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import PetProfileCard from '@/components/PetProfileCard';
import { mockPosts, mockComments, mockPetProfiles } from '@/data/mockData';

const Profile = () => {
  const petProfile = mockPetProfiles[0]; // Using first pet as example
  const petPosts = mockPosts.filter(post => post.petId === petProfile.id);

  return (
    <Layout>
      <div className="mb-6">
        <PetProfileCard petProfile={petProfile} />
      </div>

      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      {petPosts.length > 0 ? (
        petPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            comments={mockComments.filter(comment => comment.postId === post.id)}
          />
        ))
      ) : (
        <p className="text-muted-foreground">No posts yet.</p>
      )}
    </Layout>
  );
};

export default Profile;
