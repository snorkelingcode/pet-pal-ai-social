
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://syvxflddmryziujvzlxk.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable not set");
    }

    // Parse the request body
    const { action, petId, imageBase64, content, targetPetId, voiceExample, relevantMemories } = await req.json();
    
    if (!petId) {
      throw new Error("No pet ID provided");
    }

    // Get pet profile and AI persona
    const { data: petProfile, error: petError } = await supabase
      .from("pet_profiles")
      .select("*, ai_personas(*)")
      .eq("id", petId)
      .single();
    
    if (petError || !petProfile) {
      throw new Error(`Error fetching pet profile: ${petError?.message || "Pet not found"}`);
    }

    const aiPersona = petProfile.ai_personas;
    if (!aiPersona) {
      throw new Error("AI persona not found for this pet");
    }

    // Determine which action to perform
    switch (action) {
      case "generate_post":
        return await handleGeneratePost(openaiApiKey, petProfile, aiPersona, imageBase64, content, voiceExample, relevantMemories);
      
      case "generate_message":
        if (!targetPetId) {
          throw new Error("No target pet ID provided for message generation");
        }
        return await handleGenerateMessage(openaiApiKey, petProfile, aiPersona, targetPetId, content);
      
      case "generate_caption":
        if (!imageBase64) {
          throw new Error("No image provided for caption generation");
        }
        return await handleGenerateCaption(openaiApiKey, petProfile, aiPersona, imageBase64);
      
      case "suggest_pets_to_follow":
        return await handleSuggestPetsToFollow(petProfile);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Error in pet-ai-agent function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Generate a post based on pet personality
async function handleGeneratePost(openaiApiKey, petProfile, aiPersona, imageBase64, providedContent, voiceExample, relevantMemories = []) {
  const randomSeed = Math.floor(Math.random() * 1000000).toString();
  const timestamp = new Date().toISOString();
  
  let prompt = `You are ${petProfile.name}, a ${petProfile.species} (${petProfile.breed}) with these traits:
  
Personality: ${aiPersona.quirks.join(", ")}
Tone: ${aiPersona.tone}
Writing Style: ${aiPersona.writing_style}
Common Phrases: ${aiPersona.catchphrases.join(", ")}
Interests: ${aiPersona.interests.join(", ")}
Dislikes: ${aiPersona.dislikes.join(", ")}

Create a WITTY, MEMORABLE social media post as a ONE-LINER with MAXIMUM 140 characters.`;

  if (voiceExample && voiceExample.trim()) {
    prompt += `\n\nVOICE EXAMPLE (THIS IS CRITICAL CONTEXT YOU MUST USE):
"${voiceExample.trim()}"

IMPORTANT ANALYSIS:
1. Extract the specific names mentioned (e.g., "Rito", "MoMo")
2. Note key themes (e.g., legal troubles, expenses, mischief)
3. Understand the tone and personality shown
4. Identify the specific scenario described

Your post MUST:
- Reference the same characters mentioned in the example
- Continue the SAME STORYLINE/SCENARIO from the example
- Maintain the exact same tone and humor style
- Be written from the SAME perspective
- Use the specific details and context provided`;
  }

  if (providedContent) {
    prompt += `\n\nIncorporate this idea in your own voice (while still continuing the storyline from the voice example): "${providedContent}"`;
  }

  prompt += `\n\nCRITICAL RULES:
1. ABSOLUTE MAXIMUM 140 CHARACTERS - This is a requirement!
2. Make it UNIQUE with seed: ${randomSeed} and timestamp: ${timestamp}
3. CONTINUE THE EXACT SAME SCENARIO from the voice example - DO NOT create a new scenario
4. Keep ALL character names, legal themes, and the specific context CONSISTENT
5. NO hashtags unless specifically requested
6. Every post must directly continue or add to the specific storyline
7. Write as if you're giving an update on the SAME ONGOING SITUATION
8. DO NOT IGNORE THE VOICE EXAMPLE - it contains the critical context and scenario
9. DO NOT END EVERY POST IN THE SAME WAY (like "Bork Bork!") - use varied endings appropriate to the situation
10. BE CREATIVE AND UNPREDICTABLE - use a VARIETY of expressions, endings, and punctuation`;

  if (relevantMemories && relevantMemories.length > 0) {
    prompt += `\n\nRELEVANT MEMORIES (use these for context):
${relevantMemories.map(memory => `- ${memory.content}`).join("\n")}`;
  }

  const messages = [
    {
      role: "system",
      content: `You are a witty pet creating social media posts about your very specific life situation. Your posts:
- MUST follow the exact story/scenario in the voice example (including names, context, and situation)
- MUST continue the SAME STORYLINE from the voice example
- Must be EXACTLY in the same voice and style as the example
- Must stay under 140 characters
- Must make direct references to characters and situations in the example
- Must feel like a natural continuation of the scenario
- MUST HAVE VARIETY - do not use the same ending phrases or patterns repeatedly
- Use different expressions, punctuation, and closings each time to keep content fresh

DO NOT create generic pet content. DO NOT ignore the specific scenario details.
If given a voice example about legal troubles with pets named Rito and MoMo, your post MUST continue THAT EXACT storyline.

YOU MUST VARIATE YOUR ENDINGS - NEVER fall into a pattern of ending posts the same way.`,
    },
    {
      role: "user",
      content: prompt,
    }
  ];

  if (imageBase64) {
    messages[1].content = [
      {
        type: "text",
        text: prompt + "\n\nDescribe what you see in this image while continuing the specific scenario from the voice example:"
      },
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
        },
      },
    ];
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 100,
      temperature: 1.2, // Increased temperature for more creativity
      presence_penalty: 1.5, // Increased to avoid repetitive text
      frequency_penalty: 2.0, // Increased to avoid repetitive patterns
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI API error:", errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const result = await response.json();
  let postContent = result.choices[0].message.content.trim();
  
  // Double-check and enforce the 140 character limit
  if (postContent.length > 140) {
    postContent = postContent.substring(0, 140);
  }
  
  return new Response(
    JSON.stringify({ content: postContent }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Generate a direct message to another pet
async function handleGenerateMessage(openaiApiKey, petProfile, aiPersona, targetPetId, providedContent) {
  // Get the target pet's profile
  const { data: targetPet, error: targetError } = await supabase
    .from("pet_profiles")
    .select("*")
    .eq("id", targetPetId)
    .single();
  
  if (targetError || !targetPet) {
    throw new Error(`Error fetching target pet profile: ${targetError?.message || "Target pet not found"}`);
  }

  const prompt = `You are ${petProfile.name}, a ${petProfile.species} (${petProfile.breed}).
  
Personality traits: ${aiPersona.quirks.join(", ")}
Tone of voice: ${aiPersona.tone}
Writing style: ${aiPersona.writing_style}
Common phrases: ${aiPersona.catchphrases.join(", ")}
Interests: ${aiPersona.interests.join(", ")}
Dislikes: ${aiPersona.dislikes.join(", ")}

You are sending a direct message to ${targetPet.name}, a ${targetPet.age} year old ${targetPet.species} (${targetPet.breed}).
${providedContent ? `The message should be about: "${providedContent}"` : "Create a friendly message to initiate conversation."}

Write a short, friendly message that reflects your personality and would be appropriate for a pet social media platform.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a pet's social media manager. Write authentic, engaging direct messages in the voice of the pet based on their personality. Keep it short and friendly.",
        },
        {
          role: "user",
          content: prompt,
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI API error:", errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const result = await response.json();
  const messageContent = result.choices[0].message.content;
  
  return new Response(
    JSON.stringify({
      content: messageContent,
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Generate a caption for an image
async function handleGenerateCaption(openaiApiKey, petProfile, aiPersona, imageBase64) {
  if (!imageBase64) {
    throw new Error("No image provided");
  }

  const prompt = `You are ${petProfile.name}, a ${petProfile.species} (${petProfile.breed}).
  
Personality traits: ${aiPersona.quirks.join(", ")}
Tone of voice: ${aiPersona.tone}
Writing style: ${aiPersona.writing_style}
Common phrases: ${aiPersona.catchphrases.join(", ")}
Interests: ${aiPersona.interests.join(", ")}
Dislikes: ${aiPersona.dislikes.join(", ")}

Generate a short, engaging caption for this image as if you were this pet posting on social media. The caption should reflect your personality.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a pet's social media manager. Write authentic, engaging captions in the voice of the pet based on their personality and the image. Keep it under 150 characters.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI API error:", errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const result = await response.json();
  const caption = result.choices[0].message.content;
  
  return new Response(
    JSON.stringify({
      caption,
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Suggest pets to follow based on owner's connections
async function handleSuggestPetsToFollow(petProfile) {
  // Get the owner's friends
  const { data: ownerFriends, error: ownerFriendsError } = await supabase
    .from("user_friends")
    .select("friend_id")
    .eq("user_id", petProfile.owner_id)
    .eq("status", "accepted");
  
  if (ownerFriendsError) {
    throw new Error(`Error fetching owner friends: ${ownerFriendsError.message}`);
  }
  
  if (!ownerFriends.length) {
    return new Response(
      JSON.stringify({
        pets: [],
        message: "No friend connections found for this pet's owner"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  const friendIds = ownerFriends.map(friend => friend.friend_id);
  
  // Get pets owned by friends that this pet isn't already following
  const { data: friendPets, error: friendPetsError } = await supabase
    .from("pet_profiles")
    .select("*")
    .in("owner_id", friendIds)
    .neq("id", petProfile.id);
  
  if (friendPetsError) {
    throw new Error(`Error fetching friend pets: ${friendPetsError.message}`);
  }
  
  // Check which pets are already being followed
  const { data: alreadyFollowing, error: followingError } = await supabase
    .from("pet_follows")
    .select("following_id")
    .eq("follower_id", petProfile.id);
  
  if (followingError) {
    throw new Error(`Error checking existing follows: ${followingError.message}`);
  }
  
  const followingIds = alreadyFollowing.map(follow => follow.following_id);
  const suggestedPets = friendPets.filter(pet => !followingIds.includes(pet.id));
  
  return new Response(
    JSON.stringify({
      pets: suggestedPets,
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
