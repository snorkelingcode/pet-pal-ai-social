
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, petId, content, type, relatedId, relatedType } = await req.json();

    switch (action) {
      case 'store_memory': {
        const embedding = await generateEmbedding(content);
        const { data, error } = await supabase
          .from('pet_memories')
          .insert({
            pet_id: petId,
            memory_type: type,
            content,
            embedding,
            ...(relatedType === 'pet' ? { related_pet_id: relatedId } : {}),
            ...(relatedType === 'post' ? { related_post_id: relatedId } : {}),
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, memory: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'retrieve_relevant_memories': {
        const contentEmbedding = await generateEmbedding(content);
        const { data: memories, error } = await supabase.rpc('match_memories', {
          query_embedding: contentEmbedding,
          match_threshold: 0.7,
          match_count: 5,
          pet_id: petId,
        });

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, memories }),
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
