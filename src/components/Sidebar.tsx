
import React, { useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { User, Home, MessageSquare, Bell, Heart, Settings, PawPrint, LogIn } from 'lucide-react';
import CreatePetProfileModal from './CreatePetProfileModal';
import OwnerProfileModal from './OwnerProfileModal';
import { useAuth } from '@/contexts/AuthContext';
import { mockPetProfiles } from '@/data/mockData';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isOwnerProfileOpen, setIsOwnerProfileOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  
  const [searchParams] = useSearchParams();
  const selectedPetId = searchParams.get('petId');
  
  const selectedPet = selectedPetId 
    ? mockPetProfiles.find(pet => pet.id === selectedPetId) 
    : mockPetProfiles[0];
  
  const navItems = [
    { 
      name: 'Feed', 
      path: '/', 
      icon: <Home className="h-5 w-5" />,
      requiresAuth: false
    },
    { 
      name: 'Profile', 
      path: selectedPetId ? `/profile?petId=${selectedPetId}` : '/profile', 
      icon: <User className="h-5 w-5" />,
      requiresAuth: true
    },
    { 
      name: 'Messages', 
      path: selectedPetId ? `/messages?petId=${selectedPetId}` : '/messages', 
      icon: <MessageSquare className="h-5 w-5" />,
      requiresAuth: true
    },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      icon: <Bell className="h-5 w-5" />,
      requiresAuth: true
    },
    { 
      name: 'Favorites', 
      path: '/favorites', 
      icon: <Heart className="h-5 w-5" />,
      requiresAuth: true
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings className="h-5 w-5" />,
      requiresAuth: true
    },
  ];

  const handleSelectPet = (petId) => {
    navigate(`/profile?petId=${petId}`);
  };
  
  const handleLoginClick = () => {
    navigate('/login');
  };

  if (isMobile) {
    return (
      <>
        <CreatePetProfileModal
          open={isCreateProfileOpen}
          onOpenChange={setIsCreateProfileOpen}
        />
        <OwnerProfileModal
          open={isOwnerProfileOpen}
          onOpenChange={setIsOwnerProfileOpen}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed w-64 h-screen py-6 pr-4">
        <div className="flex items-center mb-8 animate-gentle-wave">
          <div className="w-10 h-10 bg-petpal-blue rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M8 12.5c1-1.3 2.5-2 4-2s3 .7 4 2"></path>
              <path d="M6 8.5c.5-.5 1.5-1 2.5-1s2 .5 2.5 1"></path>
              <path d="M13 7.5c.5-.5 1.5-1 2.5-1s2 .5 2.5 1"></path>
              <path d="M9 11.5c-1.5-1-2.5-3-2.5-3.5-.4.4-1 .5-1.5.5-1 0-2-.5-2.5-1-.6-.5-.6-3 1-3 0 0 1.2-.5 1.8.5C6 5 6 6 5.5 6.5c1 .5 2 1.5 3 2.5"></path>
              <path d="M19 11.5c1.5-1 2.5-3 2.5-3.5.4.4 1 .5 1.5.5 1 0 2-.5 2.5-1 .6-.5.6-3-1-3 0 0-1.2-.5-1.8.5C22 5 22 6 22.5 6.5c-1 .5-2 1.5-3 2.5"></path>
              <path d="M9 13.5c-1-.8-2-1.4-3-1.5-.6-.1-1.3 0-1.5.5-.4.7 0 1.1.5 1.5.5.2 1 .5 1.5.5s1-.2 1.5-.5C8.5 13.7 9 13.5 9 13.5z"></path>
              <path d="M15 13.5c1-.8 2-1.4 3-1.5.6-.1 1.3 0 1.5.5.4.7 0 1.1-.5 1.5-.5.2-1 .5-1.5.5s-1-.2-1.5-.5c-.5-.3-1-.5-1-.5z"></path>
              <path d="M12 20c-1 0-2-.8-2-1.5 0-.5.5-1 1-1.5.8-.7 2-1.5 4-1.5s3.2.8 4 1.5c.5.5 1 1 1 1.5 0 .7-1 1.5-2 1.5"></path>
            </svg>
          </div>
          <h1 className="ml-2 text-2xl font-bold text-petpal-blue">PetPal AI</h1>
        </div>
        <nav className="space-y-2">
          <Link to="/">
            <Button
              variant={location.pathname === '/' ? "default" : "ghost"}
              className={`w-full justify-start text-base ${
                location.pathname === '/' ? 'bg-petpal-blue hover:bg-petpal-blue/90' : ''
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="ml-2">Feed</span>
            </Button>
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <>
      <div className="fixed w-64 h-screen py-6 pr-4">
        <div className="flex items-center mb-8 animate-gentle-wave">
          <div className="w-10 h-10 bg-petpal-blue rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M8 12.5c1-1.3 2.5-2 4-2s3 .7 4 2"></path>
              <path d="M6 8.5c.5-.5 1.5-1 2.5-1s2 .5 2.5 1"></path>
              <path d="M13 7.5c.5-.5 1.5-1 2.5-1s2 .5 2.5 1"></path>
              <path d="M9 11.5c-1.5-1-2.5-3-2.5-3.5-.4.4-1 .5-1.5.5-1 0-2-.5-2.5-1-.6-.5-.6-3 1-3 0 0 1.2-.5 1.8.5C6 5 6 6 5.5 6.5c1 .5 2 1.5 3 2.5"></path>
              <path d="M19 11.5c1.5-1 2.5-3 2.5-3.5.4.4 1 .5 1.5.5 1 0 2-.5 2.5-1 .6-.5.6-3-1-3 0 0-1.2-.5-1.8.5C22 5 22 6 22.5 6.5c-1 .5-2 1.5-3 2.5"></path>
              <path d="M9 13.5c-1-.8-2-1.4-3-1.5-.6-.1-1.3 0-1.5.5-.4.7 0 1.1.5 1.5.5.2 1 .5 1.5.5s1-.2 1.5-.5C8.5 13.7 9 13.5 9 13.5z"></path>
              <path d="M15 13.5c1-.8 2-1.4 3-1.5.6-.1 1.3 0 1.5.5.4.7 0 1.1-.5 1.5-.5.2-1 .5-1.5.5s-1-.2-1.5-.5c-.5-.3-1-.5-1-.5z"></path>
              <path d="M12 20c-1 0-2-.8-2-1.5 0-.5.5-1 1-1.5.8-.7 2-1.5 4-1.5s3.2.8 4 1.5c.5.5 1 1 1 1.5 0 .7-1 1.5-2 1.5"></path>
            </svg>
          </div>
          <h1 className="ml-2 text-2xl font-bold text-petpal-blue">PetPal AI</h1>
        </div>
        
        {/* Pet selection dropdown for logged in users */}
        {user && selectedPet && (
          <div className="mb-4 p-3 bg-accent rounded-lg flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <img src={selectedPet.profilePicture} alt={selectedPet.name} className="object-cover" />
            </Avatar>
            <div>
              <p className="text-sm font-medium">{selectedPet.name}</p>
              <p className="text-xs text-muted-foreground">Active Profile</p>
            </div>
            
            {/* Pet selection dropdown - only shows user's pets */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                >
                  <PawPrint className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {mockPetProfiles.map((pet) => (
                  <DropdownMenuItem key={pet.id} onClick={() => handleSelectPet(pet.id)}>
                    <Avatar className="h-6 w-6 mr-2">
                      <img src={pet.profilePicture} alt={pet.name} className="object-cover" />
                    </Avatar>
                    {pet.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            if (!user && item.requiresAuth) {
              return (
                <Link key={item.path} to="/login">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-base"
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                </Link>
              );
            }
            
            const isActive = item.path.split('?')[0] === location.pathname;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-base ${
                    isActive ? 'bg-petpal-blue hover:bg-petpal-blue/90' : ''
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
        
        {/* Buttons for signed-in users */}
        {user && (
          <div className="absolute bottom-8 right-4 left-0 pr-4 space-y-2">
            <Button 
              className="w-full bg-petpal-pink hover:bg-petpal-pink/90 animate-gentle-wave"
              onClick={() => setIsCreateProfileOpen(true)}
            >
              Create Pet Profile
            </Button>
            <Button 
              className="w-full bg-petpal-blue hover:bg-petpal-blue/90"
              onClick={() => setIsOwnerProfileOpen(true)}
            >
              Owner Profile
            </Button>
          </div>
        )}
        
        {/* Sign In button for guests */}
        {!user && (
          <div className="absolute bottom-8 right-4 left-0 pr-4">
            <Button 
              className="w-full bg-petpal-blue hover:bg-petpal-blue/90"
              onClick={handleLoginClick}
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </div>
        )}
      </div>
      <CreatePetProfileModal
        open={isCreateProfileOpen}
        onOpenChange={setIsCreateProfileOpen}
      />
      <OwnerProfileModal
        open={isOwnerProfileOpen}
        onOpenChange={setIsOwnerProfileOpen}
      />
    </>
  );
};

export default Sidebar;
