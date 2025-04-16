import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PetProfile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import PetProfileCard from './PetProfileCard';

interface OwnerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OwnerProfileModal = ({ open, onOpenChange }: OwnerProfileModalProps) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);

  useEffect(() => {
    const fetchUserPets = async () => {
      if (!user) return;
      
      try {
        setLoadingPets(true);
        
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) {
          throw error;
        }
        
        const petProfiles: PetProfile[] = data.map(pet => ({
          id: pet.id,
          ownerId: pet.owner_id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          personality: pet.personality || [],
          bio: pet.bio || '',
          profilePicture: pet.profile_picture || null,
          createdAt: pet.created_at,
          followers: pet.followers || 0,
          following: pet.following || 0,
          handle: pet.handle || pet.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        }));
        
        setPets(petProfiles);
      } catch (error) {
        console.error('Error fetching user pets:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your pet profiles',
          variant: 'destructive'
        });
      } finally {
        setLoadingPets(false);
      }
    };

    fetchUserPets();
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Owner Profile</DialogTitle>
          <DialogDescription>
            View and manage your pet profiles.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="grid gap-4">
            {loadingPets ? (
              <p>Loading pet profiles...</p>
            ) : pets.length > 0 ? (
              pets.map((pet) => (
                <PetProfileCard key={pet.id} petProfile={pet} compact showViewButton />
              ))
            ) : (
              <p>No pet profiles found. Create one to get started!</p>
            )}
          </CardContent>
        </Card>
        <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerProfileModal;
