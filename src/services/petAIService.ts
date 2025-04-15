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
}

export const petAIService = {
  generatePost: async (
    petId: string, 
    content?: string, 
    imageBase64?: string,
    voiceExample?: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-agent', {
        body: {
          action: 'generate_post',
          petId,
          content,
          imageBase64,
          voiceExample
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

  generateMessage: async (petId: string, targetPetId: string, content?: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-agent', {
        body: {
          action: 'generate_message',
          petId,
          targetPetId,
          content
        },
      });

      if (error) throw error;
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
    voiceExample?: string
  ): Promise<Post | null> => {
    try {
      const generatedContent = await petAIService.generatePost(petId, content, imageBase64, voiceExample);
      
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
        contentTheme = 'general'
      } = options || {};
      
      const now = new Date();
      const scheduledPosts = [];
      
      for (let i = 0; i < numberOfPosts; i++) {
        let scheduledDate = new Date(now);
        
        if (frequency === 'daily') {
          scheduledDate.setDate(scheduledDate.getDate() + i);
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
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert(scheduledPosts);
      
      if (error) throw error;
      
      toast({
        title: 'Posts Scheduled',
        description: `${numberOfPosts} posts have been scheduled for ${frequency === 'daily' ? 'daily' : frequency === 'weekly' ? 'weekly' : 'random'} posting`,
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
  }
};
