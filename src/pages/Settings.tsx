
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { PetProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Shield, Bell, UserCircle, PawPrint } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const petId = searchParams.get('petId');

  useEffect(() => {
    const fetchPetProfile = async () => {
      if (!petId) {
        toast({
          title: "No Pet Selected",
          description: "Please select a pet to customize their settings",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const { data: pet, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('id', petId)
          .single();

        if (error) throw error;

        if (pet) {
          const handle = pet.handle || pet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          setPetProfile({
            id: pet.id,
            ownerId: pet.owner_id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age,
            personality: pet.personality || [],
            bio: pet.bio || '',
            profilePicture: pet.profile_picture || '',
            createdAt: pet.created_at,
            followers: pet.followers || 0,
            following: pet.following || 0,
            handle: handle,
            profile_url: `/pet/${handle}`
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

  if (!petProfile) {
    return (
      <>
        <HeaderCard title="Pet Settings" subtitle="No pet selected" />
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <PawPrint className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No Pet Selected</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Please select a pet to customize their settings
          </p>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
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
