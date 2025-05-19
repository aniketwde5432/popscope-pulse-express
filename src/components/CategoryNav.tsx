
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Category = {
  id: string;
  name: string;
};

const categories: Category[] = [
  { id: "trending", name: "Trending" },
  { id: "anime", name: "Anime" },
  { id: "manga", name: "Manga" },
  { id: "bollywood", name: "Bollywood" },
  { id: "hollywood", name: "Hollywood" },
  { id: "tvshows", name: "TV Shows" },
  { id: "comics", name: "Comics" },
  { id: "kpop", name: "K-Pop" },
  { id: "celebrity", name: "Celebrity" },
  { id: "upcoming", name: "Upcoming" },
];

export type CategoryNavProps = {
  activeCategory?: string;
  setActiveCategory?: (category: string) => void;
};

export function CategoryNav({ activeCategory = "trending", setActiveCategory }: CategoryNavProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (setActiveCategory) {
      setActiveCategory(categoryId);
    }
  };

  return (
    <nav className="w-full overflow-x-auto pb-2 hide-scrollbar">
      <div className="flex gap-2 min-w-max">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "rounded-full text-sm transition-all duration-300",
              activeCategory === category.id ? "bg-primary" : "hover:bg-muted"
            )}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </nav>
  );
}
