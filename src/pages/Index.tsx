
import React from 'react';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import PostCard from '@/components/PostCard';
import PetProfileCard from '@/components/PetProfileCard';
import { mockPosts, mockComments, mockPetProfiles } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <Layout>
      <HeaderCard 
        title="Pet Feed" 
        subtitle="See what your furry friends are up to!"
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          {mockPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              comments={mockComments.filter(comment => comment.postId === post.id)}
            />
          ))}
        </div>

        {!isMobile && (
          <div className="w-full md:w-1/3">
            <h2 className="text-xl font-bold mb-4">Suggested Pets</h2>
            {mockPetProfiles.map((profile) => (
              <PetProfileCard 
                key={profile.id} 
                petProfile={profile} 
                compact 
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
