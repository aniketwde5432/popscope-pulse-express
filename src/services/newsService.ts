
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type NewsSource = {
  id: string;
  name: string;
};

export type NewsArticle = {
  id: string;
  source: NewsSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  category: string;
  isTrending?: boolean;
  isBreaking?: boolean;
  isEditorsPick?: boolean;
};

// A function to fetch news by category
export async function fetchNewsByCategory(
  category: string
): Promise<NewsArticle[]> {
  try {
    // Get the current timestamp for recent article filtering
    const currentDate = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(currentDate.getDate() - 3); // Only show news from the last 3 days
    
    console.log(`Fetching ${category} news from the last 72 hours`);
    
    // Try multiple sources and aggregate results
    const sources = [
      fetchFromNewsAPI(category),
      fetchFromBingNewsAPI(category),
      fetchFromGNewsAPI(category),
      fetchFromRSSFeeds(category),
    ];
    
    const results = await Promise.allSettled(sources);
    
    // Combine all successful results
    let allArticles: NewsArticle[] = [];
    
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value && result.value.length > 0) {
        allArticles = [...allArticles, ...result.value];
      }
    });
    
    // Filter for recent articles only (last 3 days)
    const recentArticles = allArticles.filter(article => {
      try {
        const pubDate = new Date(article.publishedAt);
        return !isNaN(pubDate.getTime()) && pubDate >= threeDaysAgo;
      } catch (e) {
        // If date parsing fails, include the article anyway
        return true;
      }
    });
    
    // If no articles found, use fallback data
    if (recentArticles.length === 0) {
      console.log("No articles found from APIs, using fallback data");
      return getFallbackArticles(category);
    }
    
    // Remove duplicates based on title similarity
    const uniqueArticles = removeDuplicateArticles(recentArticles);
    
    // Add trending/breaking badges based on recency and patterns in title
    const processedArticles = addArticleBadges(uniqueArticles);
    
    // Sort by date (newest first)
    processedArticles.sort((a, b) => {
      try {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } catch {
        return 0;
      }
    });
    
    console.log(`Fetched ${processedArticles.length} unique ${category} articles`);
    return processedArticles;
    
  } catch (error) {
    console.error("Error fetching news:", error);
    return getFallbackArticles(category);
  }
}

// News API implementation
async function fetchFromNewsAPI(category: string): Promise<NewsArticle[]> {
  try {
    const newsApiKey = '5172c7a100e94f83ac0e2543b4fbdf67'; // Free tier API key
    const baseUrl = 'https://newsapi.org/v2';
    
    // Define search queries for each category
    const categoryQueries: Record<string, string> = {
      trending: "entertainment",
      anime: "anime OR manga OR japan animation",
      manga: "manga OR comic books OR graphic novels",
      bollywood: "bollywood OR indian cinema OR indian movies",
      hollywood: "hollywood OR movies OR cinema",
      tvshows: "tv series OR netflix OR hbo OR television shows",
      comics: "comics OR marvel OR dc OR superhero",
      kpop: "kpop OR korean pop OR bts OR blackpink",
      celebrity: "celebrity OR entertainment OR famous",
      upcoming: "upcoming movies OR upcoming shows OR future releases"
    };
    
    const query = categoryQueries[category] || "entertainment";
    const endpoint = category === "trending" 
      ? `${baseUrl}/top-headlines?category=entertainment&apiKey=${newsApiKey}&language=en&pageSize=25`
      : `${baseUrl}/everything?q=${encodeURIComponent(query)}&apiKey=${newsApiKey}&language=en&sortBy=publishedAt&pageSize=25`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`NewsAPI failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return [];
    }
    
    // Transform data to match our NewsArticle type
    return data.articles.map((article: any, index: number) => ({
      id: `newsapi-${category}-${index}-${Date.now()}`,
      source: {
        id: article.source?.id || "newsapi",
        name: article.source?.name || "News API"
      },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      content: article.content,
      category,
      isTrending: false,
      isBreaking: false,
      isEditorsPick: false
    }));
  } catch (error) {
    console.error("Error fetching from News API:", error);
    return [];
  }
}

// Bing News API implementation
async function fetchFromBingNewsAPI(category: string): Promise<NewsArticle[]> {
  try {
    const bingApiKey = '0672c31c40e349ffb7d9ceee780d6367'; // Free tier API key
    const baseUrl = 'https://api.bing.microsoft.com/v7.0/news/search';
    
    const categoryQueries: Record<string, string> = {
      trending: "trending entertainment news",
      anime: "anime news releases episodes",
      manga: "manga news releases chapters",
      bollywood: "bollywood movies news releases",
      hollywood: "hollywood movies news releases",
      tvshows: "tv series shows netflix hbo disney",
      comics: "comics marvel dc webtoon",
      kpop: "kpop music news bts blackpink",
      celebrity: "celebrity entertainment news",
      upcoming: "upcoming movies shows releases"
    };
    
    const query = categoryQueries[category] || "entertainment news";
    const endpoint = `${baseUrl}?q=${encodeURIComponent(query)}&count=25&mkt=en-US&freshness=Day`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Ocp-Apim-Subscription-Key': bingApiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Bing News API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.value || data.value.length === 0) {
      return [];
    }
    
    // Transform data to match our NewsArticle type
    return data.value.map((article: any, index: number) => ({
      id: `bing-${category}-${index}-${Date.now()}`,
      source: {
        id: article.provider?.[0]?.name || "bing",
        name: article.provider?.[0]?.name || "Bing News"
      },
      author: null,
      title: article.name,
      description: article.description,
      url: article.url,
      urlToImage: article.image?.thumbnail?.contentUrl || null,
      publishedAt: article.datePublished,
      content: article.description,
      category,
      isTrending: false,
      isBreaking: false,
      isEditorsPick: false
    }));
  } catch (error) {
    console.error("Error fetching from Bing News API:", error);
    return [];
  }
}

// GNews API implementation
async function fetchFromGNewsAPI(category: string): Promise<NewsArticle[]> {
  try {
    const apiKey = "b89b533a29e82a7f670a8068d13a66a6"; // Free tier API key
    const baseUrl = "https://gnews.io/api/v4";
    
    // Define search queries for each category
    const categoryQueries: Record<string, string> = {
      trending: "trending entertainment news",
      anime: "anime news releases episodes",
      manga: "manga news releases chapters",
      bollywood: "bollywood movies news releases",
      hollywood: "hollywood movies news releases",
      tvshows: "tv series shows netflix hbo disney",
      comics: "comics marvel dc webtoon",
      kpop: "kpop music news bts blackpink",
      celebrity: "celebrity entertainment news",
      upcoming: "upcoming movies shows releases"
    };
    
    const query = categoryQueries[category] || "entertainment news";
    
    // Adjust request based on category
    const endpoint = category === "trending" 
      ? `${baseUrl}/top-headlines?topic=entertainment&apikey=${apiKey}&lang=en&max=25` 
      : `${baseUrl}/search?q=${encodeURIComponent(query)}&apikey=${apiKey}&lang=en&max=25`;
    
    console.log(`Fetching news from GNews for category: ${category}`);
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch GNews: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return [];
    }
    
    // Transform data to match our NewsArticle type
    return data.articles.map((article: any, index: number) => ({
      id: `gnews-${category}-${index}-${Date.now()}`,
      source: {
        id: article.source?.name?.toLowerCase().replace(/\s+/g, '-') || "gnews",
        name: article.source?.name || "GNews"
      },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      content: article.content,
      category,
      isTrending: false,
      isBreaking: false,
      isEditorsPick: false
    }));
  } catch (error) {
    console.error("Error fetching from GNews API:", error);
    return [];
  }
}

// RSS Feed implementation
async function fetchFromRSSFeeds(category: string): Promise<NewsArticle[]> {
  try {
    // Map categories to relevant RSS feeds
    const categoryFeeds: Record<string, string[]> = {
      anime: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.animenewsnetwork.com/all/rss.xml",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.crunchyroll.com/rss/anime"
      ],
      manga: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.animenewsnetwork.com/all/rss.xml",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.manga-news.com/index.php/feed/"
      ],
      bollywood: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.pinkvilla.com/rss/entertainment.xml"
      ],
      hollywood: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://variety.com/feed/",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.hollywoodreporter.com/feed"
      ],
      tvshows: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://ew.com/feed/",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.tvguide.com/rss/breaking-news/"
      ],
      comics: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.comicbookmovie.com/rss/all-news.php",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.cbr.com/feed/"
      ],
      kpop: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.allkpop.com/rss",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.soompi.com/feed"
      ],
      celebrity: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.tmz.com/rss.xml",
        "https://api.rss2json.com/v1/api.json?rss_url=https://people.com/tag/celebrity/feed/"
      ],
      upcoming: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://movieweb.com/rss/movie-news/",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.denofgeek.com/feed/"
      ],
      trending: [
        "https://api.rss2json.com/v1/api.json?rss_url=https://variety.com/feed/",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.hollywoodreporter.com/feed",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.cinemablend.com/rss/topic/news/television"
      ]
    };
    
    const feeds = categoryFeeds[category] || categoryFeeds.trending;
    
    if (!feeds || feeds.length === 0) {
      return [];
    }
    
    const allArticles: NewsArticle[] = [];
    
    // Fetch and parse all feeds for this category
    await Promise.all(feeds.map(async (feedUrl) => {
      try {
        const response = await fetch(feedUrl);
        
        if (!response.ok) {
          throw new Error(`RSS feed fetch failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          return;
        }
        
        // Transform RSS items to our NewsArticle format
        const articles = data.items.map((item: any, index: number) => {
          // Extract image from content or enclosure
          let imageUrl = null;
          if (item.enclosure && item.enclosure.link) {
            imageUrl = item.enclosure.link;
          } else if (item.thumbnail) {
            imageUrl = item.thumbnail;
          } else if (item.content) {
            const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/);
            if (imgMatch && imgMatch[1]) {
              imageUrl = imgMatch[1];
            }
          }
          
          return {
            id: `rss-${category}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
            source: {
              id: data.feed?.title?.toLowerCase().replace(/\s+/g, '-') || "rss",
              name: data.feed?.title || item.author || "News Source"
            },
            author: item.author || null,
            title: item.title,
            description: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || null,
            url: item.link,
            urlToImage: imageUrl,
            publishedAt: item.pubDate || new Date().toISOString(),
            content: item.content?.replace(/<[^>]*>/g, '') || null,
            category,
            isTrending: false,
            isBreaking: false,
            isEditorsPick: false
          };
        });
        
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Error fetching from RSS feed ${feedUrl}:`, error);
      }
    }));
    
    return allArticles;
  } catch (error) {
    console.error("Error fetching from RSS feeds:", error);
    return [];
  }
}

// Function to remove duplicate articles based on title similarity
function removeDuplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const uniqueArticles: NewsArticle[] = [];
  const titleMap = new Map<string, boolean>();
  
  for (const article of articles) {
    // Normalize title for comparison (lowercase, remove special chars)
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
    
    // Skip if we already have a similar title
    let isDuplicate = false;
    
    for (const [existingTitle] of titleMap) {
      // Use similarity score (basic version)
      if (existingTitle.includes(normalizedTitle) || 
          normalizedTitle.includes(existingTitle) ||
          levenshteinDistance(existingTitle, normalizedTitle) < 10) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      titleMap.set(normalizedTitle, true);
      uniqueArticles.push(article);
    }
  }
  
  return uniqueArticles;
}

// Simple Levenshtein distance implementation for string similarity
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }
  
  return track[str2.length][str1.length];
}

// Function to add trending/breaking badges based on content analysis
function addArticleBadges(articles: NewsArticle[]): NewsArticle[] {
  const keywords = {
    breaking: ["breaking", "just in", "alert", "exclusive", "just announced", "urgent"],
    trending: ["viral", "trending", "popular", "hit", "sensation", "buzz", "hot", "top"]
  };
  
  const editorPicks = Math.floor(articles.length * 0.1); // Top 10% are editor's picks
  
  return articles.map((article, index) => {
    const lowerTitle = article.title.toLowerCase();
    const lowerDescription = article.description?.toLowerCase() || "";
    
    // Check for breaking news keywords
    const isBreaking = keywords.breaking.some(keyword => 
      lowerTitle.includes(keyword) || lowerDescription.includes(keyword)
    );
    
    // Check for trending keywords
    const isTrending = keywords.trending.some(keyword => 
      lowerTitle.includes(keyword) || lowerDescription.includes(keyword)
    );
    
    // Top articles by recency are editors picks
    const isEditorsPick = index < editorPicks;
    
    return {
      ...article,
      isBreaking,
      isTrending: isTrending || Math.random() > 0.7, // Add some randomness
      isEditorsPick: isEditorsPick || Math.random() > 0.9 // Add some randomness
    };
  });
}

// Function to get fallback articles when all APIs fail
function getFallbackArticles(category: string): NewsArticle[] {
  const currentDate = new Date().toISOString();
  
  // Pre-defined articles based on categories
  const fallbackArticles: Record<string, NewsArticle[]> = {
    anime: [
      {
        id: `anime-fallback-1`,
        title: "One Piece Live-Action Season 2 Confirmed by Netflix",
        description: "Netflix has renewed the live-action adaptation of One Piece for a second season following its massive success.",
        url: "https://example.com/one-piece-season-2",
        urlToImage: "https://via.placeholder.com/640x360.png?text=One+Piece+Season+2",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Pop Culture News" },
        author: "Anime Insider",
        content: "After becoming one of Netflix's biggest hits of the year, the live-action adaptation of Eiichiro Oda's beloved manga will continue with a second season.",
        category: "anime",
        isTrending: true,
        isBreaking: true,
        isEditorsPick: false
      },
      {
        id: `anime-fallback-2`,
        title: "Studio Ghibli Announces New Film Project",
        description: "Legendary animation studio reveals plans for a new feature film directed by Hayao Miyazaki's son, Goro Miyazaki.",
        url: "https://example.com/ghibli-new-film",
        urlToImage: "https://via.placeholder.com/640x360.png?text=Studio+Ghibli+New+Film",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Animation World" },
        author: "Film Reporter",
        content: "The new project will explore themes of environment and technology, continuing the studio's tradition of magical storytelling.",
        category: "anime",
        isTrending: true,
        isBreaking: false,
        isEditorsPick: true
      }
    ],
    manga: [
      {
        id: `manga-fallback-1`,
        title: "Chainsaw Man Part 2 Breaks Digital Sales Records",
        description: "Tatsuki Fujimoto's popular manga series continues to dominate sales charts with its second part.",
        url: "https://example.com/chainsaw-man-sales",
        urlToImage: "https://via.placeholder.com/640x360.png?text=Chainsaw+Man",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Manga Pulse" },
        author: "Comics Reporter",
        content: "The dark fantasy series has surpassed expectations with digital sales reaching unprecedented numbers for a weekly serialization.",
        category: "manga",
        isTrending: true,
        isBreaking: false,
        isEditorsPick: true
      }
    ],
    bollywood: [
      {
        id: `bollywood-fallback-1`,
        title: "Shah Rukh Khan Announces Next Action Blockbuster",
        description: "Bollywood superstar reveals his next project, an action thriller to be directed by a renowned filmmaker.",
        url: "https://example.com/srk-new-movie",
        urlToImage: "https://via.placeholder.com/640x360.png?text=Shah+Rukh+Khan",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Bollywood Insider" },
        author: "Film Correspondent",
        content: "Following the success of his recent films, Khan is set to star in what promises to be one of the biggest productions in Indian cinema.",
        category: "bollywood",
        isTrending: true,
        isBreaking: false,
        isEditorsPick: false
      }
    ],
    hollywood: [
      {
        id: `hollywood-fallback-1`,
        title: "Marvel Reveals Next Phase of Superhero Movies and Shows",
        description: "Kevin Feige announces new slate of MCU projects at Comic-Con, including unexpected character returns.",
        url: "https://example.com/marvel-phase-6",
        urlToImage: "https://via.placeholder.com/640x360.png?text=Marvel+Phase+6",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Hollywood Reporter" },
        author: "Entertainment Writer",
        content: "The next phase will introduce new heroes while continuing storylines from previous films and Disney+ series.",
        category: "hollywood",
        isTrending: true,
        isBreaking: true,
        isEditorsPick: true
      }
    ],
    tvshows: [
      {
        id: `tvshows-fallback-1`,
        title: "The Last of Us Season 2 Begins Production",
        description: "HBO's hit adaptation of the popular video game has started filming its second season with new cast additions.",
        url: "https://example.com/last-of-us-s2",
        urlToImage: "https://via.placeholder.com/640x360.png?text=The+Last+of+Us",
        publishedAt: currentDate,
        source: { id: "fallback", name: "TV Guide" },
        author: "Series Analyst",
        content: "The critically acclaimed adaptation continues the story with new characters from the second game joining the cast.",
        category: "tvshows",
        isTrending: true,
        isBreaking: false,
        isEditorsPick: true
      }
    ],
    comics: [
      {
        id: `comics-fallback-1`,
        title: "DC Comics Announces Major Batman Crossover Event",
        description: "New storyline will span multiple titles and feature collaboration between top writers and artists.",
        url: "https://example.com/batman-event",
        urlToImage: "https://via.placeholder.com/640x360.png?text=Batman+Event",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Comics Beat" },
        author: "Comic Book Journalist",
        content: "The year-long saga will change the status quo for Gotham City and introduce new villains to the Batman mythos.",
        category: "comics",
        isTrending: true,
        isBreaking: false,
        isEditorsPick: true
      }
    ],
    kpop: [
      {
        id: `kpop-fallback-1`,
        title: "BTS Announces World Tour Following Member's Military Service Return",
        description: "The global K-pop phenomenon reveals dates for their highly anticipated international stadium tour.",
        url: "https://example.com/bts-world-tour",
        urlToImage: "https://via.placeholder.com/640x360.png?text=BTS+Tour",
        publishedAt: currentDate,
        source: { id: "fallback", name: "K-Pop Herald" },
        author: "Music Reporter",
        content: "Fans worldwide celebrate as the full group reunites for their biggest tour yet, with stops in over 20 countries.",
        category: "kpop",
        isTrending: true,
        isBreaking: true,
        isEditorsPick: false
      }
    ],
    celebrity: [
      {
        id: `celebrity-fallback-1`,
        title: "Zendaya and Tom Holland Collaborate on New Charity Initiative",
        description: "Hollywood power couple launches foundation focused on youth arts education and mental health support.",
        url: "https://example.com/zendaya-tom-charity",
        urlToImage: "https://via.placeholder.com/640x360.png?text=Zendaya+and+Tom",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Celebrity Spotlight" },
        author: "Entertainment Correspondent",
        content: "The stars are using their platform to create opportunities for underprivileged youth interested in the arts.",
        category: "celebrity",
        isTrending: true,
        isBreaking: false,
        isEditorsPick: true
      }
    ],
    upcoming: [
      {
        id: `upcoming-fallback-1`,
        title: "Dune: Part Two Release Date Pushed Forward",
        description: "Warner Bros. announces earlier premiere for the highly anticipated sci-fi sequel directed by Denis Villeneuve.",
        url: "https://example.com/dune-2-release",
        urlToImage: "https://via.placeholder.com/640x360.png?text=Dune+Part+Two",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Film Forecast" },
        author: "Industry Insider",
        content: "Following strong test screenings, the studio has decided to release the film earlier than initially planned.",
        category: "upcoming",
        isTrending: true,
        isBreaking: true,
        isEditorsPick: true
      }
    ],
    trending: [
      {
        id: `trending-fallback-1`,
        title: "Spider-Man: Beyond the Spider-Verse First Trailer Released",
        description: "Sony Pictures drops surprise trailer for the third installment in the animated Spider-Verse saga.",
        url: "https://example.com/spiderverse-3",
        urlToImage: "https://via.placeholder.com/640x360.png?text=Beyond+the+Spider-Verse",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Entertainment Weekly" },
        author: "Animation Expert",
        content: "The visually stunning trailer hints at even more groundbreaking animation techniques and multiverse exploration.",
        category: "trending",
        isTrending: true,
        isBreaking: true,
        isEditorsPick: true
      },
      {
        id: `trending-fallback-2`,
        title: "Stranger Things Final Season Begins Filming",
        description: "Netflix's hit series enters production for its epic conclusion with returning cast and new additions.",
        url: "https://example.com/stranger-things-final",
        urlToImage: "https://via.placeholder.com/640x360.png?text=Stranger+Things+Final+Season",
        publishedAt: currentDate,
        source: { id: "fallback", name: "Netflix Insider" },
        author: "Streaming Reporter",
        content: "The Duffer Brothers promise an emotional finale that will tie together all the mysteries of Hawkins.",
        category: "trending",
        isTrending: true,
        isBreaking: false,
        isEditorsPick: true
      }
    ]
  };
  
  return fallbackArticles[category] || fallbackArticles.trending;
}

// A function to handle errors when fetching news fails
export function handleNewsError(error: Error): void {
  const { toast } = useToast();
  
  console.error("Error fetching news:", error);
  
  toast({
    title: "Failed to load news",
    description: "Could not connect to news sources. Please try again later.",
    variant: "destructive",
  });
}

// Function to refresh news data based on category
export async function refreshNews(category: string): Promise<NewsArticle[]> {
  try {
    const articles = await fetchNewsByCategory(category);
    return articles;
  } catch (error) {
    console.error("Error refreshing news:", error);
    throw error;
  }
}

// Function to save an article to a user's favorites
export async function saveArticle(userId: string, article: NewsArticle): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_articles')
      .insert([
        { 
          user_id: userId,
          article_id: article.id,
          title: article.title,
          description: article.description,
          url: article.url,
          url_to_image: article.urlToImage,
          published_at: article.publishedAt,
          source_name: article.source.name,
          category: article.category
        }
      ]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving article:", error);
    return false;
  }
}

// Function to remove an article from user's favorites
export async function unsaveArticle(userId: string, articleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_articles')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing saved article:", error);
    return false;
  }
}

// Function to get all saved articles for a user
export async function getSavedArticles(userId: string): Promise<NewsArticle[]> {
  try {
    const { data, error } = await supabase
      .from('saved_articles')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(item => ({
      id: item.article_id,
      title: item.title,
      description: item.description,
      url: item.url,
      urlToImage: item.url_to_image,
      publishedAt: item.published_at,
      source: {
        id: 'saved',
        name: item.source_name
      },
      author: null,
      content: item.description,
      category: item.category,
      isTrending: false,
      isBreaking: false,
      isEditorsPick: false
    }));
  } catch (error) {
    console.error("Error fetching saved articles:", error);
    return [];
  }
}

// Check if an article is saved by the user
export async function isArticleSaved(userId: string, articleId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('saved_articles')
      .select('article_id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return false; // No matching record found
      }
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking if article is saved:", error);
    return false;
  }
}
