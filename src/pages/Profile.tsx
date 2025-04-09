
import React from 'react';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import PetProfileCard from '@/components/PetProfileCard';
import { mockPosts, mockComments, mockPetProfiles } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

const Profile = () => {
  const petProfile = mockPetProfiles[0]; // Using first pet as example
  const petPosts = mockPosts.filter(post => post.petId === petProfile.id);
  
  // Add follower counts for the example if they don't exist
  if (petProfile.followers === undefined) petProfile.followers = 245;
  if (petProfile.following === undefined) petProfile.following = 132;

  return (
    <Layout>
      <div className="mb-6">
        <PetProfileCard petProfile={petProfile} />
      </div>
      
      {/* Social stats and Edit Profile button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="text-center">
            <p className="font-bold text-xl">{petProfile.followers}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl">{petProfile.following}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-petpal-blue hover:bg-petpal-blue/90" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <Card>
              <CardContent className="pt-6">
                <p>Profile editing functionality will be added here.</p>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
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
