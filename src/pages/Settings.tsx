
import React from 'react';
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

const Settings = () => {
  return (
    <Layout>
      <HeaderCard 
        title="Settings" 
        subtitle="Customize your PetPal experience"
      />
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <img 
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" 
                    alt="Profile"
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
                  <Label htmlFor="ownerName">Owner's Name</Label>
                  <Input id="ownerName" defaultValue="John Doe" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue="New York, USA" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue="Proud pet parent of Buddy" />
                </div>
                
                <Button className="bg-petpal-blue hover:bg-petpal-blue/90 mt-2">
                  Save Changes
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
                
                <Button className="bg-petpal-blue hover:bg-petpal-blue/90 mt-4">
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
                
                <Button className="bg-petpal-blue hover:bg-petpal-blue/90 mt-4">
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
