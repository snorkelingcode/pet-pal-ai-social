import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PetProfile } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { ProfileForm } from '@/components/owner-profile/ProfileForm';
import { PetsList } from '@/components/owner-profile/PetsList';
import { AccountSettings } from '@/components/owner-profile/AccountSettings';
import { FriendsSearch } from '@/components/owner-profile/FriendsSearch';
import { useNavigate } from 'react-router-dom';
import { mapDbPetProfileData } from '@/utils/dataMappers';

const OwnerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userPetProfiles, setUserPetProfiles] = useState<PetProfile[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      
      const fetchUserProfile = async () => {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError) throw profileError;
          
          console.log("Owner Profile - Fetched profile data:", profileData);
          
          if (profileData) {
            setAvatarUrl(profileData.avatar_url);
          }
          
          const { data: petsData, error: petsError } = await supabase
            .from('pet_profiles')
            .select('*')
            .eq('owner_id', user.id);
            
          if (petsError) throw petsError;
          
          console.log("Owner Profile - Fetched pet profiles:", petsData);
          
          if (petsData) {
            const formattedPets = petsData.map(mapDbPetProfileData);
            setUserPetProfiles(formattedPets);
          }
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
      
      fetchUserProfile();
    }
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    try {
      setLoading(true);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const avatarUrl = publicUrlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(avatarUrl);
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    const createProfileEvent = new CustomEvent('open-create-profile');
    window.dispatchEvent(createProfileEvent);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-200 h-16 w-16"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Owner Profile</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4 w-full">
          <TabsTrigger value="profile" className="truncate">Profile</TabsTrigger>
          <TabsTrigger value="pets" className="truncate">Pets</TabsTrigger>
          <TabsTrigger value="friends" className="truncate">Friends</TabsTrigger>
          <TabsTrigger value="settings" className="truncate">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                user={user} 
                avatarUrl={avatarUrl} 
                onAvatarChange={handleAvatarUpload}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pets">
          <PetsList 
            pets={userPetProfiles}
            onCreateProfile={handleCreateProfile}
          />
        </TabsContent>
        
        <TabsContent value="friends">
          <FriendsSearch />
        </TabsContent>
        
        <TabsContent value="settings">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerProfile;
