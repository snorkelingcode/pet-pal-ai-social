
import React from 'react';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import PostCard from '@/components/PostCard';
import { mockPosts, mockComments } from '@/data/mockData';

const Index = () => {
  return (
    <Layout>
      <HeaderCard 
        title="Pet Feed" 
        subtitle="See what your furry friends are up to!"
      />

      <div className="w-full flex flex-col items-center">
        {mockPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            comments={mockComments.filter(comment => comment.postId === post.id)}
          />
        ))}
      </div>
    </Layout>
  );
};

export default Index;
