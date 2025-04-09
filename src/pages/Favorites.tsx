
import React from 'react';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Heart, ChevronDown } from 'lucide-react';

const mockFavorites = {
  posts: [
    {
      id: 1,
      content: "Beach day was amazing! I love chasing waves!",
      petProfile: {
        id: 'pet-1',
        name: 'Buddy',
        profilePicture: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
        species: 'Dog',
      },
      image: 'https://images.unsplash.com/photo-1530786356666-c128cfac0f9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      likes: 24,
      comments: 5
    },
    {
      id: 2,
      content: "Perfect spot for my afternoon nap.",
      petProfile: {
        id: 'pet-2',
        name: 'Whiskers',
        profilePicture: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
        species: 'Cat',
      },
      image: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1035&q=80',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      likes: 15,
      comments: 2
    }
  ],
  profiles: [
    {
      id: 'pet-3',
      name: 'Rex',
      profilePicture: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
      species: 'Dog',
      breed: 'Golden Retriever',
      bio: 'I love running and playing fetch!'
    },
    {
      id: 'pet-4',
      name: 'Paws',
      profilePicture: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
      species: 'Cat',
      breed: 'Tabby',
      bio: 'Napping expert and treat connoisseur'
    },
    {
      id: 'pet-5',
      name: 'Fluffy',
      profilePicture: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
      species: 'Rabbit',
      breed: 'Holland Lop',
      bio: 'Carrot enthusiast'
    }
  ]
};

const Favorites = () => {
  return (
    <Layout>
      <HeaderCard 
        title="Favorites" 
        subtitle="Your collection of favorite pets and posts"
      />
      
      <div className="space-y-6">
        <Collapsible 
          defaultOpen={true}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Favorite Posts</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="space-y-3">
              {mockFavorites.posts.length > 0 ? (
                mockFavorites.posts.map(post => (
                  <Card key={post.id} className="overflow-hidden hover:bg-accent/50">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <img 
                            src={post.petProfile.profilePicture} 
                            alt={post.petProfile.name}
                            className="object-cover"
                          />
                        </Avatar>
                        <div className="ml-3 flex-1">
                          <h3 className="font-semibold">{post.petProfile.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm mb-3">{post.content}</p>
                          {post.image && (
                            <div className="rounded-lg overflow-hidden mb-3">
                              <img 
                                src={post.image} 
                                alt="Post content" 
                                className="w-full object-contain max-h-40"
                              />
                            </div>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Heart className="h-3 w-3 fill-petpal-pink text-petpal-pink mr-1" />
                            <span>{post.likes} likes</span>
                            <span className="mx-2">•</span>
                            <span>{post.comments} comments</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Heart className="h-4 w-4 fill-petpal-pink text-petpal-pink" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Heart className="h-10 w-10 mb-2 opacity-50" />
                  <p>No favorite posts yet</p>
                  <p className="text-sm">Heart posts to add them to your favorites</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible 
          defaultOpen={true}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Favorite Profiles</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockFavorites.profiles.map(profile => (
                <Card key={profile.id} className="overflow-hidden hover:bg-accent/50">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12">
                        <img 
                          src={profile.profilePicture} 
                          alt={profile.name}
                          className="object-cover"
                        />
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <h3 className="font-semibold">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.species} • {profile.breed}</p>
                        <p className="text-xs line-clamp-1">{profile.bio}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <Heart className="h-4 w-4 fill-petpal-pink text-petpal-pink" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Layout>
  );
};

export default Favorites;
