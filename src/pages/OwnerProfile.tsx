
import React from 'react';
import Layout from '@/components/Layout';
import { mockPetProfiles } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Link } from 'react-router-dom';
import { User, Pencil } from 'lucide-react';

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

const OwnerProfile = () => {
  const form = useForm<z.infer<typeof ownerProfileSchema>>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: {
      name: ownerData.name,
      email: ownerData.email,
      bio: ownerData.bio,
    },
  });

  const onSubmit = (data: z.infer<typeof ownerProfileSchema>) => {
    console.log("Owner profile updated:", data);
    // Here you would update the owner profile in your backend
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Owner Profile</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="pets">My Pets</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
              <CardHeader>
                <CardTitle>My Pets</CardTitle>
                <CardDescription>Manage your pet profiles and settings</CardDescription>
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
                        <Link to={`/pet-edit/${pet.id}`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/profile`}>
                          <Button variant="outline" size="sm">
                            <User className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </Link>
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
                  // Open the create pet profile modal
                  // Since this is just a prototype, we'll leave this as a placeholder
                  alert("This would open the Create Pet Profile modal");
                }}
              >
                Add New Pet
              </Button>
            </div>
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
    </Layout>
  );
};

export default OwnerProfile;
