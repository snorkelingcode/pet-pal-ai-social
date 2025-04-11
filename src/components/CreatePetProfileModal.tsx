
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, ImagePlus, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { Avatar } from '@/components/ui/avatar';
import { PetProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { petProfileService } from '@/services/petProfileService';

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Pet name must be at least 2 characters." }),
  species: z.string().min(1, { message: "Please select a species." }),
  breed: z.string().min(1, { message: "Please provide a breed." }),
  age: z.coerce.number().min(0, { message: "Age must be a positive number." }),
  bio: z.string().optional(),
  personality: z.array(z.string()).min(1, { message: "Please select at least one personality trait." }),
  heroOrVillain: z.enum(["hero", "villain", "neutral"], { 
    required_error: "Please select whether your pet is more of a hero or villain." 
  }),
  rivals: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Personality trait options
const personalityTraits = [
  { id: "grumpy", label: "Grumpy" },
  { id: "bossy", label: "Bossy" },
  { id: "barksAlot", label: "Barks a lot" },
  { id: "verySweet", label: "Very sweet" },
  { id: "spicy", label: "Spicy" },
  { id: "timid", label: "Timid" },
  { id: "playful", label: "Playful" },
  { id: "oblivious", label: "Oblivious" },
  { id: "silly", label: "Silly" },
  { id: "energetic", label: "Energetic" },
  { id: "lazy", label: "Lazy" },
  { id: "clever", label: "Clever" },
  { id: "sassy", label: "Sassy" },
];

interface CreatePetProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode?: boolean;
  petProfile?: PetProfile;
  onSuccess?: () => void;
}

const CreatePetProfileModal = ({ 
  open, 
  onOpenChange,
  isEditMode = false,
  petProfile,
  onSuccess
}: CreatePetProfileModalProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      age: 0,
      bio: "",
      personality: [],
      heroOrVillain: "neutral",
      rivals: "",
    },
  });

  // Populate the form with pet profile data when in edit mode
  useEffect(() => {
    if (isEditMode && petProfile) {
      form.reset({
        name: petProfile.name,
        species: petProfile.species,
        breed: petProfile.breed,
        age: petProfile.age,
        bio: petProfile.bio || "",
        personality: petProfile.personality,
        // Using default values for fields that might not be in the pet profile
        heroOrVillain: "neutral",
        rivals: "",
      });
      
      // Set the profile image preview if available
      if (petProfile.profilePicture) {
        setProfileImagePreview(petProfile.profilePicture);
      }
    }
  }, [isEditMode, petProfile, form]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const imageUrl = URL.createObjectURL(file);
      setProfileImagePreview(imageUrl);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pets')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading profile image:', uploadError);
        return null;
      }
      
      const { data } = supabase.storage.from('pets').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      return null;
    }
  };

  const onSubmit = async (data: FormValues) => {
    // Skip profile image validation for edit mode if no new image is selected
    if (!isEditMode && !profileImage) {
      toast({
        title: "Profile image required",
        description: "Please upload a profile image for your pet",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a pet profile",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      let profileImageUrl = petProfile?.profilePicture || '';

      // Upload new profile image if provided
      if (profileImage) {
        const uploadedUrl = await uploadProfileImage(profileImage);
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        } else {
          toast({
            title: "Image upload failed",
            description: "Failed to upload profile image. Please try again.",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
      }

      // Create or update the pet profile
      if (isEditMode && petProfile) {
        // Update existing pet profile
        const updatedProfile = await petProfileService.updatePetProfile(petProfile.id, {
          name: data.name,
          species: data.species,
          breed: data.breed,
          age: data.age,
          personality: data.personality,
          bio: data.bio || '',
          profilePicture: profileImageUrl,
        });

        toast({
          title: "Pet profile updated!",
          description: `${data.name}'s profile has been updated successfully!`,
        });

        if (onSuccess) onSuccess();
      } else {
        // Create new pet profile
        const newProfile = await petProfileService.createPetProfile({
          ownerId: user.id,
          name: data.name,
          species: data.species,
          breed: data.breed,
          age: data.age,
          personality: data.personality,
          bio: data.bio || '',
          profilePicture: profileImageUrl,
        });

        // Generate AI persona for the new pet
        try {
          await petProfileService.generateAIPersona(newProfile);
        } catch (error) {
          console.error("Failed to generate AI persona:", error);
          // Non-critical error, so just log it
        }

        toast({
          title: "Pet profile created!",
          description: `${data.name}'s profile has been created successfully!`,
        });

        if (onSuccess) onSuccess();
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving pet profile:", error);
      toast({
        title: "Error",
        description: "Failed to save pet profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? "Edit Pet Profile" : "Create Pet Profile"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update your pet's profile information below."
              : "Let's create a profile for your pet! Provide as much information as possible to help our AI build a personality for your pet."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-3">
              <Label htmlFor="profileImage" className="text-center w-full">
                Profile Image
              </Label>
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImagePlus className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </Avatar>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => document.getElementById('profileImage')?.click()}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {isEditMode 
                  ? "Upload a new profile image or keep the existing one"
                  : "Upload a clear, face-forward image of your pet"
                }
              </p>
            </div>
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pet Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Max" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="hamster">Hamster</SelectItem>
                        <SelectItem value="fish">Fish</SelectItem>
                        <SelectItem value="reptile">Reptile</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed</FormLabel>
                    <FormControl>
                      <Input placeholder="Golden Retriever" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your pet..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your pet's life, habits, and what makes them unique.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Personality Traits */}
            <FormField
              control={form.control}
              name="personality"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Personality Traits</FormLabel>
                    <FormDescription>
                      Select traits that best describe your pet's personality.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {personalityTraits.map((trait) => (
                      <div key={trait.id} className="flex items-center space-x-2">
                        <Checkbox 
                          checked={field.value?.includes(trait.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), trait.id]);
                            } else {
                              field.onChange(field.value?.filter(value => value !== trait.id));
                            }
                          }}
                          id={`trait-${trait.id}`}
                        />
                        <Label htmlFor={`trait-${trait.id}`} className="text-sm">
                          {trait.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Hero or Villain */}
            <FormField
              control={form.control}
              name="heroOrVillain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Would your pet be a hero or villain?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hero" id="hero" />
                        <Label htmlFor="hero">Hero</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="villain" id="villain" />
                        <Label htmlFor="villain">Villain</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="neutral" id="neutral" />
                        <Label htmlFor="neutral">Neutral</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    This helps us understand how your pet would act in various situations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Rivals */}
            <FormField
              control={form.control}
              name="rivals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rivals or Enemies</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Squirrels, the vacuum cleaner, the mail carrier..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Does your pet have any rivals or things they strongly dislike?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Only show additional images upload in create mode, not edit mode */}
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="additionalImages">
                  Additional Images & Videos
                </Label>
                <div className="flex flex-col space-y-2">
                  <div 
                    className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => document.getElementById('additionalImages')?.click()}
                  >
                    <Input
                      id="additionalImages"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleImagesChange}
                    />
                    <ImagePlus className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload additional photos and videos of your pet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      The more images you provide, the better our AI can understand your pet's appearance
                    </p>
                  </div>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-md overflow-hidden">
                            <img 
                              src={URL.createObjectURL(image)} 
                              alt={`Image ${index}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload multiple photos showing different angles and expressions of your pet.
                </p>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-petpal-blue hover:bg-petpal-blue/90"
                disabled={submitting}
              >
                {submitting ? "Saving..." : (isEditMode ? "Update Pet Profile" : "Create Pet Profile")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePetProfileModal;
