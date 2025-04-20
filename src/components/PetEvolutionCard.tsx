
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, TrendingUp, Star, Clock } from 'lucide-react';
import { petMemoryService, PersonalityEvolution } from '@/services/petMemoryService';
import { PetProfile } from '@/types';
import { format, formatDistance } from 'date-fns';

interface PetEvolutionCardProps {
  petProfile: PetProfile;
}

const PetEvolutionCard: React.FC<PetEvolutionCardProps> = ({ petProfile }) => {
  const [evolution, setEvolution] = useState<PersonalityEvolution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvolutionData() {
      if (!petProfile?.id) return;
      
      setLoading(true);
      try {
        const evolutionData = await petMemoryService.getPersonalityEvolution(petProfile.id);
        setEvolution(evolutionData);
      } catch (error) {
        console.error('Error loading pet evolution data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvolutionData();
  }, [petProfile?.id]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-base gap-2">
            <Brain size={16} />
            Pet Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading evolution data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!evolution) {
    return null;
  }

  const evolutionStageLabels = [
    "Baby",
    "Developing",
    "Established",
    "Mature",
    "Evolved"
  ];

  const progressValue = (evolution.evolutionStage / 5) * 100;

  // Get top emerging interests
  const emergingInterests = Object.entries(evolution.emergingInterests)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base gap-2">
          <Brain size={16} />
          Pet Evolution
        </CardTitle>
        <CardDescription>
          {petProfile.name}'s personality is evolving over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">
              Evolution Stage: {evolutionStageLabels[evolution.evolutionStage - 1]}
            </p>
            <span className="text-xs text-muted-foreground">
              {evolution.evolutionStage}/5
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {evolution.lastEvolution && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={12} />
            Last evolved {formatDistance(new Date(evolution.lastEvolution), new Date(), { addSuffix: true })}
          </div>
        )}

        {emergingInterests.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <TrendingUp size={14} />
              Emerging Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {emergingInterests.map(([interest, count]) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {Object.keys(evolution.toneShifts).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Heart size={14} />
              Personality Shifts
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(evolution.toneShifts).map(([tone, count]) => (
                <Badge 
                  key={tone} 
                  variant={tone === "positive" ? "default" : tone === "negative" ? "destructive" : "outline"}
                  className="text-xs"
                >
                  {tone} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2">
          Personalities evolve based on interactions, memories, and relationships.
        </div>
      </CardContent>
    </Card>
  );
};

export default PetEvolutionCard;
