import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Home, 
  User, 
  Mail, 
  Bell, 
  Settings, 
  LogOut, 
  Plus, 
  PawPrint,
  Menu,
  X
} from 'lucide-react';
import { Avatar } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PetProfile } from '@/types';
import CreatePetProfileModal from './CreatePetProfileModal';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const { user, signOut } = useAuth(); // Use signOut from AuthContext
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPetProfiles = async () => {
      if (!user) {
        setPetProfiles([]);
        setSelectedPetId(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('pet_profiles')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) {
          console.error('Error fetching pet profiles:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const formattedProfiles: PetProfile[] = data.map(pet => ({
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
            handle: pet.handle
          }));
          
          setPetProfiles(formattedProfiles);
          // Set the first pet as selected if none is currently selected
          if (!selectedPetId && formattedProfiles.length > 0) {
            setSelectedPetId(formattedProfiles[0].id);
          }
        } else {
          setPetProfiles([]);
        }
      } catch (error) {
        console.error('Error fetching pet profiles:', error);
      }
    };

    fetchPetProfiles();

    // Listen for open-create-profile custom event
    const handleOpenCreateProfile = () => {
      setIsCreateProfileOpen(true);
    };

    window.addEventListener('open-create-profile', handleOpenCreateProfile);

    return () => {
      window.removeEventListener('open-create-profile', handleOpenCreateProfile);
    };
  }, [user, selectedPetId]);

  const handlePetChange = (petId: string) => {
    setSelectedPetId(petId);
    setSidebarOpen(false); // Close mobile sidebar when switching pets
  };

  const handleLogout = async () => {
    await signOut(); // Use signOut instead of logout
    navigate('/');
  };

  const handleCreateProfile = () => {
    setIsCreateProfileOpen(true);
  };

  const sidebarLinks = [
    { icon: <Home className="h-5 w-5 mr-3" />, label: "Feed", path: "/" },
    { icon: <PawPrint className="h-5 w-5 mr-3" />, label: "My Pet", path: "/pet" },
    { icon: <Mail className="h-5 w-5 mr-3" />, label: "Messages", path: "/messages" },
    { icon: <Bell className="h-5 w-5 mr-3" />, label: "Notifications", path: "/notifications" },
    { icon: <User className="h-5 w-5 mr-3" />, label: "My Profile", path: "/profile" }
  ];

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const renderSidebarContent = () => (
    <>
      <div className="flex flex-col h-full justify-between pb-4">
        <div className="space-y-6">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              PetPal
            </h2>
            
            {user && petProfiles.length > 0 && (
              <div className="mb-4">
                <Select 
                  value={selectedPetId || ''}
                  onValueChange={handlePetChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {petProfiles.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full overflow-hidden bg-muted mr-2">
                            {pet.profilePicture && (
                              <img 
                                src={pet.profilePicture} 
                                alt={pet.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <span>{pet.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full flex items-center justify-center"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCreateProfile();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Pet
                      </Button>
                    </div>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-1">
              {sidebarLinks.map((link) => {
                // For pet profile link, add the selected pet ID if available
                const finalPath = link.path === '/pet' && selectedPetId 
                  ? `${link.path}/${selectedPetId}`
                  : link.path === '/messages' && selectedPetId
                  ? `${link.path}?petId=${selectedPetId}`
                  : link.path;

                return (
                  <Button
                    key={link.path}
                    variant={isActiveLink(link.path) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Link to={finalPath}>
                      {link.icon}
                      {link.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-3 py-2">
          {user ? (
            <>
              <div className="mb-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  asChild
                  onClick={() => setSidebarOpen(false)}
                >
                  <Link to="/settings">
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9 mr-2">
                    <div className="bg-muted h-full w-full flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Avatar>
                  <div className="truncate">
                    <p className="text-sm font-medium">{user.email?.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-background p-2 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">PetPal</h1>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-background">
          {renderSidebarContent()}
        </div>
      </div>
      
      <CreatePetProfileModal 
        open={isCreateProfileOpen} 
        onOpenChange={setIsCreateProfileOpen}
        onSuccess={() => {
          // Refresh pet profiles
          const fetchPetProfiles = async () => {
            if (!user) return;
            
            const { data, error } = await supabase
              .from('pet_profiles')
              .select('*')
              .eq('owner_id', user.id)
              .order('created_at', { ascending: false });
              
            if (error) {
              console.error('Error fetching pet profiles:', error);
              return;
            }
            
            if (data && data.length > 0) {
              const formattedProfiles: PetProfile[] = data.map(pet => ({
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
                handle: pet.handle
              }));
              
              setPetProfiles(formattedProfiles);
              // Set the newly created pet as selected
              setSelectedPetId(formattedProfiles[0].id);
            }
          };
          
          fetchPetProfiles();
        }}
      />
    </>
  );
};

export default Sidebar;
