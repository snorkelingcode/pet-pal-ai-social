
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Post, Comment, PetProfile } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Share } from "lucide-react";
import { dogResponses, catResponses, rabbitResponses } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: Post;
  comments?: Comment[];
}

const PostCard = ({ post, comments = [] }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const { toast } = useToast();

  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const getAIResponse = (petProfile: PetProfile) => {
    // Get a response based on the pet's species
    let responses: string[] = [];
    
    switch(petProfile.species.toLowerCase()) {
      case 'dog':
        responses = dogResponses;
        break;
      case 'cat':
        responses = catResponses;
        break;
      case 'rabbit':
        responses = rabbitResponses;
        break;
      default:
        responses = dogResponses; // Default to dog responses
    }
    
    // Return a random response from the appropriate array
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleAIComment = () => {
    setIsCommenting(true);
    
    // Simulate AI thinking and responding
    setTimeout(() => {
      const aiResponse = getAIResponse(post.petProfile);
      
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        postId: post.id,
        petId: post.petProfile.id,
        petProfile: post.petProfile,
        content: aiResponse,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      
      setLocalComments([...localComments, newComment]);
      setIsCommenting(false);
      
      toast({
        title: "AI Comment Generated",
        description: `${post.petProfile.name} says: "${aiResponse}"`,
      });
    }, 1500);
  };

  return (
    <Card className="mb-4 py-2">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <img 
              src={post.petProfile.profilePicture} 
              alt={post.petProfile.name}
              className="object-cover"
            />
          </Avatar>
          <div className="ml-2">
            <h3 className="font-semibold text-sm">{post.petProfile.name}</h3>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm mb-2">{post.content}</p>
        {post.image && (
          <div className="rounded-lg overflow-hidden mb-2">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-40 object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="w-full">
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`h-8 px-2 ${liked ? "text-petpal-pink" : ""}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-petpal-pink text-petpal-pink" : ""}`} />
              {likesCount}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleComments}
              className="h-8 px-2"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              {localComments.length}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
          
          {showComments && (
            <div className="mt-2 space-y-2">
              {localComments.slice(0, 2).map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <Avatar className="h-6 w-6">
                    <img 
                      src={comment.petProfile.profilePicture} 
                      alt={comment.petProfile.name}
                      className="object-cover"
                    />
                  </Avatar>
                  <div className="bg-muted p-1 rounded-lg flex-1">
                    <p className="text-xs font-semibold">{comment.petProfile.name}</p>
                    <p className="text-xs">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {localComments.length > 2 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-8 text-xs"
                  onClick={toggleComments}
                >
                  View {localComments.length - 2} more comments
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full mt-1 h-8 text-xs"
                onClick={handleAIComment}
                disabled={isCommenting}
              >
                {isCommenting ? "AI is thinking..." : "Generate AI Comment"}
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
