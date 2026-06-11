'use client';

import { useState, useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RatingStars } from './RatingStars';
import { formatINR } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface FilterState {
  priceRange: [number, number];
  brands: string[];
  minRating: number;
  inStockOnly: boolean;
}

interface FilterSection {
  brands: { name: string; slug: string }[];
  priceMin: number;
  priceMax: number;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterSection;
  onApply: (filterState: FilterState) => void;
  currentFilters?: FilterState;
}

const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, 100000],
  brands: [],
  minRating: 0,
  inStockOnly: false,
};

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
  currentFilters = DEFAULT_FILTERS,
}: FilterDrawerProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>(currentFilters.priceRange);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentFilters.brands);
  const [minRating, setMinRating] = useState(currentFilters.minRating);
  const [inStockOnly, setInStockOnly] = useState(currentFilters.inStockOnly);

  const activeFilterCount =
    (priceRange[0] > filters.priceMin || priceRange[1] < filters.priceMax ? 1 : 0) +
    (selectedBrands.length > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const toggleBrand = useCallback((slug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug]
    );
  }, []);

  const handleApply = () => {
    onApply({
      priceRange,
      brands: selectedBrands,
      minRating,
      inStockOnly,
    });
    onClose();
  };

  const handleClearAll = () => {
    setPriceRange([filters.priceMin, filters.priceMax]);
    setSelectedBrands([]);
    setMinRating(0);
    setInStockOnly(false);
  };

  return (
    <Drawer open={isOpen} onClose={onClose} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-5" />
              <DrawerTitle>Filters</DrawerTitle>
              {activeFilterCount > 0 && (
                <Badge variant="default" className="h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="max-h-[60vh] overflow-y-auto px-4 pb-4 space-y-6 scrollbar-hide">
          {/* Price Range */}
          <section>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Price Range</h4>
            <Slider
              min={filters.priceMin}
              max={filters.priceMax}
              step={100}
              value={priceRange}
              onValueChange={(val) => setPriceRange(val as [number, number])}
              className="mb-2"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatINR(priceRange[0])}</span>
              <span>{formatINR(priceRange[1])}</span>
            </div>
          </section>

          <Separator />

          {/* Brands */}
          {filters.brands.length > 0 && (
            <section>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Brands</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                {filters.brands.map((brand) => (
                  <label
                    key={brand.slug}
                    className="flex items-center gap-3 cursor-pointer py-0.5"
                  >
                    <Checkbox
                      checked={selectedBrands.includes(brand.slug)}
                      onCheckedChange={() => toggleBrand(brand.slug)}
                    />
                    <span className="text-sm text-foreground">{brand.name}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <Separator />

          {/* Rating */}
          <section>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Customer Rating</h4>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    minRating === rating
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted'
                  )}
                >
                  <RatingStars rating={rating} size="sm" />
                  <span className="text-muted-foreground">& up</span>
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Availability */}
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Availability</h4>
                <p className="text-xs text-muted-foreground">Show only in-stock items</p>
              </div>
              <Switch checked={inStockOnly} onCheckedChange={setInStockOnly} />
            </div>
          </section>
        </div>

        <DrawerFooter className="border-t pt-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="shrink-0 text-sm"
            >
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-primary-foreground/20 text-primary-foreground border-0">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
