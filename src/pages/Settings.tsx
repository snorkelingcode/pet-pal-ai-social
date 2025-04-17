
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { PetProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Shield, Bell, UserCircle, PawPrint } from 'lucide-react';
import { mapDbPetProfileData } from '@/utils/dataMappers';
import { petProfileService } from '@/services/petProfileService';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [userPets, setUserPets] = useState<PetProfile[]>([]);
  const petId = searchParams.get('petId');

  // First fetch all user's pets
  useEffect(() => {
    const fetchUserPets = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const petProfiles = await petProfileService.getUserPetProfiles(user.id);
        setUserPets(petProfiles);
        
        // If we have pets but no petId is selected, pre-select the first one
        if (petProfiles.length > 0 && !petId) {
          navigate(`/settings?petId=${petProfiles[0].id}`, { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user pets:', error);
        toast({
          title: "Error",
          description: "Failed to load your pet profiles",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserPets();
  }, [user, navigate, petId]);

  // Then fetch the specific pet profile once we have a petId
  useEffect(() => {
    const fetchPetProfile = async () => {
      if (!petId) return;

      try {
        setLoading(true);
        const pet = await petProfileService.getPetProfile(petId);
        
        if (pet) {
          setPetProfile(pet);
        } else {
          // If pet not found with this ID, show error
          toast({
            title: "Pet Not Found",
            description: "The pet profile you're looking for doesn't exist",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching pet profile:', error);
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
  }, [petId]);

  if (!user) {
    return (
      <>
        <HeaderCard 
          title="Pet Settings" 
          subtitle="Sign in to access pet settings"
        />
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in required</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Please sign in to access and manage your pet's settings
          </p>
          <Button onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <HeaderCard title="Pet Settings" subtitle="Loading..." />
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </>
    );
  }

  // If user has pets but none is selected or found
  if (!petProfile) {
    return (
      <>
        <HeaderCard title="Pet Settings" subtitle="No pet selected" />
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <PawPrint className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Select a Pet</h2>
          {userPets.length > 0 ? (
            <>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Please select one of your pets to customize their settings
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
                {userPets.map(pet => (
                  <Card 
                    key={pet.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => navigate(`/settings?petId=${pet.id}`)}
                  >
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden">
                        {pet.profilePicture && (
                          <img 
                            src={pet.profilePicture} 
                            alt={pet.name} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{pet.name}</h3>
                        <p className="text-xs text-muted-foreground">{pet.species}, {pet.breed}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                You don't have any pet profiles yet. Create one to get started!
              </p>
              <Button onClick={() => {
                const createProfileEvent = new CustomEvent('open-create-profile');
                window.dispatchEvent(createProfileEvent);
              }}>
                Create Pet Profile
              </Button>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderCard 
        title={`${petProfile.name}'s Settings`} 
        subtitle={`Customize ${petProfile.name}'s preferences and profile settings`}
      />
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your pet's profile information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="petname" className="text-right">
                  Pet Name
                </Label>
                <Input id="petname" value={petProfile.name} className="col-span-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="species" className="text-right">
                  Species
                </Label>
                <Input id="species" value={petProfile.species} className="col-span-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="breed" className="text-right">
                  Breed
                </Label>
                <Input id="breed" value={petProfile.breed} className="col-span-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="age" className="text-right">
                  Age
                </Label>
                <Input id="age" type="number" value={petProfile.age} className="col-span-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="handle" className="text-right">
                  Handle
                </Label>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-muted-foreground">@</span>
                  <Input id="handle" value={petProfile.handle} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your pet's privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">Profile Visibility</h2>
                  <p className="text-sm text-muted-foreground">Control who can see your pet's profile</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">Allow Direct Messages</h2>
                  <p className="text-sm text-muted-foreground">Let other pets send messages to {petProfile.name}</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Critical settings for your pet's profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Delete Pet Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage notification settings for {petProfile.name}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">New Followers</h2>
                  <p className="text-sm text-muted-foreground">Get notified when someone follows {petProfile.name}</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">Post Interactions</h2>
                  <p className="text-sm text-muted-foreground">Get notified about likes and comments on {petProfile.name}'s posts</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">Direct Messages</h2>
                  <p className="text-sm text-muted-foreground">Get notified about new messages</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Settings;
