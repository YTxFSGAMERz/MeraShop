import Link from 'next/link';

import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItemData[];
  /** Max items to show on mobile before collapsing. Default: 2 */
  maxMobileItems?: number;
  /** Max items to show on desktop before collapsing. Default: 4 */
  maxDesktopItems?: number;
}

/**
 * Responsive breadcrumb navigation.
 * On mobile, collapses intermediate items with an ellipsis.
 * The last item is always the current page (non-clickable).
 */
export function BreadcrumbNav({
  items,
  maxMobileItems = 2,
  maxDesktopItems = 4,
}: BreadcrumbNavProps) {
  if (!items.length) return null;

  // Separate the last item (current page) from the rest
  const lastItem = items[items.length - 1];
  const precedingItems = items.slice(0, -1);

  return (
    <>
      {/* Desktop: Full breadcrumb */}
      <div className="hidden sm:block">
        <BreadcrumbRoot>
          <BreadcrumbList>
            {precedingItems.map((item, index) => (
              <span key={item.label} className="contents">
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground">{item.label}</span>
                  )}
                </BreadcrumbItem>
                {index < precedingItems.length && <BreadcrumbSeparator />}
              </span>
            ))}
            <BreadcrumbItem>
              <BreadcrumbPage>{lastItem.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </BreadcrumbRoot>
      </div>

      {/* Mobile: Collapsed breadcrumb */}
      <div className="sm:hidden">
        <BreadcrumbRoot>
          <BreadcrumbList>
            {renderMobileBreadcrumb(precedingItems, lastItem, maxMobileItems)}
          </BreadcrumbList>
        </BreadcrumbRoot>
      </div>
    </>
  );
}

/**
 * Renders a mobile-friendly breadcrumb that collapses intermediate items.
 */
function renderMobileBreadcrumb(
  preceding: BreadcrumbItemData[],
  last: BreadcrumbItemData,
  maxItems: number,
) {
  // If there are few enough items, show them all
  if (preceding.length <= maxItems) {
    return (
      <>
        {preceding.map((item, index) => (
          <span key={item.label} className="contents">
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <span className="text-muted-foreground">{item.label}</span>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </span>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{last.label}</BreadcrumbPage>
        </BreadcrumbItem>
      </>
    );
  }

  // Too many items — show first, ellipsis, then last
  const firstItem = preceding[0];

  return (
    <>
      <BreadcrumbItem>
        {firstItem.href ? (
          <BreadcrumbLink asChild>
            <Link href={firstItem.href}>{firstItem.label}</Link>
          </BreadcrumbLink>
        ) : (
          <span className="text-muted-foreground">{firstItem.label}</span>
        )}
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbEllipsis />
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{last.label}</BreadcrumbPage>
      </BreadcrumbItem>
    </>
  );
}
