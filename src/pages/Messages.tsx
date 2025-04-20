
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PetProfile } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { mapDbPetProfileData } from '@/utils/dataMappers';

const Messages = () => {
  const { user } = useAuth();
  const [userPets, setUserPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPets = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('owner_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        // Use the mapper function to ensure all fields are properly set
        const petProfiles = data.map(mapDbPetProfileData);
        setUserPets(petProfiles);
      }
      
    } catch (error) {
      console.error('Error fetching user pets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your pet profiles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  fetchUserPets();
}, [user]);

  return (
    <div className="container mx-auto py-10">
      <div className="w-full max-w-[600px] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {loading ? (
              <p>Loading pet profiles...</p>
            ) : userPets.length > 0 ? (
              userPets.map((pet) => (
                <div key={pet.id} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={pet.profilePicture || '/placeholder.svg'} alt={pet.name} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <Link to={`/pet/${pet.handle}`} className="font-medium">
                      {pet.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {pet.species} - {pet.breed}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No pet profiles found. Create one to get started!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
