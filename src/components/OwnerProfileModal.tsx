
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { User, Pencil, PawPrint, AlertCircle, Lock, Trash2, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { PetProfile } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Form schema for owner profile
const ownerProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(300, { message: "Bio must be less than 300 characters." }).optional(),
});

// Password update schema
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
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userPetProfiles, setUserPetProfiles] = useState<PetProfile[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Profile form
  const profileForm = useForm<z.infer<typeof ownerProfileSchema>>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
    },
  });

  // Password update form
  const passwordForm = useForm<z.infer<typeof passwordUpdateSchema>>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch user profile and pet data when modal opens
  useEffect(() => {
    if (open && user) {
      setLoading(true);
      
      // Fetch user profile
      const fetchUserProfile = async () => {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (profileData) {
            // Update form with user profile data
            profileForm.reset({
              name: profileData.username,
              email: user.email,
              bio: profileData.bio || '',
            });
            
            // Set avatar URL
            setAvatarUrl(profileData.avatar_url);
          }
          
          // Fetch user's pet profiles
          const { data: petsData, error: petsError } = await supabase
            .from('pet_profiles')
            .select('*')
            .eq('owner_id', user.id);
            
          if (petsError) throw petsError;
          
          if (petsData) {
            const formattedPets: PetProfile[] = petsData.map(pet => ({
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
    }
  }, [open, user, profileForm]);

  const onProfileSubmit = async (data: z.infer<typeof ownerProfileSchema>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update email in auth if it changed
      if (data.email !== user.email) {
        const { error: updateEmailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (updateEmailError) throw updateEmailError;
      }
      
      // Update profile in database
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
      
      // Update password
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
      
      // In a real app, you would implement account deletion through an API route
      // or Supabase Edge Function as this requires admin privileges
      
      // For now, we'll just sign out
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
    // Navigate to the selected pet's profile and close the modal
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
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const avatarUrl = publicUrlData.publicUrl;
      
      // Update the user's profile with the new avatar URL
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Owner Profile</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="profile">My Profile</TabsTrigger>
              <TabsTrigger value="pets">My Pets</TabsTrigger>
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
                              <img src={pet.profilePicture} alt={pet.name} className="object-cover" />
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
                            style={{ backgroundImage: `url(${pet.profilePicture})` }}
                          />
                          <CardContent className="pt-4">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12 border-2 border-background -mt-10">
                                <img src={pet.profilePicture} alt={pet.name} className="object-cover" />
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
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="flex justify-center mt-4">
                <Button 
                  className="bg-petpal-pink hover:bg-petpal-pink/90"
                  onClick={() => {
                    onOpenChange(false);
                    toast({
                      title: "Create a pet profile",
                      description: "Add a new furry friend to your PetPal account."
                    });
                  }}
                >
                  Add New Pet
                </Button>
              </div>
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
