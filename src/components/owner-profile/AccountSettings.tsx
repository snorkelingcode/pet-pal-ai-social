
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/use-toast';

export const AccountSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account settings and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: "Coming soon",
                description: "Account settings will be available in a future update."
              });
            }}
          >
            Change Password
          </Button>
          
          <Button 
            variant="destructive"
            onClick={() => {
              toast({
                title: "Coming soon",
                description: "Account deletion will be available in a future update."
              });
            }}
          >
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
