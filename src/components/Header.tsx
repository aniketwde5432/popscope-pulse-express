
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border backdrop-blur-md bg-opacity-90">
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-primary">
            PopScope <span className="text-foreground">Express</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="animate-fade-in flex items-center">
              <Input
                type="text"
                placeholder="Search news..."
                className="max-w-[200px] focus-visible:ring-primary"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="rounded-full"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          <ThemeToggle />
          <Button variant="outline" size="sm" className="hidden md:flex rounded-full">
            Sign In
          </Button>
          <Button size="sm" className="rounded-full hidden md:flex">
            Create Account
          </Button>
        </div>
      </div>
    </header>
  );
}
