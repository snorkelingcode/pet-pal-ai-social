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
import { User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { mapDbPetProfileData } from '@/utils/dataMappers';

interface OwnerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OwnerProfileModal = ({ open, onOpenChange }: OwnerProfileModalProps) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [userData, setUserData] = useState<{ username: string; bio: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoadingPets(true);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData) {
          setUserData({
            username: profileData.username || '',
            email: user.email || '',
            bio: profileData.bio || '',
          });
        }
        
        const { data: petsData, error: petsError } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('owner_id', user.id);
          
        if (petsError) throw petsError;

        if (petsData) {
          const formattedPets = petsData.map(mapDbPetProfileData);
          setPets(formattedPets);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive'
        });
      } finally {
        setLoadingPets(false);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <User className="h-5 w-5 text-muted-foreground" />
            </Avatar>
            <div>
              <DialogTitle>{userData?.username || 'User'}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {userData?.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {userData?.bio && (
          <p className="text-sm text-muted-foreground mb-4">{userData.bio}</p>
        )}

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
