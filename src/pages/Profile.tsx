
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import PetProfileCard from '@/components/PetProfileCard';
import { mockPosts, mockComments, mockPetProfiles } from '@/data/mockData';
import { useSearchParams } from 'react-router-dom';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const petIdParam = searchParams.get('petId');
  
  // Find the pet profile based on the URL parameter, or default to the first one
  const petProfile = petIdParam 
    ? mockPetProfiles.find(pet => pet.id === petIdParam) || mockPetProfiles[0]
    : mockPetProfiles[0];
    
  const petPosts = mockPosts.filter(post => post.petId === petProfile.id);
  
  // Add follower counts for the example if they don't exist
  if (petProfile.followers === undefined) petProfile.followers = 245;
  if (petProfile.following === undefined) petProfile.following = 132;

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
