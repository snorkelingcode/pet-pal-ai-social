
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Pencil, User } from 'lucide-react';
import { PetProfile } from '@/types';
import { useNavigate } from 'react-router-dom';

interface PetsListProps {
  pets: PetProfile[];
  onEditProfile: (petId: string) => void;
  onCreateProfile: () => void;
}

export const PetsList = ({ pets, onEditProfile, onCreateProfile }: PetsListProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Pets</CardTitle>
        <CardDescription>Manage your pet profiles and settings</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pets.length > 0 ? (
          pets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden">
              <div 
                className="h-32 bg-cover bg-center" 
                style={{ backgroundImage: `url(${pet.profilePicture || '/placeholder.svg'})` }}
              />
              <CardContent className="pt-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 border-2 border-background -mt-10">
                    <img src={pet.profilePicture || '/placeholder.svg'} alt={pet.name} className="object-cover" />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">{pet.species}, {pet.age} years old</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditProfile(pet.id)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/pet/${pet.id}`)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-4 text-muted-foreground">You don't have any pets yet. Create your first pet profile!</p>
            <Button 
              className="bg-petpal-pink hover:bg-petpal-pink/90 mt-4"
              onClick={onCreateProfile}
            >
              Create Pet Profile
            </Button>
          </div>
        )}
      </CardContent>
      {pets.length > 0 && (
        <div className="flex justify-center mt-4 pb-4">
          <Button 
            className="bg-petpal-pink hover:bg-petpal-pink/90"
            onClick={onCreateProfile}
          >
            Add New Pet
          </Button>
        </div>
      )}
    </Card>
  );
};
