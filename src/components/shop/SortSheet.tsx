'use client';

import { ArrowUpDown, Check } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SortOption =
  | 'popularity'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'rating'
  | 'discount';

interface SortSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: SortOption;
  onSort: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'discount', label: 'Discount' },
];

export function SortSheet({ isOpen, onClose, currentSort, onSort }: SortSheetProps) {
  const handleSelect = (value: SortOption) => {
    onSort(value);
    onClose();
  };

  return (
    <Drawer open={isOpen} onClose={onClose} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-5" />
            <DrawerTitle>Sort By</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <div className="space-y-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  currentSort === option.value
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <span>{option.label}</span>
                {currentSort === option.value && (
                  <Check className="size-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        <DrawerFooter className="border-t pt-4">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
