
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ThumbsUp, ThumbsDown, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PetRelationship } from '@/services/petMemoryService';
import { format } from 'date-fns';

interface PetRelationshipDetailProps {
  relationship: PetRelationship;
}

const PetRelationshipDetail: React.FC<PetRelationshipDetailProps> = ({ relationship }) => {
  const [expanded, setExpanded] = useState(false);

  const sentimentColor = relationship.sentiment > 0.3 ? "text-green-600" : 
                         relationship.sentiment < -0.3 ? "text-red-600" : 
                         "text-gray-600";
  
  const sentimentEmoji = relationship.sentiment > 0.5 ? "❤️" : 
                         relationship.sentiment > 0.2 ? "😊" :
                         relationship.sentiment < -0.5 ? "😠" :
                         relationship.sentiment < -0.2 ? "☹️" :
                         "😐";
  
  // Get up to 5 most recent interactions
  const recentInteractions = relationship.interactionHistory?.slice(-5).reverse() || [];
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {relationship.relatedPet?.profilePicture ? (
                <AvatarImage src={relationship.relatedPet.profilePicture} alt={relationship.relatedPet?.name || ''} />
              ) : (
                <AvatarFallback>{relationship.relatedPet?.name?.charAt(0) || '?'}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-base">{relationship.relatedPet?.name}</CardTitle>
              <CardDescription className="text-xs">{relationship.relatedPet?.breed} {relationship.relatedPet?.species}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={
              relationship.relationshipType === "friendly" ? "default" :
              relationship.relationshipType === "adverse" ? "destructive" : 
              "outline"
            }>
              {relationship.relationshipType}
            </Badge>
            <span className="text-lg" title={`Sentiment: ${relationship.sentiment.toFixed(2)}`}>
              {sentimentEmoji}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-sm">
              <Heart size={16} className={sentimentColor} />
              <span className="font-medium">Familiarity: {relationship.familiarity}/10</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Last interaction: {format(new Date(relationship.lastInteractionAt), 'MMM d')}
            </span>
          </div>
          
          {recentInteractions.length > 0 && (
            <div className="space-y-2">
              <button 
                className="flex items-center gap-1 text-sm text-muted-foreground"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span>{expanded ? "Hide" : "Show"} recent interactions</span>
              </button>
              
              {expanded && (
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                  {recentInteractions.map((interaction, idx) => (
                    <div key={idx} className="border-l-2 pl-2 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{interaction.interactionType}</span>
                        <span className="text-muted-foreground">{format(new Date(interaction.timestamp), 'MMM d, h:mm a')}</span>
                      </div>
                      <div className="flex gap-1 items-center">
                        {interaction.sentiment > 0 ? 
                          <ThumbsUp size={10} className="text-green-600" /> : 
                          interaction.sentiment < 0 ? 
                          <ThumbsDown size={10} className="text-red-600" /> : 
                          null
                        }
                        <span className="text-muted-foreground">{interaction.summary}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PetRelationshipDetail;
