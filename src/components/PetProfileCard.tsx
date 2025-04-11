
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PetProfile } from "@/types";
import { Pencil, Check } from "lucide-react";
import CreatePetProfileModal from "./CreatePetProfileModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface PetProfileCardProps {
  petProfile: PetProfile;
  compact?: boolean;
}

const PetProfileCard = ({ petProfile, compact = false }: PetProfileCardProps) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [userPetProfiles, setUserPetProfiles] = useState<PetProfile[]>([]);

  // Fetch user's pet profiles to enable following with them
  useEffect(() => {
    if (!user) return;
    
    const fetchUserPets = async () => {
      try {
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) throw error;
        
        if (data) {
          const formattedProfiles: PetProfile[] = data.map(pet => ({
            id: pet.id,
            ownerId: pet.owner_id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age,
            personality: pet.personality,
            bio: pet.bio || '',
            profilePicture: pet.profile_picture || '',
            createdAt: pet.created_at,
            followers: pet.followers,
            following: pet.following,
          }));
          setUserPetProfiles(formattedProfiles);
        }
      } catch (error) {
        console.error("Error fetching user's pet profiles:", error);
      }
    };
    
    fetchUserPets();
  }, [user]);

  // Check if current user's pet is following this pet
  useEffect(() => {
    if (!user || userPetProfiles.length === 0) return;
    
    const checkFollowStatus = async () => {
      try {
        // Get the first pet profile for the current user (for simplicity)
        // In a more advanced implementation, you'd let the user select which pet is following
        const followerPet = userPetProfiles[0];
        
        if (!followerPet) return;
        
        const { data, error } = await supabase
          .from('pet_follows')
          .select('*')
          .eq('follower_id', followerPet.id)
          .eq('following_id', petProfile.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error;
        }
        
        setIsFollowing(!!data);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };
    
    checkFollowStatus();
  }, [user, petProfile.id, userPetProfiles]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow pets",
        variant: "destructive",
      });
      return;
    }
    
    if (userPetProfiles.length === 0) {
      toast({
        title: "No pet profiles",
        description: "You need to create a pet profile first before following other pets",
        variant: "destructive",
      });
      return;
    }
    
    // For simplicity, we'll use the first pet profile to follow/unfollow
    const followerPet = userPetProfiles[0];
    
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('pet_follows')
          .delete()
          .eq('follower_id', followerPet.id)
          .eq('following_id', petProfile.id);
        
        if (error) throw error;
        
        toast({
          title: "Unfollowed",
          description: `${followerPet.name} is no longer following ${petProfile.name}`,
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('pet_follows')
          .insert([
            {
              follower_id: followerPet.id,
              following_id: petProfile.id,
            }
          ]);
        
        if (error) throw error;
        
        toast({
          title: "Following",
          description: `${followerPet.name} is now following ${petProfile.name}`,
        });
      }
      
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the current user is the owner of this pet profile
  const isOwner = user && petProfile.ownerId === user.id;

  if (compact) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center">
            <Avatar className="h-12 w-12">
              <img 
                src={petProfile.profilePicture} 
                alt={petProfile.name}
                className="object-cover"
              />
            </Avatar>
            <div className="ml-3">
              <h3 className="font-semibold">{petProfile.name}</h3>
              <p className="text-xs text-muted-foreground">
                {petProfile.breed} {petProfile.species} • {petProfile.age} years old
              </p>
            </div>
            <Button 
              className={`ml-auto ${isFollowing ? 'bg-green-600 hover:bg-green-700' : 'bg-petpal-blue hover:bg-petpal-blue/90'}`} 
              size="sm"
              onClick={handleFollowToggle}
              disabled={isLoading || isOwner}
            >
              {isFollowing ? (
                <>
                  <Check className="mr-1 h-3 w-3" /> Following
                </>
              ) : 'Follow'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3 relative">
          <div 
            className="w-full h-24 rounded-t-lg bg-gradient-to-r from-petpal-blue to-petpal-mint"
          ></div>
          <Avatar className="h-20 w-20 absolute top-14 left-6 border-4 border-background">
            <img 
              src={petProfile.profilePicture} 
              alt={petProfile.name}
              className="object-cover"
            />
          </Avatar>
          {isOwner && (
            <Button 
              className="absolute top-20 right-4 bg-petpal-blue hover:bg-petpal-blue/90" 
              size="sm"
              onClick={() => setIsEditProfileOpen(true)}
            >
              <Pencil className="mr-1 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-10">
          <h2 className="text-2xl font-bold mb-1">{petProfile.name}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {petProfile.breed} {petProfile.species} • {petProfile.age} years old
          </p>
          
          <div className="flex gap-4 mb-3 text-sm">
            <div>
              <span className="font-bold mr-1">{petProfile.following}</span>
              <span className="text-muted-foreground">Following</span>
            </div>
            <div>
              <span className="font-bold mr-1">{petProfile.followers}</span>
              <span className="text-muted-foreground">Followers</span>
            </div>
          </div>
          
          <p className="mb-4">{petProfile.bio}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {petProfile.personality.map((trait, index) => (
              <Badge key={index} variant="secondary" className="bg-petpal-mint text-foreground hover:bg-petpal-mint/80">
                {trait}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button 
            className={`w-full ${isFollowing ? 'bg-green-600 hover:bg-green-700' : 'bg-petpal-blue hover:bg-petpal-blue/90'}`}
            onClick={handleFollowToggle}
            disabled={isLoading || isOwner}
          >
            {isFollowing ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Following {petProfile.name}
              </>
            ) : `Follow ${petProfile.name}`}
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Pet Profile Modal */}
      <CreatePetProfileModal
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        isEditMode={true}
        petProfile={petProfile}
      />
    </>
  );
};

export default PetProfileCard;
