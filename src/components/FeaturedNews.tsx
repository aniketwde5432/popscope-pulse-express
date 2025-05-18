
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/services/newsService";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ExternalLink } from "lucide-react";

export function FeaturedNews({ article }: { article?: NewsArticle }) {
  const [imageError, setImageError] = useState(false);
  
  if (!article) {
    return null;
  }

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
    <div className="relative w-full overflow-hidden rounded-lg bg-gradient-to-b from-transparent to-deep-charcoal mb-8 shadow-lg">
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        {!imageError && article.urlToImage ? (
          <img
            src={article.urlToImage}
            alt={article.title}
            onError={handleImageError}
            loading="eager"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={getFallbackImage()}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
          <div className="mb-2 flex gap-2">
            {article.isBreaking && <span className="badge-breaking card-badge">Breaking</span>}
            {article.isTrending && <span className="badge-trending card-badge">Trending</span>}
            {article.isEditorsPick && <span className="badge-editors card-badge">Editor's Pick</span>}
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair font-bold mb-2 text-shadow">
            {article.title}
          </h2>
          
          <p className="text-lg opacity-90 mb-4 line-clamp-2 text-shadow">
            {article.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-75">
              <span className="font-semibold">{article.source.name}</span> • {formatPublishDate(article.publishedAt)}
            </div>
            <Button asChild variant="secondary" className="rounded-full gap-2 hover:gap-3 transition-all">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read Full Story
                <ExternalLink size={16} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
