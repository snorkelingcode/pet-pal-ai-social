
import React, { useState } from 'react';
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
import { mockPetProfiles } from '@/data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { User, Pencil, PawPrint, AlertCircle, Lock, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';

// Mock owner data
const ownerData = {
  name: "Alex Johnson",
  email: "alex@example.com",
  bio: "Pet lover and proud parent of several fur babies. I love seeing my pets interacting with the PetPal AI community!",
  avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=150&h=150"
};

// Form schema for owner profile
const ownerProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(300, { message: "Bio must be less than 300 characters." }),
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
  const { user } = useAuth();
  
  // Profile form
  const profileForm = useForm<z.infer<typeof ownerProfileSchema>>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: {
      name: ownerData.name,
      email: ownerData.email,
      bio: ownerData.bio,
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

  const onProfileSubmit = (data: z.infer<typeof ownerProfileSchema>) => {
    console.log("Owner profile updated:", data);
    // Here you would update the owner profile in your backend
  };
  
  const onPasswordSubmit = (data: z.infer<typeof passwordUpdateSchema>) => {
    console.log("Password update requested:", data);
    // Here you would update the user's password
    passwordForm.reset();
    // Show success message (in a real app)
  };

  const handleDeleteAccount = () => {
    console.log("Account deletion requested");
    // Here you would implement account deletion logic
    setShowDeleteConfirm(false);
    onOpenChange(false);
    // In a real app, you'd sign out and redirect to home/login
  };
  
  const handleSelectPet = (petId: string) => {
    setSelectedPetId(petId);
    // Navigate to the selected pet's profile and close the modal
    onOpenChange(false);
    navigate(`/profile?petId=${petId}`);
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <img src={ownerData.avatar} alt={ownerData.name} />
                    </Avatar>
                    <div>
                      <CardTitle>{ownerData.name}</CardTitle>
                      <CardDescription>{ownerData.email}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
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
                      <Button type="submit" className="bg-petpal-blue hover:bg-petpal-blue/90 mt-2">Save Changes</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pets" className="space-y-4">
              <Card>
                <CardHeader className="flex justify-between items-end">
                  <div>
                    <CardTitle>My Pets</CardTitle>
                    <CardDescription>Manage your pet profiles and settings</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <PawPrint className="h-4 w-4" />
                        <span>Switch to Pet</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {mockPetProfiles.map((pet) => (
                        <DropdownMenuItem key={pet.id} onClick={() => handleSelectPet(pet.id)}>
                          <Avatar className="h-6 w-6 mr-2">
                            <img src={pet.profilePicture} alt={pet.name} className="object-cover" />
                          </Avatar>
                          {pet.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockPetProfiles.map((pet) => (
                    <Card key={pet.id} className="overflow-hidden">
                      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${pet.profilePicture})` }} />
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 border-2 border-background -mt-10">
                            <img src={pet.profilePicture} alt={pet.name} />
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
                </CardContent>
              </Card>
              <div className="flex justify-center mt-4">
                <Button 
                  className="bg-petpal-pink hover:bg-petpal-pink/90"
                  onClick={() => {
                    // Close this modal and open the create pet profile modal
                    onOpenChange(false);
                    // Since this is just a prototype, we'll leave this as a placeholder
                    alert("This would open the Create Pet Profile modal");
                  }}
                >
                  Add New Pet
                </Button>
              </div>
            </TabsContent>
            
            {/* New Security tab for password update and account deletion */}
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
                      <Button type="submit" className="bg-petpal-blue hover:bg-petpal-blue/90">
                        <Lock className="h-4 w-4 mr-2" />
                        Update Password
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
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                          Yes, delete my account
                        </Button>
                      </div>
                    </Alert>
                  ) : (
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete My Account
                    </Button>
                  )}
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
                  
                  <Button className="w-full mt-4 bg-petpal-blue hover:bg-petpal-blue/90">Save Settings</Button>
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
