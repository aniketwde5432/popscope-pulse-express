
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

  // Enhanced fallback image selection based on category
  const getFallbackImage = () => {
    const categoryImages: Record<string, string[]> = {
      anime: [
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1074&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1531501410720-c8d437636169?q=80&w=1064&auto=format&fit=crop"
      ],
      manga: [
        "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1614583225154-5fcddf81d8ce?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611458938148-ef8e66a82cc6?q=80&w=1170&auto=format&fit=crop"
      ],
      bollywood: [
        "https://images.unsplash.com/photo-1626070789653-afb6c41296c7?q=80&w=1074&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1594387303756-8c85d29a982f?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1598121210875-722642cbbf50?q=80&w=987&auto=format&fit=crop"
      ],
      hollywood: [
        "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1032&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1626908013351-800ddd734b8a?q=80&w=1032&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1594299241862-192cf4e1b4b8?q=80&w=987&auto=format&fit=crop"
      ],
      tvshows: [
        "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1594908900066-3f47337549d8?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1170&auto=format&fit=crop"
      ],
      comics: [
        "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1612036782180-6f0822045d55?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?q=80&w=1170&auto=format&fit=crop"
      ],
      kpop: [
        "https://images.unsplash.com/photo-1619855544858-e8e275c3b31a?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1681583492386-d2080cd70ef7?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1075&auto=format&fit=crop"
      ],
      celebrity: [
        "https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?q=80&w=1034&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?q=80&w=1034&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1169&auto=format&fit=crop"
      ],
      upcoming: [
        "https://images.unsplash.com/photo-1597002973885-8c690f958ac4?q=80&w=1155&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1155&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542204637-e67bc7d41e48?q=80&w=1155&auto=format&fit=crop"
      ],
      trending: [
        "https://images.unsplash.com/photo-1586899028174-e7098604235b?q=80&w=1171&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1585951237313-1979e4df7385?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?q=80&w=1170&auto=format&fit=crop"
      ],
    };
    
    const category = article.category.toLowerCase();
    const images = categoryImages[category];
    
    if (images) {
      // Use deterministic selection based on article ID to always get the same image for the same article
      const imageIndex = article.id ? article.id.charCodeAt(0) % images.length : 0;
      return images[imageIndex];
    }
    
    return "https://images.unsplash.com/photo-1497005367839-6e852de72767?q=80&w=1167&auto=format&fit=crop";
  };

  // Check if the URL might be a generic image
  const isGenericNetflixImage = (url: string) => {
    return url && (
      url.includes('netflix') && url.includes('default') ||
      url.includes('placeholder') ||
      url.includes('image-not-found') ||
      url.includes('no-image') ||
      url.includes('default-image') ||
      url.length < 15
    );
  };

  // Determine if we should use the article image or a fallback
  const shouldUseArticleImage = article.urlToImage && 
    !imageError && 
    !isGenericNetflixImage(article.urlToImage);

  return (
    <Card className="news-card animate-scale-in hover:shadow-lg transition-all duration-300">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={shouldUseArticleImage ? article.urlToImage : getFallbackImage()} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
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
