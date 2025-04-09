import React from 'react';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Bell, Heart, MessageSquare, UserPlus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

const mockNotifications = [
  {
    id: 1,
    type: 'like',
    actor: {
      name: 'Buddy',
      avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
    },
    content: 'liked your post',
    target: 'Going for a walk at the beach today!',
    time: '5 minutes ago',
    read: false
  },
  {
    id: 2,
    type: 'comment',
    actor: {
      name: 'Whiskers',
      avatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
    },
    content: 'commented on your post',
    comment: 'Meow! Looks fun!',
    target: 'New toy day!',
    time: '1 hour ago',
    read: false
  },
  {
    id: 3,
    type: 'like',
    actor: {
      name: 'Rex',
      avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
    },
    content: 'liked your comment',
    comment: 'Thanks for the treat recommendation!',
    time: '3 hours ago',
    read: true
  },
  {
    id: 4,
    type: 'follow',
    actor: {
      name: 'Paws',
      avatar: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
    },
    content: 'started following you',
    time: '1 day ago',
    read: true
  },
  {
    id: 5,
    type: 'comment',
    actor: {
      name: 'Fluffy',
      avatar: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
    },
    content: 'replied to your comment',
    comment: 'Let\'s meet at the dog park!',
    target: 'Looking for playmates in Central Park',
    time: '2 days ago',
    read: true
  }
];

const Notifications = () => {
  const { toast } = useToast();
  
  const handleFollowBack = (name: string) => {
    toast({
      title: "Following back",
      description: `You are now following ${name}`,
    });
  };

  const renderNotificationContent = (notification) => (
    <Card 
      key={notification.id} 
      className={`hover:bg-accent ${!notification.read ? 'border-l-4 border-l-petpal-blue' : ''}`}
    >
      <CardContent className="p-4 flex">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <img src={notification.actor.avatar} alt={notification.actor.name} className="object-cover" />
        </Avatar>
        <div className="ml-3 flex-1 flex flex-col items-end">
          <div className="text-right w-full">
            <p className="text-sm text-right">
              <span className="font-semibold">{notification.actor.name}</span>
              {' '}{notification.content}
              {notification.type === 'comment' && 
                <span className="text-muted-foreground"> "{notification.comment}"</span>
              }
              {notification.target && 
                <span className="text-muted-foreground"> on {notification.target}</span>
              }
            </p>
            <span className="text-xs text-muted-foreground mt-1 block text-right">{notification.time}</span>
          </div>
          {notification.type === 'follow' && (
            <Button 
              size="sm" 
              className="mt-2 bg-petpal-blue hover:bg-petpal-blue/90"
              onClick={() => handleFollowBack(notification.actor.name)}
            >
              <UserPlus className="mr-1 h-3 w-3" /> Follow Back
            </Button>
          )}
        </div>
        <div className="ml-2 flex items-center">
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
            {mockNotifications.map(renderNotificationContent)}
          </div>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-4">
          <div className="space-y-3">
            {mockNotifications.filter(n => !n.read).map(renderNotificationContent)}
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

export default Notifications;
