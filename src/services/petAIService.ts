import { supabase } from '@/integrations/supabase/client';
import { PetProfile, Post } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface PetAIResponse {
  content?: string;
  caption?: string;
  pets?: PetProfile[];
  error?: string;
}

interface ScheduleOptions {
  frequency?: string;
  postingTime?: string;
  includeImages?: boolean;
  voiceExample?: string;
  contentTheme?: string;
  memories?: any[]; // Added this property for the memories
  every2Minutes?: boolean; // Added this property for the 2-minute scheduling
}

export const petAIService = {
  generatePost: async (
    petId: string, 
    content?: string, 
    imageBase64?: string,
    voiceExample?: string,
    relevantMemories?: any[]
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-agent', {
        body: {
          action: 'generate_post',
          petId,
          content,
          imageBase64,
          voiceExample,
          relevantMemories
        },
      });

      if (error) throw error;
      return data.content || null;
    } catch (error) {
      console.error('Error generating AI post:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI post',
        variant: 'destructive'
      });
      return null;
    }
  },

  generateCaption: async (petId: string, imageBase64: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-agent', {
        body: {
          action: 'generate_caption',
          petId,
          imageBase64
        },
      });

      if (error) throw error;
      return data.caption || null;
    } catch (error) {
      console.error('Error generating caption:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate image caption',
        variant: 'destructive'
      });
      return null;
    }
  },

  generateMessage: async (
    petId: string, 
    targetPetId: string, 
    content?: string, 
    useRelationshipContext: boolean = true
  ): Promise<string | null> => {
    try {
      // Get relevant memories if using relationship context
      let relevantMemories = [];
      let relationshipData = null;
      
      if (useRelationshipContext) {
        // Fetch relationship data to add context to the message
        const { data: relationships, error: relationshipError } = await supabase.functions.invoke(
          'pet-ai-learning', 
          {
            body: {
              action: 'get_relationships',
              petId,
            },
          }
        );
        
        if (!relationshipError && relationships?.relationships) {
          relationshipData = relationships.relationships.find(
            (r: any) => r.related_pet_id === targetPetId
          );
        }
        
        // Fetch memories related to the target pet
        const { data: memoryResult, error: memoryError } = await supabase.functions.invoke(
          'pet-ai-learning',
          {
            body: {
              action: 'retrieve_memories_by_related_pet',
              petId,
              relatedPetId: targetPetId,
              limit: 5
            },
          }
        );
        
        if (!memoryError && memoryResult?.memories) {
          relevantMemories = memoryResult.memories;
        }
      }

      const { data, error } = await supabase.functions.invoke('pet-ai-agent', {
        body: {
          action: 'generate_message',
          petId,
          targetPetId,
          content,
          relationshipData,
          relevantMemories
        },
      });

      if (error) throw error;
      
      // Store this interaction as a memory
      if (data.content) {
        await supabase.functions.invoke('pet-ai-learning', {
          body: {
            action: 'store_memory',
            petId,
            content: `Wrote to ${targetPetId}: "${data.content}"`,
            type: 'message',
            relatedId: targetPetId,
            relatedType: 'pet',
          },
        });
      }
      
      return data.content || null;
    } catch (error) {
      console.error('Error generating message:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate message',
        variant: 'destructive'
      });
      return null;
    }
  },

  getSuggestedPetsToFollow: async (petId: string): Promise<PetProfile[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-agent', {
        body: {
          action: 'suggest_pets_to_follow',
          petId
        },
      });

      if (error) throw error;
      return data.pets || [];
    } catch (error) {
      console.error('Error getting pet suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to get pet suggestions',
        variant: 'destructive'
      });
      return [];
    }
  },

  createAIPost: async (
    petId: string, 
    content?: string, 
    imageBase64?: string,
    voiceExample?: string,
    relevantMemories?: any[]
  ): Promise<Post | null> => {
    try {
      const generatedContent = await petAIService.generatePost(petId, content, imageBase64, voiceExample, relevantMemories);
      
      if (!generatedContent) return null;
      
      if (generatedContent.length > 140) {
        throw new Error('Generated content exceeds 140 characters');
      }
      
      const postData = {
        pet_id: petId,
        content: generatedContent,
        image: null,
        likes: 0,
        comments: 0
      };
      
      if (imageBase64) {
        const base64Response = await fetch(`data:image/jpeg;base64,${imageBase64}`);
        const blob = await base64Response.blob();
        const file = new File([blob], `pet_post_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pets')
          .upload(`posts/${petId}_${Date.now()}.jpg`, file);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('pets')
          .getPublicUrl(uploadData.path);
          
        postData.image = publicUrlData.publicUrl;
      }
      
      const { data: post, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();
        
      if (error) throw error;
      
      // Store this post as a memory for the pet
      await supabase.functions.invoke('pet-ai-learning', {
        body: {
          action: 'store_memory',
          petId,
          content: `Posted: "${generatedContent}"`,
          type: 'post',
          relatedId: post.id,
          relatedType: 'post',
        },
      });
      
      const mappedPost: Post = {
        id: post.id,
        petId: post.pet_id,
        content: post.content,
        image: post.image,
        likes: post.likes,
        comments: post.comments,
        createdAt: post.created_at,
        petProfile: {} as any
      };
      
      toast({
        title: 'Success',
        description: 'AI post created successfully',
      });
      
      return mappedPost;
    } catch (error) {
      console.error('Error creating AI post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create AI post',
        variant: 'destructive'
      });
      return null;
    }
  },

  scheduleAIPosts: async (
    petId: string, 
    numberOfPosts: number = 5,
    options?: ScheduleOptions
  ): Promise<boolean> => {
    try {
      const { 
        frequency = 'daily', 
        postingTime = 'random',
        includeImages = true,
        voiceExample = '',
        contentTheme = 'general',
        memories = [],
        every2Minutes = false,
      } = options || {};

      // If every 2 minutes is requested, override everything else:
      if (every2Minutes) {
        const now = new Date();
        const scheduledPosts = [];
        // Let's schedule one post for every 2 minutes for the next 10 posts
        for (let i = 0; i < 10; i++) {
          const scheduledDate = new Date(now.getTime() + i * 2 * 60 * 1000);
          scheduledPosts.push({
            pet_id: petId,
            scheduled_for: scheduledDate.toISOString(),
            content_theme: contentTheme,
            include_images: includeImages,
            voice_example: voiceExample,
            status: 'pending'
          });
        }

        const { data, error } = await supabase
          .from('scheduled_posts')
          .insert(scheduledPosts);

        if (error) throw error;

        toast({
          title: 'Rapid Posts Scheduled',
          description: `Your pet will post something random every 2 minutes for the next 20 minutes!`,
        });

        return true;
      }

      const initialPost = await petAIService.createAIPost(
        petId,
        undefined,
        undefined,
        voiceExample,
        memories
      );
      if (!initialPost) {
        throw new Error('Failed to create initial post');
      }
      
      const now = new Date();
      const scheduledPosts = [];
      const firstDayPosts = Math.max(0, numberOfPosts - 1); // Subtract 1 for the initial post
      // Schedule remaining posts for the first day
      for (let i = 0; i < firstDayPosts; i++) {
        let scheduledDate = new Date(now);
        if (postingTime === 'morning') {
          scheduledDate.setHours(8 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0);
        } else if (postingTime === 'afternoon') {
          scheduledDate.setHours(12 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 60), 0);
        } else if (postingTime === 'evening') {
          scheduledDate.setHours(17 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 60), 0);
        } else {
          scheduledDate.setHours(6 + Math.floor(Math.random() * 16), Math.floor(Math.random() * 60), 0);
        }
        scheduledPosts.push({
          pet_id: petId,
          scheduled_for: scheduledDate.toISOString(),
          content_theme: contentTheme,
          include_images: includeImages,
          voice_example: voiceExample,
          status: 'pending'
        });
      }
      // Schedule posts for subsequent days
      for (let i = 1; i < 7; i++) {
        for (let j = 0; j < numberOfPosts; j++) {
          let scheduledDate = new Date(now);
          scheduledDate.setDate(scheduledDate.getDate() + i);
          if (frequency === 'daily') {
            // Keep the date as is
          } else if (frequency === 'weekly') {
            scheduledDate.setDate(scheduledDate.getDate() + (i * 7));
          } else {
            const randomDays = Math.floor(Math.random() * 30) + 1;
            scheduledDate.setDate(scheduledDate.getDate() + randomDays);
          }
          if (postingTime === 'morning') {
            scheduledDate.setHours(8 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0);
          } else if (postingTime === 'afternoon') {
            scheduledDate.setHours(12 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 60), 0);
          } else if (postingTime === 'evening') {
            scheduledDate.setHours(17 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 60), 0);
          } else {
            scheduledDate.setHours(6 + Math.floor(Math.random() * 16), Math.floor(Math.random() * 60), 0);
          }
          scheduledPosts.push({
            pet_id: petId,
            scheduled_for: scheduledDate.toISOString(),
            content_theme: contentTheme,
            include_images: includeImages,
            voice_example: voiceExample,
            status: 'pending'
          });
        }
      }
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert(scheduledPosts);
      if (error) throw error;
      toast({
        title: 'Posts Scheduled',
        description: `Initial post created and ${scheduledPosts.length} posts have been scheduled for ${frequency === 'daily' ? 'daily' : frequency === 'weekly' ? 'weekly' : 'random'} posting`,
      });
      return true;
    } catch (error) {
      console.error('Error scheduling AI posts:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule AI posts',
        variant: 'destructive'
      });
      return false;
    }
  },
  
  generatePostResponse: async (
    petId: string,
    postId: string,
    postContent: string,
    postAuthorPetId: string
  ): Promise<string | null> => {
    try {
      // First, let's get memories related to this post or its author
      const { data: memoriesResult, error: memoriesError } = await supabase.functions.invoke(
        'pet-ai-learning',
        {
          body: {
            action: 'retrieve_relevant_memories',
            petId,
            content: postContent,
          },
        }
      );
      
      const relevantMemories = memoriesError ? [] : (memoriesResult?.memories || []);
      
      // Get relationship data with the post author
      const { data: relationshipResult, error: relationshipError } = await supabase.functions.invoke(
        'pet-ai-learning',
        {
          body: {
            action: 'get_relationships',
            petId,
          },
        }
      );
      
      const relationship = relationshipError 
        ? null 
        : (relationshipResult?.relationships || [])
            .find((r: any) => r.related_pet_id === postAuthorPetId);
      
      // Call the AI agent to generate a comment response
      const { data, error } = await supabase.functions.invoke('pet-ai-agent', {
        body: {
          action: 'generate_post_comment',
          petId,
          postId,
          postContent,
          authorPetId: postAuthorPetId,
          relevantMemories,
          relationship
        },
      });
      
      if (error) throw error;
      
      // Store this interaction as a memory
      if (data.content) {
        await supabase.functions.invoke('pet-ai-learning', {
          body: {
            action: 'store_memory',
            petId,
            content: `Commented on post: "${postContent}" with: "${data.content}"`,
            type: 'comment',
            relatedId: postId,
            relatedType: 'post',
          },
        });
      }
      
      return data.content || null;
    } catch (error) {
      console.error('Error generating post response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate response to post',
        variant: 'destructive'
      });
      return null;
    }
  }
};
