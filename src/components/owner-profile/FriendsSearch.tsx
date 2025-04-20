
import React, { useState } from 'react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const FriendsSearch = () => {
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; avatar_url: string | null; }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for profiles',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) {
        toast({
          title: 'Error',
          description: 'You must be logged in to add friends',
          variant: 'destructive',
        });
        return;
      }

      // Check if friendship already exists
      const { data: existingFriend, error: checkError } = await supabase
        .from('user_friends')
        .select('*')
        .match({ user_id: userId, friend_id: friendId })
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingFriend) {
        toast({
          title: 'Already Friends',
          description: 'You are already friends with this user',
        });
        return;
      }

      // Add the friend relationship
      const { error: insertError } = await supabase
        .from('user_friends')
        .insert({ 
          user_id: userId, 
          friend_id: friendId,
          status: 'pending' 
        });

      if (insertError) throw insertError;

      toast({
        title: 'Friend Request Sent',
        description: 'Your friend request has been sent successfully',
      });
    } catch (error) {
      console.error('Error adding friend:', error);
      toast({
        title: 'Error',
        description: 'Failed to add friend',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Friends</CardTitle>
      </CardHeader>
      <CardContent>
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search by username..."
              onValueChange={handleSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {isSearching ? (
            <div className="py-6 text-center text-sm">Searching...</div>
          ) : (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {searchResults.map((profile) => (
                  <CommandItem
                    key={profile.id}
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
                        <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAddFriend(profile.id)}
                      className="ml-auto"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </CardContent>
    </Card>
  );
};
