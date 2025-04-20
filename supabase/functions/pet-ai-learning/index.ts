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
  
  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp('\\b' + word + '\\b', 'gi');
    const matches = contentLower.match(regex);
    if (matches) score += matches.length;
  });
  
  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp('\\b' + word + '\\b', 'gi');
    const matches = contentLower.match(regex);
    if (matches) score -= matches.length;
  });
  
  // Normalize to range between -1 (very negative) to 1 (very positive)
  return score === 0 ? 0 : Math.max(-1, Math.min(1, score / 5));
}

function calculateImportance(content: string, sentiment: number, relatedId?: string): number {
  let importance = 5; // Default midpoint importance (range 1-10)
  
  // Factor 1: Length of memory - longer memories might be more detailed and important
  const contentLength = content.length;
  if (contentLength > 300) importance += 1;
  if (contentLength > 500) importance += 1;
  
  // Factor 2: Sentiment intensity - strong emotions (positive or negative) are more memorable
  const sentimentIntensity = Math.abs(sentiment);
  if (sentimentIntensity > 0.5) importance += 1;
  if (sentimentIntensity > 0.8) importance += 1;
  
  // Factor 3: Related entities - memories connected to other pets/posts might be more important
  if (relatedId) importance += 1;
  
  // Factor 4: Novelty - look for special indicators in the content
  if (content.includes('first time') || 
      content.includes('never before') || 
      content.includes('memorable')) {
    importance += 1;
  }
  
  // Ensure importance stays within 1-10 range
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
  // Check if relationship exists
  const { data: existingRelationship, error: fetchError } = await supabase
    .from('pet_relationships')
    .select('*')
    .eq('pet_id', petId)
    .eq('related_pet_id', relatedPetId)
    .single();
    
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error("Error fetching relationship:", fetchError);
    return;
  }
  
  const interactionWeight = Math.min(1, contentLength / 500); // Normalize content length to max weight of 1
  
  if (existingRelationship) {
    // Update existing relationship
    const currentFamiliarity = existingRelationship.familiarity || 1;
    const currentSentiment = existingRelationship.sentiment || 0;
    
    // Increase familiarity with each interaction (max 10)
    const newFamiliarity = Math.min(10, currentFamiliarity + interactionWeight);
    
    // Blend new sentiment with existing (giving more weight to history)
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
    // Create new relationship
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
        
        // If this memory relates to another pet, update the relationship
        if (relatedType === 'pet' && relatedId) {
          await updateRelationship(petId, relatedId, sentiment, content.length);
        }
        
        return new Response(
          JSON.stringify({ success: true, memory: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'retrieve_relevant_memories': {
        const contentEmbedding = await generateEmbedding(content);
        
        // Correctly format the embedding as a vector
        const formattedEmbedding = `[${contentEmbedding.join(',')}]`;
        
        // Use rpc to call the match_memories function with properly formatted parameters
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
        
        // Apply memory decay - memories that haven't been accessed decrease in importance gradually
        for (const memory of memories) {
          // Get the full memory record to update it
          const { data: fullMemory, error: fetchError } = await supabase
            .from('pet_memories')
            .select('*')
            .eq('id', memory.id)
            .single();
            
          if (fetchError) {
            console.error("Error fetching memory:", fetchError);
            continue;
          }
          
          // Update memory access stats
          const newAccessCount = (fullMemory.access_count || 0) + 1;
          const lastAccessDate = new Date(fullMemory.last_accessed_at || fullMemory.created_at);
          const now = new Date();
          const daysSinceLastAccess = Math.floor((now.getTime() - lastAccessDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Memories accessed frequently maintain importance
          // Memories not accessed for a long time gradually decay in importance
          let newImportance = fullMemory.importance;
          if (daysSinceLastAccess > 30) {
            // Decay importance for memories not accessed in over a month
            newImportance = Math.max(1, newImportance - 1);
          } else if (newAccessCount > 5) {
            // Boost importance for frequently accessed memories
            newImportance = Math.min(10, newImportance + 1);
          }
          
          // Update the memory with new stats
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
          .rpc('get_pet_memories', { p_pet_id: petId })
          .select('*');

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
