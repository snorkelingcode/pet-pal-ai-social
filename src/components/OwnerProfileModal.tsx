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
import { useNavigate } from 'react-router-dom';

interface OwnerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OwnerProfileModal = ({ open, onOpenChange }: OwnerProfileModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const ownerProfileSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    bio: z.string().max(300, { message: "Bio must be less than 300 characters." }).optional(),
  });

  const form = useForm<z.infer<typeof ownerProfileSchema>>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
    },
  });

  useEffect(() => {
    const fetchUserPets = async () => {
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
          form.reset({
            name: profileData.username || '',
            email: user.email || '',
            bio: profileData.bio || '',
          });
          setAvatarUrl(profileData.avatar_url);
        }
        
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
          profilePicture: pet.profile_picture || '',
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

  const handleViewProfile = (pet: PetProfile) => {
    navigate(pet.profile_url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {avatarUrl ? (
                <img src={avatarUrl} alt={form.getValues().name} className="object-cover" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </Avatar>
            <div>
              <DialogTitle>{form.getValues().name}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                @{user?.email?.split('@')[0] || 'user'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Card>
          <CardContent className="grid gap-4">
            {loadingPets ? (
              <p>Loading pet profiles...</p>
            ) : pets.length > 0 ? (
              pets.map((pet) => (
                <div key={pet.id} className="flex items-center justify-between">
                  <PetProfileCard petProfile={pet} compact />
                  <Button 
                    size="sm" 
                    onClick={() => handleViewProfile(pet)}
                    className="bg-petpal-blue hover:bg-petpal-blue/90"
                  >
                    View Profile
                  </Button>
                </div>
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
