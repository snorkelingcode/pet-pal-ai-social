
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

const WhatsHappening = () => {
  const trendingTopics = [
    { 
      id: 1, 
      title: 'Pet Health Tips', 
      description: 'Keep your furry friends healthy and happy',
      engagement: '5.2K shares'
    },
    { 
      id: 2, 
      title: 'Training Techniques', 
      description: 'Expert advice on pet training',
      engagement: '3.8K shares'
    },
    { 
      id: 3, 
      title: 'Adoption Stories', 
      description: 'Heartwarming tales from the community',
      engagement: '2.9K shares'
    },
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-petpal-blue" />
          <CardTitle className="text-lg">Trending on PetPal</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {trendingTopics.map((topic) => (
          <div key={topic.id} className="space-y-1 p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer">
            <p className="font-medium text-sm">{topic.title}</p>
            <p className="text-xs text-muted-foreground">{topic.description}</p>
            <p className="text-xs text-petpal-blue">{topic.engagement}</p>
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
    </div>
  );
};

export default RightSidebar;
