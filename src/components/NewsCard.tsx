
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, Share, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { NewsArticle } from "@/services/newsService";
import { cn } from "@/lib/utils";
import { SaveButton } from "@/components/SaveButton";

export function NewsCard({ article }: { article: NewsArticle }) {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Article removed from your favorites" : "Article added to your favorites",
      duration: 3000,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description || "",
        url: article.url,
      });
    } else {
      navigator.clipboard.writeText(article.url);
      toast({
        title: "Link copied!",
        description: "Article URL copied to clipboard",
        duration: 3000,
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPublishDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Recently";
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 1) {
      return `${Math.floor(diffMs / (1000 * 60))} minutes ago`;
    } else if (diffHrs < 24) {
      return `${Math.floor(diffHrs)} hours ago`;
    } else if (diffHrs < 48) {
      return `Yesterday`;
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(date);
    }
  };

  // Use a fallback image based on category
  const getFallbackImage = () => {
    const categoryImages: Record<string, string> = {
      anime: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1074&auto=format&fit=crop",
      manga: "https://images.unsplash.com/photo-1616889355221-2ded55a0c879?q=80&w=1170&auto=format&fit=crop",
      bollywood: "https://images.unsplash.com/photo-1586384697388-04efaa8afd17?q=80&w=1170&auto=format&fit=crop",
      hollywood: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1032&auto=format&fit=crop",
      tvshows: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1170&auto=format&fit=crop",
      comics: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?q=80&w=1170&auto=format&fit=crop",
      kpop: "https://images.unsplash.com/photo-1688989610825-6b57833d0abd?q=80&w=1170&auto=format&fit=crop",
      celebrity: "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?q=80&w=1034&auto=format&fit=crop",
      upcoming: "https://images.unsplash.com/photo-1542204637-e67bc7d41e48?q=80&w=1155&auto=format&fit=crop",
      trending: "https://images.unsplash.com/photo-1586899028174-e7098604235b?q=80&w=1171&auto=format&fit=crop",
    };
    
    return categoryImages[article.category.toLowerCase()] || 
      "https://images.unsplash.com/photo-1497005367839-6e852de72767?q=80&w=1167&auto=format&fit=crop";
  };

  return (
    <Card className="news-card animate-scale-in hover:shadow-lg transition-all duration-300">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-video overflow-hidden">
          {(!imageError && article.urlToImage) ? (
            <img 
              src={article.urlToImage} 
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <img
              src={getFallbackImage()}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="absolute top-2 left-2 flex gap-2">
            {article.isBreaking && <span className="badge-breaking card-badge">Breaking</span>}
            {article.isTrending && <span className="badge-trending card-badge">Trending</span>}
            {article.isEditorsPick && <span className="badge-editors card-badge">Editor's Pick</span>}
          </div>
        </div>
      </a>
      
      <CardContent className="pt-4">
        <div className="article-source flex justify-between items-center mb-1">
          <span className="font-medium">{article.source.name}</span>
          <span className="text-sm text-muted-foreground">{formatPublishDate(article.publishedAt)}</span>
        </div>
        
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="block mb-2">
          <h3 className="article-title text-lg hover:text-primary transition-colors">
            {article.title}
          </h3>
        </a>
        
        <p className="article-description text-muted-foreground">
          {article.description}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "hover:text-primary",
            isLiked && "text-primary"
          )}
        >
          <Heart size={18} className={isLiked ? "fill-current" : ""} />
          <span className="sr-only">Like</span>
        </Button>
        
        <SaveButton article={article} />
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="hover:text-accent-foreground"
          >
            <Share size={18} />
            <span className="sr-only">Share</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:text-accent-foreground"
          >
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="View original source"
            >
              <ExternalLink size={18} />
              <span className="sr-only">View source</span>
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
