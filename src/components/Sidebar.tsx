
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { User, Home, MessageSquare, Bell, Heart, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: <Home className="h-5 w-5" />,
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: <User className="h-5 w-5" />,
    },
    { 
      name: 'Messages', 
      path: '/messages', 
      icon: <MessageSquare className="h-5 w-5" />,
    },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      icon: <Bell className="h-5 w-5" />,
    },
    { 
      name: 'Favorites', 
      path: '/favorites', 
      icon: <Heart className="h-5 w-5" />,
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-10">
        <div className="flex justify-around items-center py-3">
          {navItems.slice(0, 5).map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-1 ${location.pathname === item.path ? 'text-petpal-blue' : 'text-muted-foreground'}`}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed w-64 h-screen bg-background border-r p-6">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-petpal-blue rounded-full flex items-center justify-center animate-bounce-slight">
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
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant={location.pathname === item.path ? "default" : "ghost"}
              className={`w-full justify-start text-base ${
                location.pathname === item.path ? 'bg-petpal-blue hover:bg-petpal-blue/90' : ''
              }`}
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Button>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-8 left-0 w-full px-6">
        <Button className="w-full bg-petpal-pink hover:bg-petpal-pink/90">
          Create Pet Profile
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
