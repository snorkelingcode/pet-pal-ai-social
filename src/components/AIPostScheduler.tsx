
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { petAIService } from '@/services/petAIService';
import { PetProfile } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Bot, Calendar, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

interface AIPostSchedulerProps {
  petProfile: PetProfile;
}

const AIPostScheduler = ({ petProfile }: AIPostSchedulerProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postCount, setPostCount] = useState(3);
  const [includeImages, setIncludeImages] = useState(true);
  const [frequency, setFrequency] = useState("daily");
  const [postingTime, setPostingTime] = useState("random");
  const [voiceExample, setVoiceExample] = useState("");

  const scheduleAIPosts = async () => {
    setLoading(true);
    try {
      const success = await petAIService.scheduleAIPosts(
        petProfile.id, 
        postCount, 
        {
          frequency,
          postingTime,
          includeImages,
          voiceExample
        }
      );
      
      if (success) {
        toast({
          title: "Posts Scheduled",
          description: `${postCount} witty one-liners have been scheduled for ${petProfile.name}`,
        });
        setOpen(false);
      }
    } catch (error) {
      console.error("Error scheduling posts:", error);
      toast({
        title: "Error",
        description: "Failed to schedule posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSamplePost = async () => {
    setLoading(true);
    try {
      const content = await petAIService.generatePost(
        petProfile.id, 
        null,
        null,
        voiceExample
      );
      
      if (content) {
        toast({
          title: "Sample AI Post",
          description: content,
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Error generating sample post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate sample post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={() => setOpen(true)}
      >
        <Bot size={16} />
        Schedule AI Posts
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule AI Posts for {petProfile.name}</DialogTitle>
            <DialogDescription>
              Let your pet create witty one-liners limited to 140 characters
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar size={16} />
                  Posting Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Number of posts to schedule: {postCount}</Label>
                  <Slider 
                    value={[postCount]} 
                    min={1} 
                    max={10} 
                    step={1} 
                    onValueChange={values => setPostCount(values[0])} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Posting frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Best time to post</Label>
                  <Select value={postingTime} onValueChange={setPostingTime}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                      <SelectItem value="evening">Evening (5 PM - 10 PM)</SelectItem>
                      <SelectItem value="random">Random Times</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle size={16} />
                  Content Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea 
                    id="voice-example"
                    placeholder="Write a sample post (max 140 chars) in your pet's voice to help AI match their style"
                    value={voiceExample}
                    onChange={(e) => {
                      if (e.target.value.length <= 140) {
                        setVoiceExample(e.target.value);
                      }
                    }}
                    className="min-h-[100px]"
                    maxLength={140}
                  />
                  <p className="text-xs text-muted-foreground">
                    {140 - voiceExample.length} characters remaining. Write a witty one-liner that captures your pet's personality.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="include-images" 
                    checked={includeImages}
                    onCheckedChange={setIncludeImages}
                  />
                  <label htmlFor="include-images" className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    Include images in posts
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={generateSamplePost} disabled={loading}>
              Generate Sample
            </Button>
            <Button onClick={scheduleAIPosts} disabled={loading}>
              {loading ? "Processing..." : "Schedule Posts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIPostScheduler;
