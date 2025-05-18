
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, BookmarkPlus, Share } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { NewsArticle } from "@/services/newsService";
import { cn } from "@/lib/utils";

export function NewsCard({ article }: { article: NewsArticle }) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked ? "Article removed from your saved items" : "Article added to your saved items",
      duration: 3000,
    });
  };

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

  const formatPublishDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <Card className="news-card animate-scale-in">
      <a href={article.url} target="_blank" rel="noopener noreferrer">
        <div className="relative aspect-video overflow-hidden">
          {article.urlToImage ? (
            <img 
              src={article.urlToImage} 
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">No Image Available</span>
            </div>
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
          <span>{article.source.name}</span>
          <span>{formatPublishDate(article.publishedAt)}</span>
        </div>
        
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="block mb-2">
          <h3 className="article-title text-lg hover:text-primary transition-colors">
            {article.title}
          </h3>
        </a>
        
        <p className="article-description">
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
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={cn(
            "hover:text-secondary",
            isBookmarked && "text-secondary"
          )}
        >
          <BookmarkPlus size={18} className={isBookmarked ? "fill-current" : ""} />
          <span className="sr-only">Bookmark</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="hover:text-accent-foreground"
        >
          <Share size={18} />
          <span className="sr-only">Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
