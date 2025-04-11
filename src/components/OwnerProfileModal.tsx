import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Link, useNavigate } from 'react-router-dom';
import { User, Pencil, PawPrint, AlertCircle, Lock, Trash2, LogOut, UserPlus, UserCheck, UserX, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { PetProfile } from '@/types';
import { toast } from '@/components/ui/use-toast';

const ownerProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(300, { message: "Bio must be less than 300 characters." }).optional(),
});

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface OwnerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OwnerProfileModal = ({ open, onOpenChange }: OwnerProfileModalProps) => {
  const navigate = useNavigate();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userPetProfiles, setUserPetProfiles] = useState<PetProfile[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const profileForm = useForm<z.infer<typeof ownerProfileSchema>>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordUpdateSchema>>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      
      const fetchUserProfile = async () => {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          console.log("Fetched user profile:", profileData);
          
          if (profileData) {
            profileForm.reset({
              name: profileData.username || '',
              email: user.email || '',
              bio: profileData.bio || '',
            });
            
            setAvatarUrl(profileData.avatar_url);
          }
          
          const { data: petsData, error: petsError } = await supabase
            .from('pet_profiles')
            .select('*')
            .eq('owner_id', user.id);
            
          if (petsError) throw petsError;
          
          console.log("Fetched user pet profiles:", petsData);
          
          if (petsData) {
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
            }));
            
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
      
      fetchFriends();
    }
  }, [open, user, profileForm]);

  const fetchFriends = async () => {
    if (!user) return;
    
    try {
      const { data: friendsData, error: friendsError } = await supabase
        .from('user_friends')
        .select('*, friend:friend_id(id, username, avatar_url), requester:user_id(id, username, avatar_url)')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');
      
      if (friendsError) throw friendsError;
      
      const processedFriends = friendsData.map(connection => {
        return connection.user_id === user.id ? connection.friend : connection.requester;
      });
      
      setFriends(processedFriends);
      
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('user_friends')
        .select('*, requester:user_id(id, username, avatar_url)')
        .eq('friend_id', user.id)
        .eq('status', 'pending');
      
      if (receivedError) throw receivedError;
      setFriendRequests(receivedRequests);
      
      const { data: sentRequestsData, error: sentError } = await supabase
        .from('user_friends')
        .select('*, friend:friend_id(id, username, avatar_url)')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      
      if (sentError) throw sentError;
      setSentRequests(sentRequestsData);
      
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: 'Error',
        description: 'Failed to load friends data. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const onProfileSubmit = async (data: z.infer<typeof ownerProfileSchema>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (data.email !== user.email) {
        const { error: updateEmailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (updateEmailError) throw updateEmailError;
      }
      
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          username: data.name,
          bio: data.bio,
        })
        .eq('id', user.id);
        
      if (updateProfileError) throw updateProfileError;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordUpdateSchema>) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (error) throw error;
      
      passwordForm.reset();
      
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      await signOut();
      onOpenChange(false);
      navigate('/');
      
      toast({
        title: 'Account deletion requested',
        description: 'Your account deletion request has been submitted.',
      });
    } catch (error: any) {
      console.error('Error requesting account deletion:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSelectPet = (petId: string) => {
    setSelectedPetId(petId);
    onOpenChange(false);
    navigate(`/profile?petId=${petId}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onOpenChange(false);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

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

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      toast({
        title: 'Search query too short',
        description: 'Please enter at least 3 characters to search for users.',
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(10);
      
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: existingRequest, error: checkError } = await supabase
        .from('user_friends')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (existingRequest && existingRequest.length > 0) {
        toast({
          title: 'Friend request exists',
          description: 'A friendship connection already exists with this user.',
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_friends')
        .insert([
          { user_id: user.id, friend_id: friendId, status: 'pending' }
        ]);
      
      if (error) throw error;
      
      toast({
        title: 'Friend request sent',
        description: 'Your friend request has been sent successfully.',
      });
      
      await fetchFriends();
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send friend request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Friend request accepted',
        description: 'You are now friends with this user.',
      });
      
      await fetchFriends();
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept friend request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Friend request rejected',
        description: 'The friend request has been rejected.',
      });
      
      await fetchFriends();
    } catch (error: any) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject friend request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelFriendRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: 'Friend request cancelled',
        description: 'Your friend request has been cancelled.',
      });
      
      await fetchFriends();
    } catch (error: any) {
      console.error('Error cancelling friend request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel friend request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);
      
      if (error) throw error;
      
      toast({
        title: 'Friend removed',
        description: 'The friendship has been removed.',
      });
      
      await fetchFriends();
    } catch (error: any) {
      console.error('Error removing friend:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove friend. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Owner Profile</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="profile">My Profile</TabsTrigger>
              <TabsTrigger value="pets">My Pets</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <Card>
                {loading ? (
                  <CardContent className="py-6">
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
                  </CardContent>
                ) : (
                  <>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={profileForm.getValues().name} />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <User className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle>{profileForm.getValues().name}</CardTitle>
                          <CardDescription>{profileForm.getValues().email}</CardDescription>
                        </div>
                      </div>
                      <label htmlFor="avatar-upload">
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                        <Button variant="outline" size="sm" className="cursor-pointer">
                          <Pencil className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                      </label>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="your.email@example.com" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us about yourself..." 
                                    className="min-h-32"
                                    {...field} 
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="bg-petpal-blue hover:bg-petpal-blue/90 mt-2" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="pets" className="space-y-4">
              <Card>
                <CardHeader className="flex justify-between items-end">
                  <div>
                    <CardTitle>My Pets</CardTitle>
                    <CardDescription>Manage your pet profiles and settings</CardDescription>
                  </div>
                  {userPetProfiles.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4" />
                          <span>Switch to Pet</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {userPetProfiles.map((pet) => (
                          <DropdownMenuItem key={pet.id} onClick={() => handleSelectPet(pet.id)}>
                            <Avatar className="h-6 w-6 mr-2">
                              <img src={pet.profilePicture || '/placeholder.svg'} alt={pet.name} className="object-cover" />
                            </Avatar>
                            {pet.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-32 bg-gray-200 rounded-t-md"></div>
                          <div className="p-4 border rounded-b-md border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                            <div className="flex justify-end mt-4 space-x-2">
                              <div className="h-8 w-16 bg-gray-200 rounded"></div>
                              <div className="h-8 w-24 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userPetProfiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userPetProfiles.map((pet) => (
                        <Card key={pet.id} className="overflow-hidden">
                          <div 
                            className="h-32 bg-cover bg-center" 
                            style={{ backgroundImage: `url(${pet.profilePicture || '/placeholder.svg'})` }}
                          />
                          <CardContent className="pt-4">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12 border-2 border-background -mt-10">
                                <img src={pet.profilePicture || '/placeholder.svg'} alt={pet.name} className="object-cover" />
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{pet.name}</h3>
                                <p className="text-sm text-muted-foreground">{pet.species}, {pet.age} years old</p>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                              <Link to={`/pet-edit/${pet.id}`} onClick={() => onOpenChange(false)}>
                                <Button variant="outline" size="sm">
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </Link>
                              <Button 
                                variant="default" 
                                size="sm"
                                className="bg-petpal-blue hover:bg-petpal-blue/90"
                                onClick={() => handleSelectPet(pet.id)}
                              >
                                <User className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <PawPrint className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                      <p className="mt-4 text-muted-foreground">You don't have any pets yet. Create your first pet profile!</p>
                      <Button 
                        className="bg-petpal-pink hover:bg-petpal-pink/90 mt-4"
                        onClick={() => {
                          onOpenChange(false);
                          const createProfileEvent = new CustomEvent('open-create-profile');
                          window.dispatchEvent(createProfileEvent);
                        }}
                      >
                        Create Pet Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              {userPetProfiles.length > 0 && (
                <div className="flex justify-center mt-4">
                  <Button 
                    className="bg-petpal-pink hover:bg-petpal-pink/90"
                    onClick={() => {
                      onOpenChange(false);
                      const createProfileEvent = new CustomEvent('open-create-profile');
                      window.dispatchEvent(createProfileEvent);
                    }}
                  >
                    Add New Pet
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="friends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Find Friends</CardTitle>
                  <CardDescription>Search for users by username to add them as friends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 items-center mb-6">
                    <div className="flex-1">
                      <Input 
                        placeholder="Search by username (@username)" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleSearch} 
                      disabled={isSearching || searchQuery.length < 3}
                      className="bg-petpal-blue hover:bg-petpal-blue/90"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Search Results:</h3>
                      <div className="space-y-3">
                        {searchResults.map((user) => {
                          const isAlreadyFriend = friends.some(friend => friend.id === user.id);
                          const hasSentRequest = sentRequests.some(req => req.friend_id === user.id);
                          const hasReceivedRequest = friendRequests.some(req => req.user_id.id === user.id);
                          
                          return (
                            <div key={user.id} className="flex items-center justify-between p-2 border rounded-md">
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3">
                                  {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.username} />
                                  ) : (
                                    <User className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </Avatar>
                                <div>
                                  <p className="font-medium">@{user.username}</p>
                                </div>
                              </div>
                              <div>
                                {isAlreadyFriend ? (
                                  <Button variant="outline" size="sm" disabled>
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Friends
                                  </Button>
                                ) : hasSentRequest ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => cancelFriendRequest(sentRequests.find(req => req.friend_id === user.id)?.id)}
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Cancel Request
                                  </Button>
                                ) : hasReceivedRequest ? (
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => acceptFriendRequest(friendRequests.find(req => req.user_id.id === user.id)?.id)}
                                      className="bg-petpal-blue hover:bg-petpal-blue/90 text-white hover:text-white"
                                    >
                                      <UserCheck className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => rejectFriendRequest(friendRequests.find(req => req.user_id.id === user.id)?.id)}
                                    >
                                      <UserX className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => sendFriendRequest(user.id)}
                                    className="bg-petpal-blue hover:bg-petpal-blue/90"
                                  >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Add Friend
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {searchResults.length === 0 && searchQuery.length >= 3 && !isSearching && (
                    <p className="text-center text-muted-foreground py-4">No users found matching "{searchQuery}"</p>
                  )}
                </CardContent>
              </Card>
              
              {friendRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Friend Requests</CardTitle>
                    <CardDescription>People who want to connect with you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {friendRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              {request.requester.avatar_url ? (
                                <img src={request.requester.avatar_url} alt={request.requester.username} />
                              ) : (
                                <User className="h-6 w-6 text-muted-foreground" />
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">@{request.requester.username}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => acceptFriendRequest(request.id)}
                              className="bg-petpal-blue hover:bg-petpal-blue/90"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => rejectFriendRequest(request.id)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {friends.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>My Friends</CardTitle>
                    <CardDescription>Your connected friends on PetPal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              {friend.avatar_url ? (
                                <img src={friend.avatar_url} alt={friend.username} />
                              ) : (
                                <User className="h-6 w-6 text-muted-foreground" />
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">@{friend.username}</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeFriend(friend.id)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {sentRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Friend requests you've sent that are waiting for approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sentRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              {request.friend.avatar_url ? (
                                <img src={request.friend.avatar_url} alt={request.friend.username} />
                              ) : (
                                <User className="h-6 w-6 text-muted-foreground" />
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">@{request.friend.username}</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => cancelFriendRequest(request.id)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {friends.length === 0 && friendRequests.length === 0 && sentRequests.length === 0 && (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <User className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Friends Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Connect with other PetPal owners to expand your pet's social circle.
                      </p>
                      <Button 
                        onClick={() => setSearchQuery('')}
                        className="bg-petpal-blue hover:bg-petpal-blue/90"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Find Friends
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Update Password</CardTitle>
                  <CardDescription>Change your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your current password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="bg-petpal-blue hover:bg-petpal-blue/90"
                        disabled={loading}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Delete Account</CardTitle>
                  <CardDescription>Permanently delete your account and all associated data</CardDescription>
                </CardHeader>
                <CardContent>
                  {showDeleteConfirm ? (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Are you sure?</AlertTitle>
                      <AlertDescription>
                        This action cannot be undone. All your data and pet profiles will be permanently deleted.
                      </AlertDescription>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={loading}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={loading}
                        >
                          {loading ? 'Deleting...' : 'Yes, delete my account'}
                        </Button>
                      </div>
                    </Alert>
                  ) : (
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete My Account
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Separator className="my-4" />
              
              <Card>
                <CardHeader>
                  <CardTitle>Sign Out</CardTitle>
                  <CardDescription>Log out from your account and browse as a guest</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSignOut}
                    disabled={loading}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-[1fr_100px] items-center gap-4">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive email notifications for pet updates and interactions</p>
                    </div>
                    <div className="flex justify-end">
                      <div className="flex items-center space-x-2">
                        <label htmlFor="notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {false ? "On" : "Off"}
                        </label>
                        <input type="checkbox" id="notifications" className="mr-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[1fr_100px] items-center gap-4">
                    <div>
                      <h3 className="font-medium">AI Content Review</h3>
                      <p className="text-sm text-muted-foreground">Review AI-generated content before posting</p>
                    </div>
                    <div className="flex justify-end">
                      <div className="flex items-center space-x-2">
                        <label htmlFor="ai-review" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {true ? "On" : "Off"}
                        </label>
                        <input type="checkbox" id="ai-review" className="mr-2" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[1fr_100px] items-center gap-4">
                    <div>
                      <h3 className="font-medium">Privacy Setting</h3>
                      <p className="text-sm text-muted-foreground">Make your pet profiles public or private</p>
                    </div>
                    <div className="flex justify-end">
                      <div className="flex items-center space-x-2">
                        <label htmlFor="privacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {true ? "Public" : "Private"}
                        </label>
                        <input type="checkbox" id="privacy" className="mr-2" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-petpal-blue hover:bg-petpal-blue/90"
                    onClick={() => toast({
                      title: 'Settings saved',
                      description: 'Your preferences have been updated successfully.'
                    })}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerProfileModal;
