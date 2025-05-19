
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export type Category = {
  id: string;
  name: string;
  image: string;
  description: string;
};

// Updated with verified high-quality images for all categories
const categories: Category[] = [
  {
    id: "anime",
    name: "Anime",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1074&auto=format&fit=crop",
    description: "Latest news from the world of Japanese animation"
  },
  {
    id: "manga",
    name: "Manga",
    image: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=1170&auto=format&fit=crop",
    description: "Updates on popular manga series and new releases"
  },
  {
    id: "bollywood",
    name: "Bollywood",
    image: "https://images.unsplash.com/photo-1626070789653-afb6c41296c7?q=80&w=1074&auto=format&fit=crop",
    description: "The latest from the Indian film industry"
  },
  {
    id: "hollywood",
    name: "Hollywood",
    image: "https://images.unsplash.com/photo-1626908013351-800ddd734b8a?q=80&w=1032&auto=format&fit=crop",
    description: "Breaking news from the entertainment capital"
  },
  {
    id: "tvshows",
    name: "TV Shows",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1170&auto=format&fit=crop",
    description: "Everything about your favorite series and shows"
  },
  {
    id: "comics",
    name: "Comics",
    image: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?q=80&w=1170&auto=format&fit=crop",
    description: "Updates on superhero comics and graphic novels"
  },
  {
    id: "kpop",
    name: "K-Pop",
    image: "https://images.unsplash.com/photo-1619855544858-e8e275c3b31a?q=80&w=1170&auto=format&fit=crop",
    description: "Latest news from the Korean pop music scene"
  },
  {
    id: "celebrity",
    name: "Celebrity",
    image: "https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?q=80&w=1034&auto=format&fit=crop",
    description: "Celebrity news, gossip, and interviews"
  },
  {
    id: "upcoming",
    name: "Upcoming",
    image: "https://images.unsplash.com/photo-1597002973885-8c690f958ac4?q=80&w=1155&auto=format&fit=crop",
    description: "Previews of upcoming movies, shows, and releases"
  }
];

export function CategoryBanners() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => ({...prev, [categoryId]: true}));
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -600, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 600, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll(); // Check initially
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Fallback images for each category if primary image fails
  const getCategoryFallbackImage = (categoryId: string) => {
    const fallbacks: Record<string, string> = {
      anime: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=1170&auto=format&fit=crop",
      manga: "https://images.unsplash.com/photo-1614583225154-5fcddf81d8ce?q=80&w=1170&auto=format&fit=crop",
      bollywood: "https://images.unsplash.com/photo-1594387303756-8c85d29a982f?q=80&w=1170&auto=format&fit=crop",
      hollywood: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1032&auto=format&fit=crop",
      tvshows: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?q=80&w=1170&auto=format&fit=crop",
      comics: "https://images.unsplash.com/photo-1612036782180-6f0822045d55?q=80&w=1170&auto=format&fit=crop",
      kpop: "https://images.unsplash.com/photo-1681583492386-d2080cd70ef7?q=80&w=1170&auto=format&fit=crop",
      celebrity: "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?q=80&w=1034&auto=format&fit=crop",
      upcoming: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1155&auto=format&fit=crop",
      trending: "https://images.unsplash.com/photo-1586899028174-e7098604235b?q=80&w=1171&auto=format&fit=crop",
    };
    
    return fallbacks[categoryId] || "https://images.unsplash.com/photo-1497005367839-6e852de72767?q=80&w=1167&auto=format&fit=crop";
  };

  return (
    <div className="relative w-full">
      {showLeftArrow && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full opacity-90 shadow-lg"
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="absolute left-0 top-1/2 z-0 h-16 w-8 -translate-y-1/2 bg-gradient-to-r from-background to-transparent opacity-75"></div>
      <div className="absolute right-0 top-1/2 z-0 h-16 w-8 -translate-y-1/2 bg-gradient-to-l from-background to-transparent opacity-75"></div>
      
      <div 
        ref={scrollContainerRef}
        className="flex w-full gap-4 overflow-x-auto pb-4 fade-edges hide-scrollbar snap-x"
        style={{ scrollBehavior: 'smooth' }}
      >
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/category/${category.id}`)}
            className="relative min-w-[280px] max-w-[340px] cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01] snap-start animate-scale-in"
          >
            <div className="aspect-[16/9] overflow-hidden">
              {!imageErrors[category.id] ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={() => handleImageError(category.id)}
                  loading="lazy"
                />
              ) : (
                <img
                  src={getCategoryFallbackImage(category.id)}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-deep-charcoal/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-4 text-white">
              <h3 className="text-xl font-bold font-playfair mb-1 text-shadow">{category.name}</h3>
              <p className="text-sm text-white/80 line-clamp-2">{category.description}</p>
            </div>
          </div>
        ))}
      </div>

      {showRightArrow && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full opacity-90 shadow-lg scroll-indicator"
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
