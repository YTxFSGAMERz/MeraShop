'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ArrowRight,
  Smartphone,
  Headphones,
  Footprints,
  Droplets,
  Laptop,
  Trash2,
  Mic,
  MicOff,
  Shirt,
  Watch,
  Sparkles,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/constants';

// ── Trending Searches with icons ────────────────────────────────────────────
const TRENDING_SEARCHES = [
  { text: 'Smartphones', icon: Smartphone },
  { text: 'Earbuds', icon: Headphones },
  { text: 'Running Shoes', icon: Footprints },
  { text: 'Face Wash', icon: Droplets },
  { text: 'Laptop', icon: Laptop },
];

// ── Popular search categories ───────────────────────────────────────────────
const POPULAR_CATEGORIES = [
  { text: 'Popular in Electronics', icon: Smartphone, category: 'electronics' },
  { text: 'Popular in Fashion', icon: Shirt, category: 'fashion' },
  { text: 'Popular in Watches', icon: Watch, category: 'watches' },
  { text: 'Popular in Beauty', icon: Droplets, category: 'beauty' },
];

const RECENT_SEARCHES_KEY = 'merashop-recent-searches';
const MAX_RECENT = 8;

// ── Spelling suggestions map ────────────────────────────────────────────────
const SPELLING_SUGGESTIONS: Record<string, string> = {
  'samsang': 'Samsung',
  'samsumg': 'Samsung',
  'iphne': 'iPhone',
  'ipone': 'iPhone',
  'hadphones': 'Headphones',
  'hedphones': 'Headphones',
  'laptap': 'Laptop',
  'labtop': 'Laptop',
  'shoose': 'Shoes',
  'shooes': 'Shoes',
  'earbud': 'Earbuds',
  'erabuds': 'Earbuds',
  'mobail': 'Mobile',
  'mobil': 'Mobile',
  'fone': 'Phone',
  'phne': 'Phone',
  'watchs': 'Watches',
  'wach': 'Watch',
  'beuty': 'Beauty',
  'beauti': 'Beauty',
  'fasion': 'Fashion',
  'fashon': 'Fashion',
  'laptiop': 'Laptop',
  'electonics': 'Electronics',
  'electrnics': 'Electronics',
  'runing': 'Running',
  'shoese': 'Shoes',
};

// ── Helper: recent searches from localStorage ──────────────────────────────
function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentSearches();
    const updated = existing.filter((s) => s.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

function clearAllRecentSearches() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

// ── Recently viewed product IDs from localStorage ──────────────────────────
function getRecentlyViewedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('merashop-recently-viewed');
    if (!stored) return [];
    const data = JSON.parse(stored);
    return (data?.state?.items || []).slice(0, 5).map((item: { id: string }) => item.id);
  } catch {
    return [];
  }
}

interface ApiSuggestion {
  id: string;
  name: string;
  slug: string;
  primaryImage: string | null;
  effectivePrice: number;
  salePrice: number | null;
  basePrice: number;
  category: { name: string };
}

interface SearchSuggestion {
  type: 'trending' | 'recent' | 'api' | 'category' | 'popular-category';
  text: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onRemove?: () => void;
  isViewed?: boolean;
  image?: string | null;
  price?: number;
  salePrice?: number | null;
  basePrice?: number;
}

// ── Get spelling suggestion ─────────────────────────────────────────────────
function getSpellingSuggestion(query: string): string | null {
  const lower = query.toLowerCase().trim();
  // Direct match
  if (SPELLING_SUGGESTIONS[lower]) {
    return SPELLING_SUGGESTIONS[lower];
  }
  // Check each word
  const words = lower.split(/\s+/);
  for (const word of words) {
    if (SPELLING_SUGGESTIONS[word]) {
      return query.replace(new RegExp(word, 'i'), SPELLING_SUGGESTIONS[word]);
    }
  }
  return null;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [apiResults, setApiResults] = useState<ApiSuggestion[]>([]);
  const [apiCategories, setApiCategories] = useState<{ name: string; slug: string }[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const voiceSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Compute recent searches lazily on focus
  const loadRecentSearches = useCallback(() => {
    setRecentSearches(getRecentSearches());
    setRecentlyViewedIds(getRecentlyViewedIds());
  }, []);

  // Debounce the query input
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 2) {
      setApiResults([]);
      setApiCategories([]);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value.trim());
    }, 300);
  }, []);

  // Fetch API suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&type=all`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setApiResults((data.products || []).slice(0, 5));
        setApiCategories((data.categories || []).slice(0, 3));
      })
      .catch(() => {
        // aborted or failed
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  // Compute spelling suggestion
  const spellingSuggestion = useMemo(() => {
    if (debouncedQuery.length >= 2) {
      return getSpellingSuggestion(debouncedQuery);
    }
    return null;
  }, [debouncedQuery]);

  // Compute suggestions as derived state
  const suggestions: SearchSuggestion[] = useMemo(() => {
    if (debouncedQuery.length >= 2) {
      const items: SearchSuggestion[] = [];

      // API categories first
      apiCategories.forEach((cat) => {
        items.push({
          type: 'category',
          text: cat.name,
          subtitle: 'Category',
          href: `/shop?category=${cat.slug}`,
        });
      });

      // API product suggestions with thumbnails
      apiResults.forEach((product) => {
        items.push({
          type: 'api',
          text: product.name,
          subtitle: product.category?.name,
          href: `/product/${product.slug}`,
          isViewed: recentlyViewedIds.includes(product.id),
          image: product.primaryImage,
          price: product.effectivePrice,
          salePrice: product.salePrice,
          basePrice: product.basePrice,
        });
      });

      return items;
    }

    if (isFocused) {
      const items: SearchSuggestion[] = [];

      // Recent searches
      recentSearches.forEach((text) => {
        items.push({
          type: 'recent',
          text,
          onRemove: () => {
            removeRecentSearch(text);
            setRecentSearches(getRecentSearches());
          },
        });
      });

      // Trending searches
      TRENDING_SEARCHES.forEach(({ text, icon }) => {
        items.push({
          type: 'trending',
          text,
          icon,
        });
      });

      return items;
    }

    return [];
  }, [debouncedQuery, isFocused, recentSearches, apiResults, apiCategories, recentlyViewedIds]);

  // Auto-focus the input when the search bar appears
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ── Voice search ──────────────────────────────────────────────────────────
  const toggleVoiceSearch = useCallback(() => {
    if (!voiceSupported) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setQuery(transcript);
          setDebouncedQuery(transcript.trim());
          saveRecentSearch(transcript.trim());
          router.push(`/shop?search=${encodeURIComponent(transcript.trim())}`);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [isListening, voiceSupported, router]);

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setApiResults([]);
    setApiCategories([]);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const searchQuery = suggestion.text;
    setQuery(searchQuery);
    setDebouncedQuery(searchQuery);
    saveRecentSearch(searchQuery);
    setIsFocused(false);

    // Navigate
    if (suggestion.href) {
      router.push(suggestion.href);
    } else {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setIsFocused(false);
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleRemoveRecent = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentSearch(text);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAllRecent = () => {
    clearAllRecentSearches();
    setRecentSearches([]);
  };

  const hasRecentSearches = recentSearches.length > 0 && debouncedQuery.length < 2;

  return (
    <div className="relative w-full">
      {/* Search Input - larger with rounded corners and subtle shadow on focus */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for products, brands & more..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            loadRecentSearches();
          }}
          onBlur={() => {
            // Delay to allow click on suggestions
            setTimeout(() => setIsFocused(false), 200);
          }}
          className={cn(
            'pl-10 pr-20 h-11 md:h-12 text-sm md:text-base bg-background rounded-xl',
            'shadow-sm focus:shadow-md focus:shadow-primary/5 transition-all duration-200',
            'border-border/60 focus:border-primary/30',
            isListening && 'ring-2 ring-red-400 border-red-300'
          )}
        />
        <div className="absolute right-1.5 flex items-center gap-0.5">
          {/* Voice search button */}
          {voiceSupported && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'size-8 hover:bg-muted rounded-lg transition-colors',
                isListening && 'bg-red-50 hover:bg-red-100 text-red-600'
              )}
              type="button"
              onClick={toggleVoiceSearch}
              aria-label={isListening ? 'Stop voice search' : 'Voice search'}
            >
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div
                    key="listening"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="relative"
                  >
                    <MicOff className="size-4 text-red-500" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-red-400"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mic"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Mic className="size-4 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          )}
          {/* Fallback mic icon if no browser support */}
          {!voiceSupported && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-muted rounded-lg"
              type="button"
              aria-label="Voice search not supported"
            >
              <Mic className="size-4 text-muted-foreground" />
            </Button>
          )}
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-muted rounded-lg"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (suggestions.length > 0 || spellingSuggestion) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Spelling suggestion */}
            {spellingSuggestion && debouncedQuery.length >= 2 && (
              <>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery(spellingSuggestion);
                    setDebouncedQuery(spellingSuggestion);
                    handleQueryChange(spellingSuggestion);
                  }}
                >
                  <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
                  <span className="text-muted-foreground">Did you mean:</span>
                  <span className="text-primary font-medium">{spellingSuggestion}</span>
                </button>
                <Separator />
              </>
            )}

            {/* Trending section header when no query */}
            {debouncedQuery.length < 2 && hasRecentSearches && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 flex items-center justify-between">
                  <span>Recent Searches</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleClearAllRecent();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 normal-case tracking-normal font-medium"
                  >
                    <Trash2 className="size-2.5" />
                    Clear all
                  </button>
                </div>
                {suggestions
                  .filter((s) => s.type === 'recent')
                  .map((suggestion, i) => (
                    <button
                      key={`recent-${suggestion.text}-${i}`}
                      type="button"
                      className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left gap-3 group"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Clock className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate text-foreground">
                        {suggestion.text}
                      </span>
                      <button
                        className="size-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                        onClick={(e) => suggestion.onRemove?.() || handleRemoveRecent(suggestion.text, e)}
                        aria-label={`Remove ${suggestion.text}`}
                      >
                        <X className="size-3 text-muted-foreground" />
                      </button>
                    </button>
                  ))}
                <Separator />
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <TrendingUp className="size-3 inline mr-1" />
                  Trending
                </div>
                {suggestions
                  .filter((s) => s.type === 'trending')
                  .map((suggestion, i) => {
                    const IconComp = suggestion.icon;
                    return (
                      <button
                        key={`trending-${suggestion.text}-${i}`}
                        type="button"
                        className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left gap-3"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {IconComp ? (
                          <IconComp className="size-3.5 text-primary shrink-0" />
                        ) : (
                          <TrendingUp className="size-3.5 text-primary shrink-0" />
                        )}
                        <span className="flex-1 truncate text-foreground">
                          {suggestion.text}
                        </span>
                        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}

                {/* Popular categories section */}
                <Separator />
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <Sparkles className="size-3 inline mr-1" />
                  Browse by Category
                </div>
                {POPULAR_CATEGORIES.map((cat, i) => {
                  const IconComp = cat.icon;
                  return (
                    <button
                      key={`pop-cat-${i}`}
                      type="button"
                      className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left gap-3"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setIsFocused(false);
                        router.push(`/shop?category=${cat.category}`);
                      }}
                    >
                      <IconComp className="size-3.5 text-primary shrink-0" />
                      <span className="flex-1 truncate text-foreground">{cat.text}</span>
                      <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </>
            )}

            {/* No recent searches, just show trending + popular categories */}
            {debouncedQuery.length < 2 && !hasRecentSearches && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <TrendingUp className="size-3 inline mr-1" />
                  Trending
                </div>
                {suggestions.map((suggestion, i) => {
                  const IconComp = suggestion.icon;
                  return (
                    <button
                      key={`trending-${suggestion.text}-${i}`}
                      type="button"
                      className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left gap-3"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {IconComp ? (
                        <IconComp className="size-3.5 text-primary shrink-0" />
                      ) : (
                        <TrendingUp className="size-3.5 text-primary shrink-0" />
                      )}
                      <span className="flex-1 truncate text-foreground">
                        {suggestion.text}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}

                {/* Popular categories */}
                <Separator />
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <Sparkles className="size-3 inline mr-1" />
                  Browse by Category
                </div>
                {POPULAR_CATEGORIES.map((cat, i) => {
                  const IconComp = cat.icon;
                  return (
                    <button
                      key={`pop-cat-${i}`}
                      type="button"
                      className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left gap-3"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setIsFocused(false);
                        router.push(`/shop?category=${cat.category}`);
                      }}
                    >
                      <IconComp className="size-3.5 text-primary shrink-0" />
                      <span className="flex-1 truncate text-foreground">{cat.text}</span>
                      <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </>
            )}

            {/* API results when query is typed */}
            {debouncedQuery.length >= 2 && (
              <>
                {apiCategories.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                      Categories
                    </div>
                    {suggestions
                      .filter((s) => s.type === 'category')
                      .map((suggestion, i) => (
                        <button
                          key={`cat-${suggestion.text}-${i}`}
                          type="button"
                          className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left gap-3"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Search className="size-3.5 text-primary shrink-0" />
                          <span className="flex-1 truncate text-foreground">
                            {suggestion.text}
                          </span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0">Category</Badge>
                          <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                  </>
                )}
                {apiResults.length > 0 && (
                  <>
                    {apiCategories.length > 0 && <Separator />}
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                      Products
                    </div>
                    {suggestions
                      .filter((s) => s.type === 'api')
                      .map((suggestion, i) => (
                        <button
                          key={`api-${suggestion.text}-${i}`}
                          type="button"
                          className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left gap-3"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {/* Product thumbnail */}
                          {suggestion.image ? (
                            <div className="size-10 rounded-md overflow-hidden shrink-0 bg-muted">
                              <Image
                                src={suggestion.image}
                                alt={suggestion.text}
                                width={40}
                                height={40}
                                className="size-full object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="size-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Search className="size-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-foreground text-sm">{suggestion.text}</p>
                              {/* "Viewed" badge for recently viewed products */}
                              {suggestion.isViewed && (
                                <Badge
                                  variant="secondary"
                                  className="text-[8px] px-1 py-0 h-3.5 gap-0.5 shrink-0 bg-primary/10 text-primary"
                                >
                                  <Eye className="size-2" />
                                  Viewed
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {suggestion.subtitle && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {suggestion.subtitle}
                                </span>
                              )}
                              {suggestion.basePrice != null && (
                                <span className="text-xs font-semibold text-foreground">
                                  {formatINR(suggestion.salePrice || suggestion.basePrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                  </>
                )}
                {apiResults.length === 0 && apiCategories.length === 0 && !spellingSuggestion && (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No results found for &ldquo;{debouncedQuery}&rdquo;
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
