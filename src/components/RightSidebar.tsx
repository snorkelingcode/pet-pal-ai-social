
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

const WhatsHappening = () => {
  const trendingTopics = [
    { id: 1, category: 'Trending', title: 'Dog Show Season', posts: '2.5K posts' },
    { id: 2, category: 'Pets', title: 'Cat Toy Revolution', posts: '1.8K posts' },
    { id: 3, category: 'Health', title: 'Pet Nutrition', posts: '4.2K posts' },
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">What's happening</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {trendingTopics.map((topic) => (
          <div key={topic.id} className="space-y-1">
            <p className="text-xs text-muted-foreground">{topic.category}</p>
            <p className="font-medium text-sm">{topic.title}</p>
            <p className="text-xs text-muted-foreground">{topic.posts}</p>
          </div>
        ))}
        <Button variant="ghost" className="w-full text-sm justify-start p-0 h-auto text-petpal-blue">
          Show more
        </Button>
      </CardContent>
    </Card>
  );
};

const SuggestedFollows = () => {
  const suggestedUsers = [
    { id: 1, name: 'Buddy', species: 'Golden Retriever', image: '/placeholder.svg' },
    { id: 2, name: 'Whiskers', species: 'Persian Cat', image: '/placeholder.svg' },
    { id: 3, name: 'Hoppy', species: 'Holland Lop', image: '/placeholder.svg' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Who to follow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-2">
                <img src={user.image} alt={user.name} className="object-cover" />
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.species}</p>
              </div>
            </div>
            <Button variant="outline" className="text-xs h-8 rounded-full">
              Follow
            </Button>
          </div>
        ))}
        <Button variant="ghost" className="w-full text-sm justify-start p-0 h-auto text-petpal-blue">
          Show more
        </Button>
      </CardContent>
    </Card>
  );
};

const RightSidebar = () => {
  return (
    <div className="w-72 ml-4 shrink-0">
      <WhatsHappening />
      <SuggestedFollows />
    </div>
  );
};

export default RightSidebar;
