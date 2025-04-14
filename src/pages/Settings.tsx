
import React from 'react';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Settings as SettingsIcon, Bell, Shield, Palette, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <>
        <HeaderCard 
          title="Settings" 
          subtitle="Sign in to access your account settings"
        />
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <SettingsIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in required</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Please sign in to access and manage your account settings
          </p>
          <div className="flex gap-4">
            <Link to="/login">
              <Button className="bg-petpal-blue hover:bg-petpal-blue/90">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-petpal-pink hover:bg-petpal-pink/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderCard title="Settings" subtitle="Manage your account and app preferences" />
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input id="username" defaultValue={user.email?.split('@')[0] || "N/A"} className="col-span-2" disabled />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" defaultValue={user.email || "N/A"} className="col-span-2" disabled />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="theme" className="text-right">
                  Theme
                </Label>
                <Select defaultValue="system">
                  <SelectTrigger id="theme" className="col-span-2">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label htmlFor="language" className="text-right">
                  Language
                </Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language" className="col-span-2">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">Profile Visibility</h2>
                  <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                </div>
                <Switch id="profile-visibility" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">Message Privacy</h2>
                  <p className="text-sm text-muted-foreground">Control who can send you direct messages</p>
                </div>
                <Switch id="message-privacy" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">Data Sharing</h2>
                  <p className="text-sm text-muted-foreground">Allow us to share your data with third-party services</p>
                </div>
                <Switch id="data-sharing" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Here you can manage critical account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">Email Notifications</h2>
                  <p className="text-sm text-muted-foreground">Receive updates and important announcements via email</p>
                </div>
                <Switch id="email-notifications" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">Push Notifications</h2>
                  <p className="text-sm text-muted-foreground">Get real-time updates on your mobile device</p>
                </div>
                <Switch id="push-notifications" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="text-sm font-semibold">In-App Notifications</h2>
                  <p className="text-sm text-muted-foreground">See notifications directly within the app</p>
                </div>
                <Switch id="in-app-notifications" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Settings;
