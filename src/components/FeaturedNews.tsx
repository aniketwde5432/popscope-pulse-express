
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

  // Enhanced fallback image selection for featured news
  const getFallbackImage = () => {
    const categoryImages: Record<string, string[]> = {
      anime: [
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1074&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=1170&auto=format&fit=crop"
      ],
      manga: [
        "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1614583225154-5fcddf81d8ce?q=80&w=1170&auto=format&fit=crop"
      ],
      bollywood: [
        "https://images.unsplash.com/photo-1626516010767-981de061de7a?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1662836248690-b264792ef10f?q=80&w=1170&auto=format&fit=crop"
      ],
      hollywood: [
        "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1032&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1626908013351-800ddd734b8a?q=80&w=1032&auto=format&fit=crop"
      ],
      tvshows: [
        "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1594908900066-3f47337549d8?q=80&w=1170&auto=format&fit=crop"
      ],
      comics: [
        "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1612036782180-6f0822045d55?q=80&w=1170&auto=format&fit=crop"
      ],
      kpop: [
        "https://images.unsplash.com/photo-1619855544858-e8e275c3b31a?q=80&w=1170&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1681583492386-d2080cd70ef7?q=80&w=1170&auto=format&fit=crop"
      ],
      celebrity: [
        "https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?q=80&w=1034&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?q=80&w=1034&auto=format&fit=crop"
      ],
      upcoming: [
        "https://images.unsplash.com/photo-1597002973885-8c690f958ac4?q=80&w=1155&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1155&auto=format&fit=crop"
      ],
      trending: [
        "https://images.unsplash.com/photo-1586899028174-e7098604235b?q=80&w=1171&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1585951237313-1979e4df7385?q=80&w=1170&auto=format&fit=crop"
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

  // Check if the URL might be the Netflix generic image
  const isGenericNetflixImage = (url: string) => {
    return url && url.includes('netflix') && url.includes('default');
  };

  // Determine if we should use the article image or a fallback
  const shouldUseArticleImage = article.urlToImage && 
    !imageError && 
    !isGenericNetflixImage(article.urlToImage);

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gradient-to-b from-transparent to-deep-charcoal mb-8 shadow-lg">
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        <img
          src={shouldUseArticleImage ? article.urlToImage : getFallbackImage()}
          alt={article.title}
          onError={handleImageError}
          loading="eager"
          className="w-full h-full object-cover"
        />
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
