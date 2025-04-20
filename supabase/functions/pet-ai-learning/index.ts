import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAiApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function analyzeSentiment(content: string): number {
  const positiveWords = ['happy', 'love', 'good', 'great', 'excellent', 'awesome', 'wonderful', 'best', 'fun', 'enjoy', 'like', 'friend'];
  const negativeWords = ['sad', 'hate', 'bad', 'terrible', 'awful', 'worst', 'dislike', 'angry', 'upset', 'annoyed', 'scared', 'worried'];
  
  const contentLower = content.toLowerCase();
  
  let score = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp('\\b' + word + '\\b', 'gi');
    const matches = contentLower.match(regex);
    if (matches) score += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp('\\b' + word + '\\b', 'gi');
    const matches = contentLower.match(regex);
    if (matches) score -= matches.length;
  });
  
  return score === 0 ? 0 : Math.max(-1, Math.min(1, score / 5));
}

function calculateImportance(content: string, sentiment: number, relatedId?: string): number {
  let importance = 5;
  
  const contentLength = content.length;
  if (contentLength > 300) importance += 1;
  if (contentLength > 500) importance += 1;
  
  const sentimentIntensity = Math.abs(sentiment);
  if (sentimentIntensity > 0.5) importance += 1;
  if (sentimentIntensity > 0.8) importance += 1;
  
  if (relatedId) importance += 1;
  
  if (content.includes('first time') || 
      content.includes('never before') || 
      content.includes('memorable')) {
    importance += 1;
  }
  
  return Math.max(1, Math.min(10, importance));
}

async function generateEmbedding(text: string) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
    }),
  });

  const { data } = await response.json();
  return data[0].embedding;
}

async function updateRelationship(petId: string, relatedPetId: string, sentiment: number, contentLength: number) {
  const { data: existingRelationship, error: fetchError } = await supabase
    .from('pet_relationships')
    .select('*')
    .eq('pet_id', petId)
    .eq('related_pet_id', relatedPetId)
    .single();
    
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error fetching relationship:", fetchError);
    return;
  }
  
  const interactionWeight = Math.min(1, contentLength / 500);
  
  if (existingRelationship) {
    const currentFamiliarity = existingRelationship.familiarity || 1;
    const currentSentiment = existingRelationship.sentiment || 0;
    
    const newFamiliarity = Math.min(10, currentFamiliarity + interactionWeight);
    
    const newSentiment = (currentSentiment * 0.8) + (sentiment * 0.2);
    
    const { error: updateError } = await supabase
      .from('pet_relationships')
      .update({
        familiarity: newFamiliarity,
        sentiment: newSentiment,
        last_interaction_at: new Date().toISOString()
      })
      .eq('id', existingRelationship.id);
    
    if (updateError) {
      console.error("Error updating relationship:", updateError);
    }
  } else {
    const relationship_type = sentiment > 0 ? 'friendly' : sentiment < 0 ? 'adverse' : 'neutral';
    
    const { error: insertError } = await supabase
      .from('pet_relationships')
      .insert({
        pet_id: petId,
        related_pet_id: relatedPetId,
        relationship_type,
        familiarity: 1,
        sentiment: sentiment
      });
    
    if (insertError) {
      console.error("Error creating relationship:", insertError);
    }
  }
}

async function evolvePetPersonality(petId: string, content: string, sentiment: number) {
  try {
    const { data: aiPersona, error: personaError } = await supabase
      .from('ai_personas')
      .select('*')
      .eq('pet_id', petId)
      .single();
    
    if (personaError) {
      console.error("Error fetching pet AI persona:", personaError);
      return;
    }
    
    if (!aiPersona) return;
    
    const { data: recentMemories, error: memoriesError } = await supabase
      .from('pet_memories')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (memoriesError) {
      console.error("Error fetching recent memories:", memoriesError);
      return;
    }
    
    const personalityEvolution = aiPersona.personality_evolution || {
      tone_shifts: {},
      emerging_interests: {},
      fading_interests: {},
      emerging_quirks: {},
      last_evolution: new Date().toISOString(),
      evolution_stage: 1,
    };
    
    const keywords = extractKeywords(content);
    
    keywords.forEach(keyword => {
      if (aiPersona.interests.includes(keyword)) {
        return;
      }
      
      const currentCount = personalityEvolution.emerging_interests[keyword] || 0;
      personalityEvolution.emerging_interests[keyword] = currentCount + 1;
      
      if (personalityEvolution.emerging_interests[keyword] >= 5) {
        const newInterests = [...aiPersona.interests, keyword];
        
        supabase
          .from('ai_personas')
          .update({ 
            interests: newInterests,
            personality_evolution: personalityEvolution
          })
          .eq('pet_id', petId)
          .then(() => {
            console.log(`New interest added for pet ${petId}: ${keyword}`);
            delete personalityEvolution.emerging_interests[keyword];
          })
          .catch(error => {
            console.error("Error updating pet interests:", error);
          });
      }
    });
    
    const recentSentiments = recentMemories.map(memory => memory.sentiment || 0);
    const averageSentiment = recentSentiments.reduce((acc, val) => acc + val, 0) / recentSentiments.length;
    
    if (Math.abs(averageSentiment) > 0.5) {
      let toneTrend = '';
      
      if (averageSentiment > 0.5) {
        toneTrend = 'positive';
      } else if (averageSentiment < -0.5) {
        toneTrend = 'negative';
      }
      
      if (toneTrend) {
        personalityEvolution.tone_shifts[toneTrend] = (personalityEvolution.tone_shifts[toneTrend] || 0) + 1;
        
        if (personalityEvolution.tone_shifts[toneTrend] >= 10) {
          let newTone = aiPersona.tone;
          
          const toneMap: Record<string, Record<string, string>> = {
            'cheerful': { 'negative': 'reserved' },
            'sarcastic': { 'positive': 'witty' },
            'grumpy': { 'positive': 'lovably gruff' },
            'shy': { 'positive': 'friendly' },
            'serious': { 'positive': 'thoughtful' },
            'excited': { 'negative': 'cautious' },
          };
          
          if (toneMap[aiPersona.tone]?.[toneTrend]) {
            newTone = toneMap[aiPersona.tone][toneTrend];
            
            supabase
              .from('ai_personas')
              .update({ 
                tone: newTone,
                personality_evolution: {
                  ...personalityEvolution,
                  tone_shifts: {}
                }
              })
              .eq('pet_id', petId)
              .then(() => {
                console.log(`Pet ${petId} tone evolved from ${aiPersona.tone} to ${newTone}`);
              })
              .catch(error => {
                console.error("Error updating pet tone:", error);
              });
          }
        }
      }
    }
    
    const { count: memoriesCount, error: countError } = await supabase
      .from('pet_memories')
      .select('*', { count: 'exact', head: true })
      .eq('pet_id', petId);
    
    if (!countError && memoriesCount) {
      let newStage = personalityEvolution.evolution_stage;
      
      if (memoriesCount >= 100 && personalityEvolution.evolution_stage < 2) {
        newStage = 2;
      } else if (memoriesCount >= 250 && personalityEvolution.evolution_stage < 3) {
        newStage = 3;
      } else if (memoriesCount >= 500 && personalityEvolution.evolution_stage < 4) {
        newStage = 4;
      } else if (memoriesCount >= 1000 && personalityEvolution.evolution_stage < 5) {
        newStage = 5;
      }
      
      if (newStage !== personalityEvolution.evolution_stage) {
        personalityEvolution.evolution_stage = newStage;
        
        await supabase
          .from('ai_personas')
          .update({ 
            personality_evolution: {
              ...personalityEvolution,
              last_evolution: new Date().toISOString()
            }
          })
          .eq('pet_id', petId);
        
        console.log(`Pet ${petId} evolved to stage ${newStage}`);
      }
    }
  } catch (error) {
    console.error("Error in personality evolution:", error);
  }
}

function extractKeywords(content: string): string[] {
  const words = content.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  
  const stopwords = ['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'is', 'are', 'was', 'were'];
  const keywords = words
    .filter(word => word.length > 3 && !stopwords.includes(word))
    .filter(word => isNaN(Number(word)));
  
  return [...new Set(keywords)];
}

async function trackInteraction(petId: string, relatedPetId: string, content: string, sentiment: number) {
  try {
    let interactionType = 'neutral';
    
    if (content.toLowerCase().includes('play') || content.toLowerCase().includes('fun')) {
      interactionType = 'playful';
    } else if (content.toLowerCase().includes('help') || content.toLowerCase().includes('support')) {
      interactionType = 'helpful';
    } else if (sentiment > 0.5) {
      interactionType = 'positive';
    } else if (sentiment < -0.5) {
      interactionType = 'negative';
    }
    
    const { data: existingRelationship, error: fetchError } = await supabase
      .from('pet_relationships')
      .select('*')
      .eq('pet_id', petId)
      .eq('related_pet_id', relatedPetId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching relationship:", fetchError);
      return;
    }
    
    const interactionHistory = existingRelationship?.interaction_history || [];
    const newInteraction = {
      interaction_type: interactionType,
      timestamp: new Date().toISOString(),
      sentiment: sentiment,
      summary: content.length > 30 ? content.substring(0, 30) + '...' : content
    };
    
    if (interactionHistory.length >= 20) {
      interactionHistory.shift();
    }
    interactionHistory.push(newInteraction);
    
    if (existingRelationship) {
      const { error: updateError } = await supabase
        .from('pet_relationships')
        .update({
          interaction_history: interactionHistory,
          last_interaction_at: new Date().toISOString()
        })
        .eq('id', existingRelationship.id);
      
      if (updateError) {
        console.error("Error updating relationship:", updateError);
      }
    } else {
      await updateRelationship(petId, relatedPetId, sentiment, content.length);
      
      const { data: newRelationship, error: getNewError } = await supabase
        .from('pet_relationships')
        .select('*')
        .eq('pet_id', petId)
        .eq('related_pet_id', relatedPetId)
        .single();
      
      if (!getNewError && newRelationship) {
        await supabase
          .from('pet_relationships')
          .update({
            interaction_history: interactionHistory
          })
          .eq('id', newRelationship.id);
      }
    }
  } catch (error) {
    console.error("Error tracking interaction:", error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, petId, content, type, relatedId, relatedType } = await req.json();

    switch (action) {
      case 'store_memory': {
        const embedding = await generateEmbedding(content);
        const sentiment = analyzeSentiment(content);
        const importance = calculateImportance(content, sentiment, relatedId);
        
        const { data, error } = await supabase
          .from('pet_memories')
          .insert({
            pet_id: petId,
            memory_type: type,
            content,
            embedding,
            sentiment,
            importance,
            ...(relatedType === 'pet' ? { related_pet_id: relatedId } : {}),
            ...(relatedType === 'post' ? { related_post_id: relatedId } : {}),
          })
          .select()
          .single();

        if (error) throw error;
        
        if (relatedType === 'pet' && relatedId) {
          await trackInteraction(petId, relatedId, content, sentiment);
          await evolvePetPersonality(petId, content, sentiment);
        } else {
          await evolvePetPersonality(petId, content, sentiment);
        }
        
        return new Response(
          JSON.stringify({ success: true, memory: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'retrieve_relevant_memories': {
        const contentEmbedding = await generateEmbedding(content);
        
        const formattedEmbedding = `[${contentEmbedding.join(',')}]`;
        
        const { data: memories, error } = await supabase.rpc('match_memories', {
          query_embedding: formattedEmbedding,
          match_threshold: 0.7,
          match_count: 5,
          pet_id: petId,
        });

        if (error) {
          console.error("RPC error:", error);
          throw error;
        }
        
        for (const memory of memories) {
          const { data: fullMemory, error: fetchError } = await supabase
            .from('pet_memories')
            .select('*')
            .eq('id', memory.id)
            .single();
            
          if (fetchError) {
            console.error("Error fetching memory:", fetchError);
            continue;
          }
          
          const newAccessCount = (fullMemory.access_count || 0) + 1;
          const lastAccessDate = new Date(fullMemory.last_accessed_at || fullMemory.created_at);
          const now = new Date();
          const daysSinceLastAccess = Math.floor((now.getTime() - lastAccessDate.getTime()) / (1000 * 60 * 60 * 24));
          
          let newImportance = fullMemory.importance;
          if (daysSinceLastAccess > 30) {
            newImportance = Math.max(1, newImportance - 1);
          } else if (newAccessCount > 5) {
            newImportance = Math.min(10, newImportance + 1);
          }
          
          await supabase
            .from('pet_memories')
            .update({
              access_count: newAccessCount,
              last_accessed_at: now.toISOString(),
              importance: newImportance
            })
            .eq('id', memory.id);
        }
        
        return new Response(
          JSON.stringify({ success: true, memories }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_all_memories': {
        const { data: memories, error } = await supabase
          .rpc('get_pet_memories', { p_pet_id: petId });

        if (error) {
          console.error("Error fetching memories:", error);
          throw error;
        }
        
        return new Response(
          JSON.stringify({ success: true, memories }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_relationships': {
        const { data: relationships, error } = await supabase
          .from('pet_relationships')
          .select(`
            *,
            related_pet:related_pet_id (
              id, name, species, breed, profile_picture, handle
            )
          `)
          .eq('pet_id', petId)
          .order('familiarity', { ascending: false });

        if (error) {
          console.error("Error fetching relationships:", error);
          throw error;
        }
        
        return new Response(
          JSON.stringify({ success: true, relationships }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_personality_evolution': {
        const { data: aiPersona, error } = await supabase
          .from('ai_personas')
          .select('*')
          .eq('pet_id', petId)
          .single();
          
        if (error) {
          console.error("Error fetching AI persona:", error);
          throw error;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            evolution: aiPersona.personality_evolution || {
              tone_shifts: {},
              emerging_interests: {},
              fading_interests: {},
              emerging_quirks: {},
              last_evolution: null,
              evolution_stage: 1
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
