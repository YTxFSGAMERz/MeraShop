'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryPillsProps {
  categories: Category[];
  activeCategory?: string;
  onSelect: (slug: string | null) => void;
  className?: string;
}

export function CategoryPills({
  categories,
  activeCategory,
  onSelect,
  className,
}: CategoryPillsProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="scrollbar-hide -mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
        {/* "All" pill */}
        <Button
          variant={activeCategory === undefined || activeCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(null)}
          className="shrink-0 rounded-full px-4 h-8 text-sm"
        >
          All
        </Button>

        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.slug ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(cat.slug)}
            className="shrink-0 rounded-full px-4 h-8 text-sm whitespace-nowrap"
          >
            {cat.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
