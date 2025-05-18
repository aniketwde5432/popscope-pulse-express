
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/services/newsService";
import { cn } from "@/lib/utils";

export function FeaturedNews({ article }: { article?: NewsArticle }) {
  if (!article) {
    return null;
  }

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
    <div className="relative w-full overflow-hidden rounded-lg bg-gradient-to-b from-transparent to-deep-charcoal mb-8">
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        {article.urlToImage ? (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-lg text-muted-foreground">No Featured Image Available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
          <div className="mb-2 flex gap-2">
            {article.isBreaking && <span className="badge-breaking card-badge">Breaking</span>}
            {article.isTrending && <span className="badge-trending card-badge">Trending</span>}
            {article.isEditorsPick && <span className="badge-editors card-badge">Editor's Pick</span>}
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair font-bold mb-2">
            {article.title}
          </h2>
          
          <p className="text-lg opacity-90 mb-4 line-clamp-2">
            {article.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-75">
              <span className="font-semibold">{article.source.name}</span> • {formatPublishDate(article.publishedAt)}
            </div>
            <Button asChild variant="secondary" className="rounded-full">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read Full Story
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
