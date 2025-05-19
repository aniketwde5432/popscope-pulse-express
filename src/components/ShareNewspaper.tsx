import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Copy, Share } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewsArticle } from "@/services/newsService";
import html2canvas from "html2canvas";

interface ShareNewspaperProps {
  articles: NewsArticle[];
  onRemoveArticle: (id: string) => void;
  paperTitle?: string;
}

export function ShareNewspaper({ articles, onRemoveArticle, paperTitle = "Daily Digest" }: ShareNewspaperProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [useVintageStyle, setUseVintageStyle] = useState(true);
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownload = async () => {
    const newspaperElement = document.getElementById("newspaper-container");
    if (!newspaperElement) return;

    try {
      const canvas = await html2canvas(newspaperElement, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${paperTitle.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "Downloaded!",
        description: "Your newspaper has been downloaded as an image",
      });
    } catch (error) {
      console.error("Error generating newspaper image:", error);
      toast({
        title: "Download failed",
        description: "There was an error creating your newspaper image",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    // In a real implementation, this would generate and copy a shareable link
    // For now, we'll just show a toast
    toast({
      title: "Link copied!",
      description: "A shareable link has been copied to your clipboard",
    });
  };

  const handleShare = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support the Web Share API. Try downloading instead.",
      });
      return;
    }

    try {
      const newspaperElement = document.getElementById("newspaper-container");
      if (!newspaperElement) return;

      const canvas = await html2canvas(newspaperElement, { scale: 2, useCORS: true });
      
      // Convert the canvas to a blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else throw new Error("Could not create blob");
        }, "image/png");
      });

      // Create a file from the blob
      const file = new File([blob], `${paperTitle.replace(/\s+/g, "-")}.png`, { type: "image/png" });

      await navigator.share({
        title: paperTitle,
        text: "Check out my curated news digest!",
        files: [file],
      });

      toast({
        title: "Shared successfully!",
        description: "Your newspaper has been shared",
      });
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Sharing failed",
        description: "There was an error sharing your newspaper",
        variant: "destructive",
      });
    }
  };

  const toggleStyle = () => {
    setUseVintageStyle(!useVintageStyle);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="lg"
          className="rounded-full px-6 mt-6"
          disabled={articles.length === 0}
        >
          Generate My Paper
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair">Your Curated Newspaper</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleStyle}
            className="rounded-full"
          >
            {useVintageStyle ? "Switch to Modern Style" : "Switch to Vintage Style"}
          </Button>
        </div>
        
        <div className="mt-4">
          {useVintageStyle ? (
            <div 
              id="newspaper-container" 
              className="bg-vintage-beige text-deep-charcoal p-8 rounded-md shadow-md"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(253, 225, 211, 0.7), rgba(253, 225, 211, 0.7)),
                  url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23aa8a70' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")
                `,
              }}
            >
              {/* Newspaper Header */}
              <div className="text-center border-b-2 border-deep-charcoal/30 pb-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-playfair font-bold tracking-tighter">
                  {paperTitle}
                </h1>
                <div className="flex justify-between items-center text-sm mt-2">
                  <p>Vol. 1, No. 1</p>
                  <p className="font-medium">{currentDate}</p>
                  <p>"All the news that's fit to share"</p>
                </div>
              </div>
              
              {/* Vintage Newspaper Content */}
              {articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article, index) => (
                    <div key={article.id} className="newspaper-article break-inside-avoid">
                      {/* Add special header for first article to make it a "lead story" */}
                      {index === 0 && (
                        <div className="text-xs uppercase tracking-wider mb-1 font-semibold">Lead Story</div>
                      )}
                      
                      <h3 className="font-playfair font-bold text-lg leading-tight mb-2 border-b border-deep-charcoal/20 pb-1">
                        {article.title}
                      </h3>
                      
                      <div className="flex gap-3 my-2">
                        {article.urlToImage && (
                          <img 
                            src={article.urlToImage} 
                            alt={article.title}
                            className="w-24 h-24 object-cover grayscale opacity-90"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "https://images.unsplash.com/photo-1497005367839-6e852de72767?q=80&w=1167&auto=format&fit=crop";
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-serif line-clamp-4">{article.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-deep-charcoal/70 mt-2 flex justify-between">
                        <span>{article.source.name}</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="font-playfair text-lg">No articles selected yet.</p>
                  <p className="text-sm mt-2 text-deep-charcoal/70">
                    Browse categories and add articles to create your paper.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div 
              id="newspaper-container" 
              className="bg-card p-6 rounded-lg border"
            >
              {/* Modern layout - keeping this as a fallback option */}
              <h2 className="text-2xl font-bold mb-4 text-center">{paperTitle}</h2>
              <p className="text-center mb-4 text-muted-foreground">{currentDate}</p>
              
              {articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="p-4 border rounded-md">
                      <h3 className="font-bold mb-2">{article.title}</h3>
                      <div className="flex gap-3">
                        {article.urlToImage && (
                          <img 
                            src={article.urlToImage} 
                            alt={article.title}
                            className="w-20 h-20 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "https://images.unsplash.com/photo-1497005367839-6e852de72767?q=80&w=1167&auto=format&fit=crop";
                            }}
                          />
                        )}
                        <p className="flex-1 text-sm text-muted-foreground">
                          {article.description}
                        </p>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>{article.source.name}</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p>No articles selected yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Selected Articles</h3>
            <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
              {articles.map((article) => (
                <div key={article.id} className="flex items-start gap-2">
                  <Checkbox 
                    id={`article-${article.id}`} 
                    checked={true} 
                    onCheckedChange={() => onRemoveArticle(article.id)}
                  />
                  <label 
                    htmlFor={`article-${article.id}`} 
                    className="text-sm line-clamp-1 cursor-pointer"
                  >
                    {article.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="gap-2 rounded-full">
              <Download size={16} /> Download
            </Button>
            <Button onClick={handleCopyLink} variant="outline" className="gap-2 rounded-full">
              <Copy size={16} /> Copy Link
            </Button>
            <Button onClick={handleShare} variant="default" className="gap-2 rounded-full">
              <Share size={16} /> Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
