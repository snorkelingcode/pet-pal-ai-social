import React, { useState, useEffect } from 'react';
import HeaderCard from '@/components/HeaderCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PetProfile, Post } from '@/types';
import { toast } from '@/components/ui/use-toast';
import AIPostScheduler from '@/components/AIPostScheduler';
import CreatePetProfileModal from '@/components/CreatePetProfileModal';
import PostCard from '@/components/PostCard';

const Profile = () => {
  const { petId: paramPetId } = useParams<{ petId: string }>();
  const [searchParams] = useSearchParams();
  const queryPetId = searchParams.get('petId');
  const { user } = useAuth();
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState({ followers: 0, following: 0 });
  const [activeTab, setActiveTab] = useState<string>("posts");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  const effectivePetId = paramPetId || queryPetId;
  
  useEffect(() => {
    const fetchPetProfile = async () => {
      if (!effectivePetId && !user) return;
      
      setLoading(true);
      
      try {
        let petQuery = supabase
          .from('pet_profiles')
          .select('*, ai_personas(*)')
          
        if (effectivePetId) {
          petQuery = petQuery.eq('id', effectivePetId);
        } else if (user) {
          petQuery = petQuery.eq('owner_id', user.id).limit(1);
        }
        
        const { data: petData, error: petError } = await petQuery.single();
        
        if (petError) {
          if (petError.code === 'PGRST116') {
            toast({
              title: "No Pet Profile Found",
              description: "Create your first pet profile to get started!",
              variant: "default"
            });
            setLoading(false);
            return;
          }
          throw petError;
        }
        
        if (!petData) {
          setLoading(false);
          return;
        }
        
        const profile: PetProfile = {
          id: petData.id,
          ownerId: petData.owner_id,
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          age: petData.age,
          personality: petData.personality || [],
          bio: petData.bio || '',
          profilePicture: petData.profile_picture || '',
          createdAt: petData.created_at,
          followers: petData.followers || 0,
          following: petData.following || 0,
          handle: petData.handle
        };
        
        setFollowCount({
          followers: petData.followers || 0,
          following: petData.following || 0
        });
        
        setPetProfile(profile);
        
        if (user && user.id === petData.owner_id) {
          setIsOwner(true);
        }
        
        if (user) {
          const { data: followingData, error: followingError } = await supabase
            .from('pet_follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', petData.id);
            
          if (!followingError && followingData && followingData.length > 0) {
            setIsFollowing(true);
          }
        }

        fetchPetPosts(petData.id);
        
      } catch (error) {
        console.error("Error fetching pet profile:", error);
        toast({
          title: "Error",
          description: "Failed to load pet profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPetProfile();
  }, [effectivePetId, user]);

  const fetchPetPosts = async (petId: string) => {
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, pet_profiles(*)')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const transformedPosts: Post[] = data.map(post => ({
        id: post.id,
        petId: post.pet_id,
        content: post.content,
        image: post.image,
        likes: post.likes,
        comments: post.comments,
        createdAt: post.created_at,
        petProfile: {
          id: post.pet_profiles.id,
          name: post.pet_profiles.name,
          species: post.pet_profiles.species,
          breed: post.pet_profiles.breed,
          profilePicture: post.pet_profiles.profile_picture,
          bio: post.pet_profiles.bio,
          personality: post.pet_profiles.personality,
          age: post.pet_profiles.age,
          ownerId: post.pet_profiles.owner_id,
          createdAt: post.pet_profiles.created_at,
          followers: post.pet_profiles.followers,
          following: post.pet_profiles.following,
          handle: post.pet_profiles.handle
        }
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error fetching pet posts:", error);
      toast({
        title: "Error",
        description: "Failed to load pet posts",
        variant: "destructive"
      });
    } finally {
      setLoadingPosts(false);
    }
  };
  
  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow pets",
        variant: "destructive"
      });
      return;
    }
    
    if (!petProfile) return;
    
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('pet_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', petProfile.id);
          
        if (error) throw error;
        
        setIsFollowing(false);
        setFollowCount(prev => ({ ...prev, followers: prev.followers - 1 }));
        
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${petProfile.name}`
        });
      } else {
        const { error } = await supabase
          .from('pet_follows')
          .insert([{ follower_id: user.id, following_id: petProfile.id }]);
          
        if (error) throw error;
        
        setIsFollowing(true);
        setFollowCount(prev => ({ ...prev, followers: prev.followers + 1 }));
        
        toast({
          title: "Following",
          description: `You are now following ${petProfile.name}`
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };
  
  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  if (loading) {
    return (
      <>
        <HeaderCard 
          title="Pet Profile" 
          subtitle="Loading pet profile..."
        />
        <div className="w-full flex justify-center p-8">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="bg-muted rounded-md h-40 w-full"></div>
            <div className="bg-muted rounded-md h-8 w-3/4"></div>
            <div className="bg-muted rounded-md h-4 w-1/2"></div>
            <div className="bg-muted rounded-md h-24 w-full"></div>
          </div>
        </div>
      </>
    );
  }

  if (!petProfile && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">No Pet Profile Found</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {user ? "Create your first pet profile to get started!" : "Please log in to view your pet profiles"}
        </p>
        <Button 
          onClick={() => {
            if (user) {
              const createProfileEvent = new CustomEvent('open-create-profile');
              window.dispatchEvent(createProfileEvent);
            } else {
              navigate('/login');
            }
          }}
        >
          {user ? "Create Pet Profile" : "Log In"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <HeaderCard 
        title={petProfile.name} 
        subtitle={`${petProfile.species} • ${petProfile.breed} • ${petProfile.age} years old`}
      />
      
      <div className="w-full mb-6">
        <Card className="overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-petpal-blue to-petpal-pink">
            <div className="absolute -bottom-16 left-6 h-32 w-32 rounded-full border-4 border-background overflow-hidden">
              <img 
                src={petProfile.profilePicture || '/placeholder.svg'} 
                alt={petProfile.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          
          <CardContent className="pt-20 pb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{petProfile.name}</h2>
                <p className="text-muted-foreground">{petProfile.species} • {petProfile.breed} • {petProfile.age} years old</p>
              </div>
              
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                {isOwner ? (
                  <div className="flex gap-2">
                    <AIPostScheduler petProfile={petProfile} />
                    <Button variant="outline" onClick={handleEditProfile}>Edit Profile</Button>
                  </div>
                ) : (
                  <Button 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center">
                <span className="font-semibold mr-1">{followCount.followers}</span>
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-1">{followCount.following}</span>
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p>{petProfile.bio}</p>
              
              {petProfile.personality && petProfile.personality.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium mb-1">Personality</h4>
                  <div className="flex flex-wrap gap-2">
                    {petProfile.personality.map((trait, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-muted rounded-full text-xs"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Tabs defaultValue="posts" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="posts" className="font-medium">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="media" className="font-medium">
                  Media
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-6">
                {loadingPosts ? (
                  <div className="animate-pulse space-y-4">
                    <div className="bg-muted rounded-md h-32 w-full"></div>
                    <div className="bg-muted rounded-md h-32 w-full"></div>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map(post => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        comments={[]} 
                        isReadOnly={!user}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">No posts yet.</p>
                    {isOwner && (
                      <Button size="sm" variant="outline">Create First Post</Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="media" className="mt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No media yet.</p>
                  {isOwner && (
                    <Button size="sm" variant="outline">Upload Photos</Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {isOwner && (
        <CreatePetProfileModal
          open={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          isEditMode={true}
          petProfile={petProfile}
        />
      )}
    </>
  );
};

export default Profile;
