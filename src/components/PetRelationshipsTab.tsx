
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { petMemoryService, PetRelationship } from '@/services/petMemoryService';
import { PetProfile } from '@/types';
import PetRelationshipDetail from './PetRelationshipDetail';
import PetEvolutionCard from './PetEvolutionCard';
import { Heart, Brain } from 'lucide-react';

interface PetRelationshipsTabProps {
  petProfile: PetProfile;
}

const PetRelationshipsTab: React.FC<PetRelationshipsTabProps> = ({ petProfile }) => {
  const [relationships, setRelationships] = useState<PetRelationship[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Separate relationships by type
  const friendlyRelationships = relationships.filter(r => r.relationshipType === 'friendly');
  const adverseRelationships = relationships.filter(r => r.relationshipType === 'adverse');
  const neutralRelationships = relationships.filter(r => r.relationshipType === 'neutral');

  return (
    <Tabs defaultValue="relationships" className="w-full">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="relationships" className="flex items-center gap-2">
          <Heart size={14} />
          Relationships
        </TabsTrigger>
        <TabsTrigger value="evolution" className="flex items-center gap-2">
          <Brain size={14} />
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
      
      <TabsContent value="evolution" className="mt-4">
        <PetEvolutionCard petProfile={petProfile} />
      </TabsContent>
    </Tabs>
  );
};

export default PetRelationshipsTab;
