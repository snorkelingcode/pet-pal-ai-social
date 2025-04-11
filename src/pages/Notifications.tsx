
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Bell, Heart, MessageSquare, UserPlus, AlertCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow';
  actor: {
    name: string;
    avatar: string;
  };
  content: string;
  comment?: string;
  target?: string;
  time: string;
  read: boolean;
}

const Notifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // In a real application, we would fetch notifications from a notifications table
        // For this demo, we're setting an empty array since we don't have actual notification data
        setNotifications([]);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user, toast]);
  
  const handleFollowBack = (name: string) => {
    toast({
      title: "Following back",
      description: `You are now following ${name}`,
    });
  };

  const renderNotificationContent = (notification: Notification) => (
    <Card 
      key={notification.id} 
      className={`hover:bg-accent ${!notification.read ? 'border-l-4 border-l-petpal-blue' : ''}`}
    >
      <CardContent className="p-4 flex items-center">
        <Avatar className="h-10 w-10 flex-shrink-0 mr-3">
          <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
        </Avatar>
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-semibold">{notification.actor.name}</span>
            {' '}{notification.content}
            {notification.type === 'comment' && 
              <span className="text-muted-foreground"> "{notification.comment}"</span>
            }
            {notification.target && 
              <span className="text-muted-foreground"> on {notification.target}</span>
            }
          </p>
          <span className="text-xs text-muted-foreground mt-1 block">{notification.time}</span>
        </div>
        {notification.type === 'follow' && (
          <Button 
            size="sm" 
            className="mr-3 bg-petpal-blue hover:bg-petpal-blue/90"
            onClick={() => handleFollowBack(notification.actor.name)}
          >
            <UserPlus className="mr-1 h-3 w-3" /> Follow Back
          </Button>
        )}
        <div className="flex items-center justify-end">
          {notification.type === 'like' && 
            <Heart className="h-4 w-4 text-petpal-pink" />
          }
          {notification.type === 'comment' && 
            <MessageSquare className="h-4 w-4 text-petpal-blue" />
          }
          {notification.type === 'follow' && 
            <UserPlus className="h-4 w-4 text-petpal-blue" />
          }
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <HeaderCard 
          title="Notifications" 
          subtitle="Loading..."
        />
        <div className="space-y-3">
          <div className="animate-pulse bg-muted rounded-md h-16 w-full"></div>
          <div className="animate-pulse bg-muted rounded-md h-16 w-full"></div>
          <div className="animate-pulse bg-muted rounded-md h-16 w-full"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <HeaderCard 
          title="Notifications" 
          subtitle="Sign in to view your notifications"
        />
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Bell className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in to see notifications</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Create an account or sign in to receive notifications about activity on your posts and profiles
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
      </Layout>
    );
  }

  return (
    <Layout>
      <HeaderCard 
        title="Notifications" 
        subtitle="Stay updated with your furry friends' activities"
      />
      
      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map(renderNotificationContent)
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Bell className="h-10 w-10 mb-2 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">When someone interacts with your content, it will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-4">
          <div className="space-y-3">
            {notifications.filter(n => !n.read).length > 0 ? (
              notifications.filter(n => !n.read).map(renderNotificationContent)
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>No unread notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="mentions" className="mt-4">
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Bell className="h-10 w-10 mb-2 opacity-50" />
            <p>No mentions yet</p>
            <p className="text-sm">When someone mentions you, it will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

// Adding missing AvatarImage import
import { AvatarImage } from '@/components/ui/avatar';

export default Notifications;
