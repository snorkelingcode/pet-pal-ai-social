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
    const { action, petId, imageBase64, content, targetPetId, voiceExample } = await req.json();
    
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
        return await handleGeneratePost(openaiApiKey, petProfile, aiPersona, imageBase64, content, voiceExample);
      
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
async function handleGeneratePost(openaiApiKey, petProfile, aiPersona, imageBase64, providedContent, voiceExample) {
  const randomSeed = Math.floor(Math.random() * 1000000).toString();
  const timestamp = new Date().toISOString();
  
  let prompt = `You are ${petProfile.name}, a ${petProfile.species} (${petProfile.breed}) with these traits:
  
Personality: ${aiPersona.quirks.join(", ")}
Tone: ${aiPersona.tone}
Writing Style: ${aiPersona.writing_style}
Common Phrases: ${aiPersona.catchphrases.join(", ")}
Interests: ${aiPersona.interests.join(", ")}
Dislikes: ${aiPersona.dislikes.join(", ")}

Create a witty, memorable social media post that is EXACTLY ONE-LINER, no more than 140 characters.`;

  if (voiceExample && voiceExample.trim()) {
    prompt += `\n\nHere's an example of my voice and humor style that you should match:
"${voiceExample.trim()}"

Analyze this example for:
1. Tone and attitude
2. Type of humor (sarcastic, observational, etc.)
3. Writing style and personality
4. Key themes or topics

Now create a NEW post that captures this same style but is completely different - DO NOT reuse the same topic or structure.`;
  }

  if (providedContent) {
    prompt += `\n\nIncorporate this idea in your own voice: "${providedContent}"`;
  }

  prompt += `\n\nCRITICAL RULES:
1. MAXIMUM 140 CHARACTERS - This is a strict requirement!
2. Make it COMPLETELY UNIQUE using seed: ${randomSeed} and timestamp: ${timestamp}
3. Must be witty and capture my personality
4. NO repetitive formats or common pet phrases
5. NO hashtags unless specifically requested
6. Make it sound natural and conversational
7. Focus on humor that matches my personality`;

  const messages = [
    {
      role: "system",
      content: `You are a witty pet creating short, engaging social media posts. You MUST keep responses under 140 characters and make each post unique.
DO NOT use common pet phrases like "bork bork" or "meow friends".
DO NOT start posts the same way.
Focus on clever observations and personality.`,
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
        text: prompt + "\n\nDescribe what you see in this image with my unique voice:"
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
      temperature: 0.85,
      presence_penalty: 1,
      frequency_penalty: 1.5,
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
