
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, UserPlus, Mail, MapPin, Calendar, X, Camera, PawPrint } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PetProfile } from '@/types';

const profileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  bio: z.string().max(500, {
    message: "Bio cannot be more than 500 characters.",
  }).optional(),
  location: z.string().max(100, {
    message: "Location cannot be more than 100 characters.",
  }).optional(),
  handle: z.string().min(2, {
    message: "Handle must be at least 2 characters.",
  })
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface OwnerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OwnerProfileModal = ({ open, onOpenChange }: OwnerProfileModalProps) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userPets, setUserPets] = useState<PetProfile[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      location: "",
      handle: ""
    },
  });

  const fetchFriends = async () => {
    if (!user) return;
    
    try {
      const { data: friendsData, error: friendsError } = await supabase
        .from('user_friends')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${user.id})`)
        .eq('status', 'accepted');
      
      if (friendsError) throw friendsError;
      
      if (friendsData && friendsData.length > 0) {
        const friendIds = friendsData.map(connection => 
          connection.user_id === user.id ? connection.friend_id : connection.user_id
        );
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, handle')
          .in('id', friendIds);
          
        if (profilesError) throw profilesError;
        
        setFriends(profilesData || []);
      } else {
        setFriends([]);
      }
      
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('user_friends')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending');
      
      if (receivedError) throw receivedError;
      
      setFriendRequests(receivedRequests || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: 'Error',
        description: 'Failed to load friends data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!open || !user) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          form.reset({
            name: profileData.username || '',
            bio: profileData.bio || '',
            location: '',  // Add location field to profiles table if needed
            handle: profileData.handle || ''
          });
          setAvatarUrl(profileData.avatar_url);
        }

        // Fetch user's pets
        const { data: petsData, error: petsError } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('owner_id', user.id);

        if (petsError) throw petsError;

        if (petsData && petsData.length > 0) {
          const formattedPets: PetProfile[] = petsData.map(pet => ({
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
            handle: pet.handle || pet.name.toLowerCase().replace(/\s+/g, '')
          }));
          
          setUserPets(formattedPets);
        }

        await fetchFriends();
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [open, user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: values.name,
          bio: values.bio || '',
          handle: values.handle
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    setLoading(true);
    try {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(data.publicUrl);
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Profile</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="info">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="pets">My Pets</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div className="flex justify-center py-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer"
                >
                  <input 
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Camera className="h-4 w-4" />
                </label>
              </div>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    {...form.register('name')} 
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="handle">Handle</Label>
                  <Input 
                    id="handle" 
                    placeholder="your_handle" 
                    {...form.register('handle')} 
                  />
                  {form.formState.errors.handle && (
                    <p className="text-sm text-destructive">{form.formState.errors.handle.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell others about yourself..." 
                    className="min-h-[100px]"
                    {...form.register('bio')} 
                  />
                  {form.formState.errors.bio && (
                    <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Your location" 
                    {...form.register('location')} 
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="pets" className="pt-4">
            {userPets.length > 0 ? (
              <div className="space-y-4">
                {userPets.map(pet => (
                  <Card key={pet.id}>
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Avatar>
                        {pet.profilePicture ? (
                          <img src={pet.profilePicture} alt={pet.name} />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <PawPrint className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground">{pet.species}, {pet.breed}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PawPrint className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 font-medium">No pets yet</h3>
                <p className="text-sm text-muted-foreground">Create a pet profile to get started</p>
                <Button className="mt-4" onClick={() => {
                  const createProfileEvent = new CustomEvent('open-create-profile');
                  window.dispatchEvent(createProfileEvent);
                  onOpenChange(false);
                }}>
                  Create Pet Profile
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="friends" className="pt-4">
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-2 font-medium">Find Friends</h3>
              <p className="text-sm text-muted-foreground">Connect with other pet owners</p>
              <Button className="mt-4">
                Find Friends
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerProfileModal;
