
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { petMemoryService, PetRelationship, PersonalityEvolution } from '@/services/petMemoryService';
import { PetProfile } from '@/types';
import PetRelationshipDetail from './PetRelationshipDetail';
import PetEvolutionCard from './PetEvolutionCard';
import { Heart, Brain, Clock, Star } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PetRelationshipsTabProps {
  petProfile: PetProfile;
}

interface PetMemory {
  id: string;
  content: string;
  memoryType: string;
  importance: number;
  createdAt: string;
  lastAccessedAt?: string;
  accessCount?: number;
  sentiment?: number;
}

const PetRelationshipsTab: React.FC<PetRelationshipsTabProps> = ({ petProfile }) => {
  const [relationships, setRelationships] = useState<PetRelationship[]>([]);
  const [memories, setMemories] = useState<PetMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("relationships");

  useEffect(() => {
    async function fetchRelationships() {
      if (!petProfile?.id) return;
      
      setLoading(true);
      try {
        const petRelationships = await petMemoryService.getPetRelationships(petProfile.id);
        setRelationships(petRelationships);
      } catch (error) {
        console.error('Error loading pet relationships:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRelationships();
  }, [petProfile?.id]);

  useEffect(() => {
    async function fetchMemories() {
      if (!petProfile?.id) return;
      
      setMemoryLoading(true);
      try {
        const petMemories = await petMemoryService.getAllMemories(petProfile.id);
        
        // Sort by importance (descending)
        const sortedMemories = [...petMemories].sort((a, b) => b.importance - a.importance);
        setMemories(sortedMemories);
      } catch (error) {
        console.error('Error loading pet memories:', error);
      } finally {
        setMemoryLoading(false);
      }
    }
    
    if (activeTab === "memories") {
      fetchMemories();
    }
  }, [petProfile?.id, activeTab]);

  // Separate relationships by type
  const friendlyRelationships = relationships.filter(r => r.relationshipType === 'friendly');
  const adverseRelationships = relationships.filter(r => r.relationshipType === 'adverse');
  const neutralRelationships = relationships.filter(r => r.relationshipType === 'neutral');

  // Get recency score for memory display
  const getRecencyScore = (lastAccessedAt: string, createdAt: string) => {
    const now = new Date();
    const lastAccessed = new Date(lastAccessedAt || createdAt);
    const daysDifference = Math.floor((now.getTime() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24));
    
    // Return a score from 0-100 where 100 is very recent
    return Math.max(0, 100 - Math.min(100, daysDifference));
  };

  // Format date in a friendly way
  const formatDate = (date: string) => {
    const memoryDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - memoryDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months ago`;
    } else {
      return `${Math.floor(diffDays / 365)} years ago`;
    }
  };

  // Get emotion badge for memory
  const getEmotionBadge = (sentiment?: number) => {
    if (sentiment === undefined) return null;
    
    if (sentiment > 0.5) {
      return <Badge className="bg-green-500">Positive</Badge>;
    } else if (sentiment < -0.5) {
      return <Badge className="bg-red-500">Negative</Badge>;
    } else {
      return <Badge className="bg-gray-500">Neutral</Badge>;
    }
  };

  return (
    <Tabs defaultValue="relationships" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="relationships" className="flex items-center gap-2">
          <Heart size={14} />
          Relationships
        </TabsTrigger>
        <TabsTrigger value="memories" className="flex items-center gap-2">
          <Brain size={14} />
          Memories
        </TabsTrigger>
        <TabsTrigger value="evolution" className="flex items-center gap-2">
          <Star size={14} />
          Evolution
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="relationships" className="mt-4 space-y-4">
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading relationships...</p>
          </div>
        ) : relationships.length === 0 ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {petProfile.name} hasn't interacted with other pets yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {friendlyRelationships.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Friends</h3>
                <div className="space-y-3">
                  {friendlyRelationships.map(relationship => (
                    <PetRelationshipDetail 
                      key={relationship.id}
                      relationship={relationship}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {neutralRelationships.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Acquaintances</h3>
                <div className="space-y-3">
                  {neutralRelationships.map(relationship => (
                    <PetRelationshipDetail 
                      key={relationship.id}
                      relationship={relationship}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {adverseRelationships.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Rivals</h3>
                <div className="space-y-3">
                  {adverseRelationships.map(relationship => (
                    <PetRelationshipDetail 
                      key={relationship.id}
                      relationship={relationship}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="memories" className="mt-4 space-y-4">
        {memoryLoading ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading memories...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {petProfile.name} doesn't have any memories stored yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memories.slice(0, 10).map(memory => (
                <Card key={memory.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {memory.memoryType === 'post' ? 'Posted' : 
                         memory.memoryType === 'message' ? 'Messaged' : 
                         memory.memoryType === 'comment' ? 'Commented' : 
                         'Memory'}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {formatDate(memory.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-1">
                      {getEmotionBadge(memory.sentiment)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2">
                    <p className="text-sm">{memory.content}</p>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                          <Star size={12} />
                          <span>Importance</span>
                        </div>
                        <span className="text-xs font-medium">{memory.importance}/10</span>
                      </div>
                      <Progress value={memory.importance * 10} className="h-1" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                          <Clock size={12} />
                          <span>Recency</span>
                        </div>
                        <span className="text-xs font-medium">
                          {memory.accessCount ? `Accessed ${memory.accessCount} times` : 'New'}
                        </span>
                      </div>
                      <Progress 
                        value={getRecencyScore(memory.lastAccessedAt || '', memory.createdAt)} 
                        className="h-1" 
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {memories.length > 10 && (
              <p className="text-center text-sm text-muted-foreground">
                Showing the 10 most important memories out of {memories.length} total
              </p>
            )}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="evolution" className="mt-4">
        <PetEvolutionCard petProfile={petProfile} />
      </TabsContent>
    </Tabs>
  );
};

export default PetRelationshipsTab;
