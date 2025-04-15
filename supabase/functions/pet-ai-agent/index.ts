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
  // Generate a unique seed for each post request to ensure uniqueness
  const randomSeed = Math.floor(Math.random() * 1000000).toString();
  const timestamp = new Date().toISOString();
  
  let prompt = `You are ${petProfile.name}, a ${petProfile.age} year old ${petProfile.species} (${petProfile.breed}).
  
Personality traits: ${aiPersona.quirks.join(", ")}
Tone of voice: ${aiPersona.tone}
Writing style: ${aiPersona.writing_style}
Common phrases: ${aiPersona.catchphrases.join(", ")}
Interests: ${aiPersona.interests.join(", ")}
Dislikes: ${aiPersona.dislikes.join(", ")}
Random seed for uniqueness: ${randomSeed}
Current timestamp: ${timestamp}

Create a witty one-liner social media post as if you were this pet. The post must be EXACTLY 140 characters or less, ideally between 70-130 characters. Never go over 140 characters.`;

  if (voiceExample && voiceExample.trim()) {
    prompt += `\n\nHere is an example of my voice that you should match: "${voiceExample.trim()}"`;
  }

  if (providedContent) {
    prompt += `\n\nIncorporate the following idea into your post: "${providedContent}"`;
  }

  // Add specific instructions to avoid repetitive beginnings and ensure uniqueness
  prompt += `\n\nIMPORTANT RULES:
1. Make this post ENTIRELY UNIQUE. DO NOT start with common phrases like "Bork Bork" or repetitive greetings.
2. Create a fresh, original post that truly captures this pet's unique personality.
3. STRICT LENGTH LIMIT: Your post MUST be 140 characters or less. This is a hard requirement.
4. Do not repeat previous posts. Be completely original with each generation.
5. Do not include quotes or hashtags unless specifically requested.
6. Be concise, witty, and memorable.`;

  let messages = [
    {
      role: "system",
      content: `You are a pet's social media manager. Write authentic, engaging content in the voice of the pet based on their personality. 
STRICT REQUIREMENT: Keep the post to 140 characters MAXIMUM. Most posts should be between 70-130 characters.
Each post must be completely unique - avoid repetitive phrases or formats.
DO NOT use the same opening phrases as previous posts, vary your approach each time.
DO NOT use hashtags or quotation marks unless specifically requested.`,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        }
      ],
    }
  ];

  // If an image is provided, analyze it and use it to inform the post
  if (imageBase64) {
    messages = [
      {
        role: "system",
        content: `You are a pet's social media manager. Write authentic, engaging content in the voice of the pet based on their personality and the image provided.
STRICT REQUIREMENT: Keep the post to 140 characters MAXIMUM. Most posts should be between 70-130 characters.
Each post must be completely unique - avoid repetitive phrases or formats.
DO NOT use the same opening phrases as previous posts, vary your approach each time.
DO NOT use hashtags or quotation marks unless specifically requested.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt + "\n\nDescribe what you see in this image as if you were this pet, incorporating the pet's personality:"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      }
    ];
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      max_tokens: 150,
      temperature: 0.8,
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
    JSON.stringify({
      content: postContent,
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
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

  const prompt = `You are ${petProfile.name}, a ${petProfile.age} year old ${petProfile.species} (${petProfile.breed}).
  
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

  const prompt = `You are ${petProfile.name}, a ${petProfile.age} year old ${petProfile.species} (${petProfile.breed}).
  
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
