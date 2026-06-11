'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Package,
  Truck,
  Tag,
  TrendingDown,
  MessageSquare,
  CheckCheck,
  ExternalLink,
  ShoppingCart,
  Star,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

// ── Types ───────────────────────────────────────────────────────────────────
type NotificationType = 'order' | 'delivery' | 'promo' | 'price_drop' | 'review' | 'back_in_stock' | 'recommendation';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// ── Icon mapping by type ────────────────────────────────────────────────────
const NOTIFICATION_ICONS: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  order: {
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  delivery: {
    icon: Truck,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  promo: {
    icon: Tag,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  price_drop: {
    icon: TrendingDown,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
  review: {
    icon: MessageSquare,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  back_in_stock: {
    icon: ShoppingCart,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  recommendation: {
    icon: Star,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
  },
};

// ── localStorage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = 'merashop-notifications';

function loadNotifications(): Notification[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveNotifications(notifications: Notification[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // ignore
  }
}

// ── Demo notification data ──────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'delivery',
    title: 'Order Shipped!',
    description: 'Your order #MS-2024-8832 has been shipped via DTDC. Expected delivery by Friday.',
    timestamp: '2 min ago',
    read: false,
    link: '/account/orders',
  },
  {
    id: '2',
    type: 'promo',
    title: 'Flash Sale is Live! 🔥',
    description: 'Up to 70% off on electronics. Use code FLASH70 at checkout.',
    timestamp: '15 min ago',
    read: false,
    link: '/shop?sort=discount',
  },
  {
    id: '3',
    type: 'price_drop',
    title: 'Price Drop Alert',
    description: 'Sony WH-1000XM5 is now ₹22,990 (was ₹29,990). Grab it before it\'s gone!',
    timestamp: '1 hour ago',
    read: false,
    link: '/shop?sort=discount',
  },
  {
    id: '4',
    type: 'back_in_stock',
    title: 'Back in Stock! 🎉',
    description: 'Boat Rockerz 450 is back in stock! Grab yours before it sells out again.',
    timestamp: '2 hours ago',
    read: false,
    link: '/shop',
  },
  {
    id: '5',
    type: 'recommendation',
    title: 'Recommended for You',
    description: 'Based on your browsing, you might love the new Samsung Galaxy Buds FE at ₹2,999!',
    timestamp: '3 hours ago',
    read: false,
    link: '/shop?category=electronics',
  },
  {
    id: '6',
    type: 'order',
    title: 'Order Confirmed',
    description: 'Your order #MS-2024-8830 has been confirmed. We\'re preparing it for shipment.',
    timestamp: '3 hours ago',
    read: true,
    link: '/account/orders',
  },
  {
    id: '7',
    type: 'review',
    title: 'Review Reply',
    description: 'MeraShop replied to your review on "Wireless Bluetooth Earbuds".',
    timestamp: '1 day ago',
    read: true,
    link: '/account/orders',
  },
  {
    id: '8',
    type: 'delivery',
    title: 'Delivered!',
    description: 'Your order #MS-2024-8800 has been delivered. Rate your experience!',
    timestamp: '2 days ago',
    read: true,
    link: '/account/orders',
  },
  {
    id: '9',
    type: 'promo',
    title: 'Weekend Special 🛍️',
    description: 'Extra 15% off on fashion this weekend! Code: STYLE15',
    timestamp: '3 days ago',
    read: true,
    link: '/shop?category=fashion',
  },
];

// ── Single Notification Item ────────────────────────────────────────────────
function NotificationItem({
  notification,
  onMarkRead,
  onMarkUnread,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
}) {
  const config = NOTIFICATION_ICONS[notification.type];
  const IconComp = config.icon;

  return (
    <div
      className={cn(
        'w-full text-left flex gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 min-h-[44px] group relative',
        !notification.read && 'bg-primary/5 dark:bg-primary/10',
      )}
    >
      {/* Icon */}
      <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5', config.bg)}>
        <IconComp className={cn('size-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium leading-snug', !notification.read ? 'text-foreground' : 'text-muted-foreground')}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {!notification.read && (
              <span className="size-2 rounded-full bg-primary mt-1.5" />
            )}
            {/* Toggle read/unread on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (notification.read) {
                  onMarkUnread(notification.id);
                } else {
                  onMarkRead(notification.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity size-5 rounded-full hover:bg-muted flex items-center justify-center"
              aria-label={notification.read ? 'Mark as unread' : 'Mark as read'}
            >
              {notification.read ? (
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
              ) : (
                <CheckCheck className="size-3 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
          {notification.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[10px] text-muted-foreground/70">
            {notification.timestamp}
          </p>
          {notification.link && (
            <ArrowRight className="size-2.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────
function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <Bell className="size-7 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">All caught up!</p>
      <p className="text-xs text-muted-foreground text-center">
        No new notifications right now. We&apos;ll let you know when something arrives.
      </p>
    </div>
  );
}

// ── NotificationCenter Component ────────────────────────────────────────────
export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const stored = loadNotifications();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: load persisted data after hydration
      setNotifications(stored);
    }
    setHasHydrated(true);
  }, []);

  // Persist to localStorage on change (only after hydration)
  useEffect(() => {
    if (hasHydrated) {
      saveNotifications(notifications);
    }
  }, [notifications, hasHydrated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  }, []);

  // Show toast for new notifications (simulated on first open)
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      const firstUnread = notifications.find((n) => !n.read);
      if (firstUnread) {
        toast.info(firstUnread.title, {
          description: firstUnread.description.substring(0, 80) + '...',
          duration: 3000,
        });
      }
    }
  }, [isOpen, notifications, unreadCount]);

  // Group notifications by type for filtering
  const notificationTypes: { key: NotificationType | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'order', label: 'Orders' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'price_drop', label: 'Price Drops' },
    { key: 'back_in_stock', label: 'Restocks' },
    { key: 'promo', label: 'Offers' },
    { key: 'recommendation', label: 'For You' },
  ];

  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 md:size-10 relative transition-colors"
          aria-label={`Notifications${hasHydrated && unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="size-[18px] md:size-5" />
          {/* Animated unread badge — only render after hydration to avoid mismatch */}
          {hasHydrated && unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 min-w-5 h-5 p-0 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-1 animate-badge-pop">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] sm:w-[420px] p-0 rounded-xl shadow-xl border-border/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
            {hasHydrated && unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary hover:text-primary/80 px-2"
                onClick={markAllAsRead}
              >
                <CheckCheck className="size-3.5 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 pb-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {notificationTypes.map((type) => {
              const count = type.key === 'all'
                ? notifications.length
                : notifications.filter((n) => n.type === type.key).length;
              if (count === 0 && type.key !== 'all') return null;
              return (
                <button
                  key={type.key}
                  onClick={() => setActiveFilter(type.key)}
                  className={cn(
                    'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
                    activeFilter === type.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {type.label}
                  {count > 0 && type.key !== 'all' && (
                    <span className="ml-1 opacity-60">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Notification list */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
          {filteredNotifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="p-2 space-y-1">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        onClick={() => {
                          if (!notification.read) markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                        className="block"
                      >
                        <NotificationItem
                          notification={notification}
                          onMarkRead={markAsRead}
                          onMarkUnread={markAsUnread}
                        />
                      </Link>
                    ) : (
                      <NotificationItem
                        notification={notification}
                        onMarkRead={markAsRead}
                        onMarkUnread={markAsUnread}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-primary hover:text-primary/80 justify-center"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href="/account/orders">
                  View All Notifications
                  <ExternalLink className="size-3 ml-1" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
