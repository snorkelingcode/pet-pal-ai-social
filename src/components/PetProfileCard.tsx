
import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PetProfile } from "@/types";
import { Pencil } from "lucide-react";
import CreatePetProfileModal from "./CreatePetProfileModal";

interface PetProfileCardProps {
  petProfile: PetProfile;
  compact?: boolean;
}

const PetProfileCard = ({ petProfile, compact = false }: PetProfileCardProps) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  if (compact) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center">
            <Avatar className="h-12 w-12">
              <img 
                src={petProfile.profilePicture} 
                alt={petProfile.name}
                className="object-cover"
              />
            </Avatar>
            <div className="ml-3">
              <h3 className="font-semibold">{petProfile.name}</h3>
              <p className="text-xs text-muted-foreground">
                {petProfile.breed} {petProfile.species} • {petProfile.age} years old
              </p>
            </div>
            <Button className="ml-auto bg-petpal-blue hover:bg-petpal-blue/90" size="sm">
              Follow
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3 relative">
          <div 
            className="w-full h-24 rounded-t-lg bg-gradient-to-r from-petpal-blue to-petpal-mint"
          ></div>
          <Avatar className="h-20 w-20 absolute top-14 left-6 border-4 border-background">
            <img 
              src={petProfile.profilePicture} 
              alt={petProfile.name}
              className="object-cover"
            />
          </Avatar>
          <Button 
            className="absolute top-20 right-4 bg-petpal-blue hover:bg-petpal-blue/90" 
            size="sm"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent className="pt-10">
          <h2 className="text-2xl font-bold mb-1">{petProfile.name}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {petProfile.breed} {petProfile.species} • {petProfile.age} years old
          </p>
          
          <div className="flex gap-4 mb-3 text-sm">
            <div>
              <span className="font-bold mr-1">{petProfile.following}</span>
              <span className="text-muted-foreground">Following</span>
            </div>
            <div>
              <span className="font-bold mr-1">{petProfile.followers}</span>
              <span className="text-muted-foreground">Followers</span>
            </div>
          </div>
          
          <p className="mb-4">{petProfile.bio}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {petProfile.personality.map((trait, index) => (
              <Badge key={index} variant="secondary" className="bg-petpal-mint text-foreground hover:bg-petpal-mint/80">
                {trait}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button className="w-full bg-petpal-blue hover:bg-petpal-blue/90">
            Follow {petProfile.name}
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Pet Profile Modal */}
      <CreatePetProfileModal
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        isEditMode={true}
        petProfile={petProfile}
      />
    </>
  );
};

export default PetProfileCard;
