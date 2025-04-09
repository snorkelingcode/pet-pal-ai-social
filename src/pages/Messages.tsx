
import React from 'react';
import Layout from '@/components/Layout';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send } from 'lucide-react';

const mockConversations = [
  {
    id: 1,
    name: "Buddy",
    avatar: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    lastMessage: "Woof! Can we go to the park today?",
    time: "2m ago",
    unread: true
  },
  {
    id: 2,
    name: "Whiskers",
    avatar: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    lastMessage: "Meow... Need treats now!",
    time: "1h ago",
    unread: false
  },
  {
    id: 3,
    name: "Rex",
    avatar: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    lastMessage: "Bark! I found a new toy!",
    time: "2h ago",
    unread: true
  },
  {
    id: 4,
    name: "Paws",
    avatar: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    lastMessage: "Purr... Just took a nice nap.",
    time: "1d ago",
    unread: false
  }
];

const Messages = () => {
  return (
    <Layout>
      <HeaderCard 
        title="Messages" 
        subtitle="Chat with your furry friends!"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-9" />
          </div>
          
          <div className="space-y-2">
            {mockConversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className={`cursor-pointer hover:bg-accent ${conversation.unread ? 'border-l-4 border-l-petpal-blue' : ''}`}
              >
                <CardContent className="flex items-center p-3">
                  <Avatar className="h-10 w-10">
                    <img src={conversation.avatar} alt={conversation.name} className="object-cover" />
                  </Avatar>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{conversation.name}</h3>
                      <span className="text-xs text-muted-foreground">{conversation.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2 flex flex-col h-[500px] border rounded-lg p-4">
          <div className="border-b pb-3 mb-3 flex items-center">
            <Avatar className="h-8 w-8">
              <img src={mockConversations[0].avatar} alt={mockConversations[0].name} className="object-cover" />
            </Avatar>
            <div className="ml-2">
              <h3 className="font-medium">{mockConversations[0].name}</h3>
              <p className="text-xs text-muted-foreground">Online now</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-3 overflow-auto mb-3">
            <div className="flex justify-end">
              <div className="bg-petpal-blue text-white rounded-lg px-3 py-2 max-w-[70%]">
                Hey Buddy, how are you today?
              </div>
            </div>
            
            <div className="flex">
              <Avatar className="h-7 w-7 mr-2">
                <img src={mockConversations[0].avatar} alt={mockConversations[0].name} className="object-cover" />
              </Avatar>
              <div className="bg-accent rounded-lg px-3 py-2 max-w-[70%]">
                Woof! Can we go to the park today?
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="bg-petpal-blue text-white rounded-lg px-3 py-2 max-w-[70%]">
                Sure! We can go this afternoon. Do you want to bring your favorite ball?
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Input 
              placeholder="Type a message..." 
              className="pr-10"
            />
            <Button 
              size="sm" 
              className="absolute right-1 top-1 bg-petpal-blue hover:bg-petpal-blue/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
