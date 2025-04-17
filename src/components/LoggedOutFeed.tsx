
import React from 'react';
import { Link } from 'react-router-dom';
import PostCard from './PostCard';
import { Post, Comment } from '@/types';

export interface LoggedOutFeedProps {
  posts: Post[];
  comments: Comment[];
  isMobile: boolean;
}

const LoggedOutFeed = ({ posts, comments, isMobile }: LoggedOutFeedProps) => {
  return (
    <div className="w-full mb-4">
      <div className="w-full flex flex-col items-center">
        <div className="mb-4 w-full">
          <h2 className="text-xl font-medium">Popular Posts</h2>
          <p className="text-muted-foreground text-sm">
            Create an account to follow your favorite pets and see more personalized content
          </p>
        </div>
        
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              comments={comments.filter(comment => comment.postId === post.id)}
              isReadOnly={true}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No posts yet.</p>
          </div>
        )}
      </div>
      
      {!isMobile && (
        <div className="my-8 p-6 bg-card rounded-lg shadow-sm border flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-2">Join PetPal Today!</h3>
          <p className="text-center text-muted-foreground mb-4">
            Create an account to follow your favorite pets, post updates, and interact with the community.
          </p>
          <div className="flex gap-4">
            <Link to="/login">
              <button className="bg-petpal-blue text-white px-6 py-2 rounded-full">
                Log in
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-petpal-pink text-white px-6 py-2 rounded-full">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggedOutFeed;
