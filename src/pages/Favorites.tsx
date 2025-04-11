
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

// Interface types for favorites
interface FavoritePost {
  id: string;
  content: string;
  petProfile: {
    id: string;
    name: string;
    profilePicture: string;
    species: string;
  };
  image: string | null;
  createdAt: string;
  likes: number;
  comments: number;
}

interface FavoriteProfile {
  id: string;
  name: string;
  profilePicture: string;
  species: string;
  breed: string;
  bio: string;
}

const Favorites = () => {
  const { user } = useAuth();
  const [favoritePosts, setFavoritePosts] = useState<FavoritePost[]>([]);
  const [favoriteProfiles, setFavoriteProfiles] = useState<FavoriteProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // In a real application, we would fetch user's favorites from a favorites table
        // For now, we'll fetch a few random posts and profiles to simulate favorites
        
        // Fetch a few random posts as "favorites"
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            id, 
            content, 
            image, 
            likes, 
            comments, 
            created_at,
            pet_profiles:pet_id (
              id, 
              name,
              species,
              profile_picture
            )
          `)
          .order('created_at', { ascending: false })
          .limit(3);

        if (postError) throw postError;

        // Fetch a few pet profiles as "favorites"
        const { data: profileData, error: profileError } = await supabase
          .from('pet_profiles')
          .select('id, name, species, breed, bio, profile_picture')
          .order('created_at', { ascending: false })
          .limit(3);

        if (profileError) throw profileError;

        const formattedPosts: FavoritePost[] = postData ? postData.map(post => ({
          id: post.id,
          content: post.content,
          petProfile: {
            id: post.pet_profiles.id,
            name: post.pet_profiles.name,
            profilePicture: post.pet_profiles.profile_picture,
            species: post.pet_profiles.species,
          },
          image: post.image,
          createdAt: post.created_at,
          likes: post.likes,
          comments: post.comments,
        })) : [];

        const formattedProfiles: FavoriteProfile[] = profileData ? profileData.map(profile => ({
          id: profile.id,
          name: profile.name,
          profilePicture: profile.profile_picture,
          species: profile.species,
          breed: profile.breed,
          bio: profile.bio,
        })) : [];

        setFavoritePosts(formattedPosts);
        setFavoriteProfiles(formattedProfiles);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your favorites',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <HeaderCard 
          title="Favorites" 
          subtitle="Loading your collection of favorite pets and posts..."
        />
        <div className="space-y-4">
          <div className="animate-pulse bg-muted rounded-md h-32 w-full"></div>
          <div className="animate-pulse bg-muted rounded-md h-32 w-full"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <HeaderCard 
          title="Favorites" 
          subtitle="Sign in to view and manage your favorites"
        />
        <div className="flex flex-col items-center justify-center py-12">
          <Heart className="h-16 w-16 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Sign in to see your favorites</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Create an account or sign in to save your favorite pets and posts
          </p>
          <div className="flex gap-4">
            <Link to="/login">
              <Button className="bg-petpal-blue hover:bg-petpal-blue/90">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-petpal-pink hover:bg-petpal-pink/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const hasNoData = favoritePosts.length === 0 && favoriteProfiles.length === 0;

  if (hasNoData) {
    return (
      <Layout>
        <HeaderCard 
          title="Favorites" 
          subtitle="Your collection of favorite pets and posts"
        />
        <div className="flex flex-col items-center justify-center py-12">
          <Heart className="h-16 w-16 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Heart posts and profiles while browsing to add them to your favorites
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <HeaderCard 
        title="Favorites" 
        subtitle="Your collection of favorite pets and posts"
      />
      
      <div className="space-y-6">
        {favoritePosts.length > 0 && (
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
                {favoritePosts.map(post => (
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
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {favoriteProfiles.length > 0 && (
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
                {favoriteProfiles.map(profile => (
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
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
