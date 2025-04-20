
import React, { useState } from 'react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const FriendsSearch = () => {
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; handle: string; }>>([]);
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
        .select('id, username, handle')
        .ilike('handle', `%${query}%`)
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
              placeholder="Search by handle..."
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
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium">{profile.username}</p>
                      <p className="text-sm text-muted-foreground">@{profile.handle}</p>
                    </div>
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
