
import { supabase } from '@/integrations/supabase/client';
import { PetProfile, Post } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface PetAIResponse {
  content?: string;
  caption?: string;
  pets?: PetProfile[];
  error?: string;
}

export const petAIService = {
  // Generate an AI post for a pet
  generatePost: async (petId: string, content?: string, imageBase64?: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-agent', {
        body: {
          action: 'generate_post',
          petId,
          content,
          imageBase64
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

  // Generate an image caption for a pet
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

  // Generate a direct message to another pet
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

  // Get suggested pets to follow based on owner's connections
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

  // Create an AI post and save it to the database
  createAIPost: async (petId: string, content?: string, imageBase64?: string): Promise<Post | null> => {
    try {
      // First generate the AI content
      const generatedContent = await petAIService.generatePost(petId, content, imageBase64);
      
      if (!generatedContent) return null;
      
      // Prepare post data
      const postData = {
        pet_id: petId,
        content: generatedContent,
        image: null, // We'll update this if an image is uploaded
        likes: 0,
        comments: 0
      };
      
      // If we have an image, upload it to storage
      if (imageBase64) {
        // Convert base64 to file
        const base64Response = await fetch(`data:image/jpeg;base64,${imageBase64}`);
        const blob = await base64Response.blob();
        const file = new File([blob], `pet_post_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pets')
          .upload(`posts/${petId}_${Date.now()}.jpg`, file);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('pets')
          .getPublicUrl(uploadData.path);
          
        postData.image = publicUrlData.publicUrl;
      }
      
      // Insert post into database
      const { data: post, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();
        
      if (error) throw error;
      
      // Map to our front-end type
      const mappedPost: Post = {
        id: post.id,
        petId: post.pet_id,
        content: post.content,
        image: post.image,
        likes: post.likes,
        comments: post.comments,
        createdAt: post.created_at,
        petProfile: {} as any // This would need to be filled in later
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
        description: 'Failed to create AI post',
        variant: 'destructive'
      });
      return null;
    }
  },

  // Schedule multiple posts to be made over time
  scheduleAIPosts: async (petId: string, numberOfPosts: number = 5): Promise<boolean> => {
    try {
      // For now, we'll just create posts immediately as a placeholder
      // In a real implementation, you'd use a database table to store scheduled posts
      // and a cron job or similar to post them at the scheduled times
      
      const results = await Promise.all(
        Array(numberOfPosts).fill(0).map(() => petAIService.createAIPost(petId))
      );
      
      const successCount = results.filter(Boolean).length;
      
      toast({
        title: 'Posts Scheduled',
        description: `${successCount} out of ${numberOfPosts} posts have been scheduled`,
      });
      
      return successCount > 0;
    } catch (error) {
      console.error('Error scheduling AI posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule AI posts',
        variant: 'destructive'
      });
      return false;
    }
  }
};
