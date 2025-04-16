import React, { useState, useEffect } from 'react';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, MessageSquare } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PetProfile } from '@/types';
import { toast } from '@/components/ui/use-toast';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const selectedPetId = searchParams.get('petId');
  const { user } = useAuth();
  
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const fetchPetProfiles = async () => {
      if (!user) {
        setPetProfiles([]);
        return;
      }
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) throw error;
        
        const formattedProfiles: PetProfile[] = data.map(pet => ({
          id: pet.id,
          ownerId: pet.owner_id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          personality: pet.personality || [],
          bio: pet.bio || '',
          profilePicture: pet.profile_picture,
          createdAt: pet.created_at,
          followers: pet.followers || 0,
          following: pet.following || 0,
          handle: pet.handle || pet.name.toLowerCase().replace(/\s+/g, '')
        }));
        
        setPetProfiles(formattedProfiles);
        console.log("Fetched pet profiles:", formattedProfiles);
      } catch (error) {
        console.error("Error fetching pet profiles:", error);
        toast({
          title: "Error",
          description: "Failed to load your pet profiles",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPetProfiles();
  }, [user]);
  
  const selectedPet = selectedPetId 
    ? petProfiles.find(pet => pet.id === selectedPetId) 
    : petProfiles.length > 0 ? petProfiles[0] : null;
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    toast({
      title: "Message sent",
      description: "This is a placeholder. In a complete app, this would send your message."
    });
    
    setMessage('');
  };

  if (loading) {
    return (
      <>
        <HeaderCard 
          title="Messages" 
          subtitle="Loading your conversations..."
        />
        <div className="w-full flex justify-center p-8">
          <div className="animate-pulse bg-muted rounded-md h-64 w-full max-w-md"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <HeaderCard 
          title="Messages" 
          subtitle="Sign in to chat with other pets"
        />
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in to access messages</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Create an account or sign in to message other pets and their owners
          </p>
          <div className="flex gap-4">
            <Button 
              className="bg-petpal-blue hover:bg-petpal-blue/90"
              asChild
            >
              <Link to="/login">Log in</Link>
            </Button>
            <Button 
              className="bg-petpal-pink hover:bg-petpal-pink/90"
              asChild
            >
              <Link to="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }
  
  if (petProfiles.length === 0) {
    return (
      <>
        <HeaderCard 
          title="Messages" 
          subtitle="Chat as your pet"
        />
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No pet profiles yet</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Create a pet profile to start chatting with other pets
          </p>
          <Button 
            className="bg-petpal-pink hover:bg-petpal-pink/90"
            onClick={() => {
              const createProfileEvent = new CustomEvent('open-create-profile');
              window.dispatchEvent(createProfileEvent);
            }}
          >
            Create Pet Profile
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderCard 
        title={`Messages${selectedPet ? ` for ${selectedPet.name}` : ''}`}
        subtitle="This is a placeholder. In the complete app, messages would be implemented."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-1 space-y-4 max-w-full">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-9" />
          </div>
          
          <div className="space-y-2">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No conversations yet.</p>
              <p className="text-sm">Messages would appear here in the complete app.</p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 flex flex-col h-[500px] border rounded-lg p-4">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">This is a placeholder for the messaging feature.</p>
              <p className="text-muted-foreground">In the complete app, conversations would appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
