
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PetProfile } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { petProfileService } from '@/services/petProfileService';

const Settings = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedPetId = searchParams.get('petId');
  
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<{ username: string, email: string, location?: string, bio?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [petName, setPetName] = useState('');
  const [petBio, setPetBio] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petSpecies, setPetSpecies] = useState('');
  const [petBreed, setPetBreed] = useState('');
  
  // Owner form state
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerLocation, setOwnerLocation] = useState('');
  const [ownerBio, setOwnerBio] = useState('');
  
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Load owner profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, email, bio')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error loading owner profile:', profileError);
          toast({
            title: 'Error',
            description: 'Failed to load owner profile data',
            variant: 'destructive',
          });
        } else if (profileData) {
          setOwnerProfile(profileData);
          setOwnerName(profileData.username || '');
          setOwnerEmail(profileData.email || '');
          setOwnerBio(profileData.bio || '');
        }
        
        // Load pet profile if petId is present
        if (selectedPetId) {
          const pet = await petProfileService.getPetProfile(selectedPetId);
          if (pet) {
            setPetProfile(pet);
            setPetName(pet.name);
            setPetBio(pet.bio);
            setPetAge(pet.age.toString());
            setPetSpecies(pet.species);
            setPetBreed(pet.breed);
          } else {
            toast({
              title: 'Pet not found',
              description: 'The selected pet profile could not be found',
              variant: 'destructive',
            });
            navigate('/settings');
          }
        } else if (user) {
          // If no pet is selected but user is logged in, get their first pet
          const pets = await petProfileService.getUserPetProfiles(user.id);
          if (pets && pets.length > 0) {
            navigate(`/settings?petId=${pets[0].id}`);
          }
        }
      } catch (error) {
        console.error('Error in settings page:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user, selectedPetId, navigate]);
  
  const handleSavePetChanges = async () => {
    if (!petProfile || !selectedPetId) return;
    
    try {
      setLoading(true);
      
      const updatedPet = await petProfileService.updatePetProfile(selectedPetId, {
        name: petName,
        bio: petBio,
        age: parseInt(petAge) || petProfile.age,
        species: petSpecies,
        breed: petBreed
      });
      
      setPetProfile(updatedPet);
      
      toast({
        title: 'Changes saved',
        description: 'Your pet profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating pet profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pet profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveOwnerChanges = async () => {
    if (!user || !ownerProfile) return;
    
    try {
      setLoading(true);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          username: ownerName,
          bio: ownerBio
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update email in auth if changed
      if (ownerEmail !== ownerProfile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: ownerEmail,
        });
        
        if (emailError) throw emailError;
      }
      
      setOwnerProfile({
        ...ownerProfile,
        username: ownerName,
        email: ownerEmail,
        bio: ownerBio
      });
      
      toast({
        title: 'Changes saved',
        description: 'Your owner profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating owner profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update owner profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSavePreferences = () => {
    toast({
      title: 'Preferences saved',
      description: 'Your notification preferences have been updated',
    });
  };
  
  const handleSavePrivacySettings = () => {
    toast({
      title: 'Privacy settings saved',
      description: 'Your privacy settings have been updated',
    });
  };
  
  if (loading && !petProfile && !ownerProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-48 bg-gray-200 rounded"></div>
            <div className="h-96 w-full max-w-3xl bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <HeaderCard 
        title={petProfile ? `${petProfile.name}'s Settings` : "Settings"} 
        subtitle="Customize your PetPal experience"
      />
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          {petProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Pet Profile</CardTitle>
                <CardDescription>
                  Update {petProfile.name}'s information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <img 
                      src={petProfile.profilePicture || "/placeholder.svg"} 
                      alt={petProfile.name}
                      className="object-cover"
                    />
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="mb-2">
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, GIF or PNG. 1MB max size.
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="petName">Name</Label>
                    <Input 
                      id="petName" 
                      value={petName} 
                      onChange={(e) => setPetName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="petSpecies">Species</Label>
                      <Input 
                        id="petSpecies" 
                        value={petSpecies} 
                        onChange={(e) => setPetSpecies(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="petBreed">Breed</Label>
                      <Input 
                        id="petBreed" 
                        value={petBreed} 
                        onChange={(e) => setPetBreed(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="petAge">Age</Label>
                      <Input 
                        id="petAge" 
                        value={petAge} 
                        onChange={(e) => setPetAge(e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="petBio">Bio</Label>
                    <Input 
                      id="petBio" 
                      value={petBio} 
                      onChange={(e) => setPetBio(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="bg-petpal-blue hover:bg-petpal-blue/90 mt-2" 
                    onClick={handleSavePetChanges}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Pet Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Owner Profile</CardTitle>
              <CardDescription>
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {ownerProfile?.username ? (
                    <div className="bg-petpal-blue text-white h-full w-full flex items-center justify-center text-xl font-bold">
                      {ownerProfile.username.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <img 
                      src="/placeholder.svg" 
                      alt="Profile"
                      className="object-cover"
                    />
                  )}
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="mb-2">
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, GIF or PNG. 1MB max size.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ownerName">Owner's Name</Label>
                  <Input 
                    id="ownerName" 
                    value={ownerName} 
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={ownerEmail} 
                    onChange={(e) => setOwnerEmail(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={ownerLocation} 
                    onChange={(e) => setOwnerLocation(e.target.value)} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    value={ownerBio} 
                    onChange={(e) => setOwnerBio(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="bg-petpal-blue hover:bg-petpal-blue/90 mt-2" 
                  onClick={handleSaveOwnerChanges}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Owner Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              
              <Button className="bg-petpal-blue hover:bg-petpal-blue/90">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications on your device
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via text message
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Notification Types</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="likes" defaultChecked />
                    <Label htmlFor="likes">Likes on your posts</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="comments" defaultChecked />
                    <Label htmlFor="comments">Comments on your posts</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="follows" defaultChecked />
                    <Label htmlFor="follows">New followers</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="messages" defaultChecked />
                    <Label htmlFor="messages">Direct messages</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="events" />
                    <Label htmlFor="events">Nearby pet events</Label>
                  </div>
                </div>
                
                <Button 
                  className="bg-petpal-blue hover:bg-petpal-blue/90 mt-4"
                  onClick={handleSavePreferences}
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your account privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Private Account</p>
                  <p className="text-sm text-muted-foreground">
                    Only approved followers can see your posts
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Activity Status</p>
                  <p className="text-sm text-muted-foreground">
                    Let others see when you're active
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Share Location Data</p>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing your general location with posts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Who Can...</h3>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="seeProfile">See your profile</Label>
                    <select id="seeProfile" className="p-2 border rounded-md">
                      <option>Everyone</option>
                      <option>Followers only</option>
                      <option>No one</option>
                    </select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="sendMessages">Send you messages</Label>
                    <select id="sendMessages" className="p-2 border rounded-md">
                      <option>Everyone</option>
                      <option selected>Followers only</option>
                      <option>No one</option>
                    </select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="seeFollowers">See your followers list</Label>
                    <select id="seeFollowers" className="p-2 border rounded-md">
                      <option>Everyone</option>
                      <option selected>Followers only</option>
                      <option>No one</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  className="bg-petpal-blue hover:bg-petpal-blue/90 mt-4"
                  onClick={handleSavePrivacySettings}
                >
                  Save Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
