import { toast } from 'sonner';
import { ShoppingCart, Trash2, Heart, Star, Tag, Package, Bell } from 'lucide-react';
import type { ReactNode } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

type ToastAccent = 'orange' | 'red' | 'pink' | 'gray' | 'green' | 'amber' | 'blue';

interface NotificationOptions {
  title: string;
  description: string;
  accent: ToastAccent;
  icon: ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ── Accent Color Mapping ─────────────────────────────────────────────────────

const ACCENT_COLORS: Record<ToastAccent, string> = {
  orange: 'border-l-orange-500',
  red: 'border-l-red-500',
  pink: 'border-l-pink-500',
  gray: 'border-l-gray-400',
  green: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
  blue: 'border-l-sky-500',
};

// ── Base Notification ────────────────────────────────────────────────────────

function showNotification(options: NotificationOptions) {
  const { title, description, accent, icon, duration = 4000, action } = options;

  toast.success(title, {
    description,
    duration,
    icon: (
      <div className={`flex size-8 items-center justify-center rounded-full border-l-4 ${ACCENT_COLORS[accent]} bg-accent/50`}>
        <span className="scale-75">{icon}</span>
      </div>
    ),
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    classNames: {
      toast: `border-l-4 ${ACCENT_COLORS[accent]}`,
      title: 'text-sm font-semibold',
      description: 'text-xs text-muted-foreground',
    },
  });
}

// ── Cart Notifications ───────────────────────────────────────────────────────

export function notifyCartAdd(productName: string) {
  showNotification({
    title: 'Added to cart! 🛒',
    description: `${productName} has been added to your cart.`,
    accent: 'orange',
    icon: <ShoppingCart className="size-4 text-orange-600" />,
    action: {
      label: 'View Cart',
      onClick: () => window.location.href = '/cart',
    },
  });
}

export function notifyCartRemove(productName: string) {
  showNotification({
    title: 'Removed from cart',
    description: `${productName} has been removed from your cart.`,
    accent: 'red',
    icon: <Trash2 className="size-4 text-red-500" />,
  });
}

// ── Wishlist Notifications ───────────────────────────────────────────────────

export function notifyWishlistAdd(productName: string) {
  showNotification({
    title: 'Added to wishlist ❤️',
    description: `${productName} has been saved to your wishlist.`,
    accent: 'pink',
    icon: <Heart className="size-4 text-pink-500" />,
  });
}

export function notifyWishlistRemove(productName: string) {
  showNotification({
    title: 'Removed from wishlist',
    description: `${productName} has been removed from your wishlist.`,
    accent: 'gray',
    icon: <Heart className="size-4 text-gray-400" />,
  });
}

// ── Order Notifications ──────────────────────────────────────────────────────

export function notifyOrderSuccess(orderNumber: string) {
  showNotification({
    title: 'Order placed successfully! 🎉',
    description: `Your order ${orderNumber} has been confirmed. You'll receive updates via email.`,
    accent: 'green',
    icon: <Package className="size-4 text-emerald-500" />,
    duration: 6000,
    action: {
      label: 'Track Order',
      onClick: () => window.location.href = '/track-order',
    },
  });
}

// ── Coupon Notifications ─────────────────────────────────────────────────────

export function notifyCouponApply(code: string, discount: number) {
  showNotification({
    title: 'Coupon applied! 🎊',
    description: `Code ${code} applied. You saved ₹${discount.toLocaleString('en-IN')}!`,
    accent: 'green',
    icon: <Tag className="size-4 text-emerald-500" />,
  });
}

export function notifyCouponInvalid(code: string) {
  showNotification({
    title: 'Invalid coupon code',
    description: `The code "${code}" is not valid or has expired. Try WELCOME10!`,
    accent: 'red',
    icon: <Tag className="size-4 text-red-500" />,
  });
}

// ── Review Notification ──────────────────────────────────────────────────────

export function notifyReviewSubmit() {
  showNotification({
    title: 'Review submitted! 🌟',
    description: 'Thank you for sharing your experience. Your review helps other shoppers!',
    accent: 'amber',
    icon: <Star className="size-4 text-amber-500" />,
  });
}

// ── Stock Alert Notification ─────────────────────────────────────────────────

export function notifyStockAlert() {
  showNotification({
    title: "You'll be notified when back in stock 📬",
    description: "We'll send you an email as soon as this item is available again.",
    accent: 'blue',
    icon: <Bell className="size-4 text-sky-500" />,
  });
}
