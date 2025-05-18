
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

const categories: Category[] = [
  {
    id: "anime",
    name: "Anime",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1074&auto=format&fit=crop",
    description: "Latest news from the world of Japanese animation"
  },
  {
    id: "manga",
    name: "Manga",
    image: "https://images.unsplash.com/photo-1616889355221-2ded55a0c879?q=80&w=1170&auto=format&fit=crop",
    description: "Updates on popular manga series and new releases"
  },
  {
    id: "bollywood",
    name: "Bollywood",
    image: "https://images.unsplash.com/photo-1586384697388-04efaa8afd17?q=80&w=1170&auto=format&fit=crop",
    description: "The latest from the Indian film industry"
  },
  {
    id: "hollywood",
    name: "Hollywood",
    image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1032&auto=format&fit=crop",
    description: "Breaking news from the entertainment capital"
  },
  {
    id: "tvshows",
    name: "TV Shows",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1170&auto=format&fit=crop",
    description: "Everything about your favorite series and shows"
  },
  {
    id: "comics",
    name: "Comics",
    image: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?q=80&w=1170&auto=format&fit=crop",
    description: "Updates on superhero comics and graphic novels"
  },
  {
    id: "kpop",
    name: "K-Pop",
    image: "https://images.unsplash.com/photo-1688989610825-6b57833d0abd?q=80&w=1170&auto=format&fit=crop",
    description: "Latest news from the Korean pop music scene"
  },
  {
    id: "celebrity",
    name: "Celebrity",
    image: "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?q=80&w=1034&auto=format&fit=crop",
    description: "Celebrity news, gossip, and interviews"
  },
  {
    id: "upcoming",
    name: "Upcoming",
    image: "https://images.unsplash.com/photo-1542204637-e67bc7d41e48?q=80&w=1155&auto=format&fit=crop",
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

  return (
    <div className="relative w-full">
      {showLeftArrow && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full opacity-90 shadow-lg"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Scroll left</span>
        </Button>
      )}

      <div 
        ref={scrollContainerRef}
        className="flex w-full gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/category/${category.id}`)}
            className="relative min-w-[280px] max-w-[340px] cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01] snap-start"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                onError={() => handleImageError(category.id)}
                loading="lazy"
              />
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
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full opacity-90 shadow-lg"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Scroll right</span>
        </Button>
      )}
    </div>
  );
}
