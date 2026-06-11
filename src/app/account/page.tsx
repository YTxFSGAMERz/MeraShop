'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Package,
  Heart,
  MapPin,
  User,
  HelpCircle,
  LogOut,
  ChevronRight,
  Truck,
  Star,
  Clock,
  Gift,
  TruckIcon,
  PenLine,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatINR, SITE_NAME } from '@/lib/constants';

interface OrderPreview {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { productName: string; quantity: number; productId?: string }[];
}

interface UserStats {
  orders: number;
  wishlist: number;
  addresses: number;
  reviews: number;
}

// Quick links with icons
const quickLinks = [
  { label: 'Track Order', href: '/track-order', icon: TruckIcon, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
  { label: 'My Addresses', href: '/account/addresses', icon: MapPin, color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
  { label: 'Manage Wishlist', href: '/wishlist', icon: Heart, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30' },
  { label: 'Write Reviews', href: '/account/orders', icon: PenLine, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
  { label: 'My Orders', href: '/account/orders', icon: Package, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
  { label: 'My Profile', href: '/account/profile', icon: User, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
  { label: 'Help & Support', href: '/faq', icon: HelpCircle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
];

// Order status config with colors
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-yellow-700 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-yellow-700 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'text-yellow-700 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800', icon: Package },
  shipped: { label: 'Shipped', color: 'text-sky-700 dark:text-sky-400', bgColor: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800', icon: XCircle },
  returned: { label: 'Returned', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800', icon: RotateCcw },
};

function getStatusBadge(status: string) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'text-muted-foreground', bgColor: 'bg-muted border-border', icon: AlertCircle };
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`gap-1 text-xs ${config.bgColor} ${config.color} border`}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

// ── Stagger animation variants ─────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, clearUser, _hasHydrated } = useAuthStore();
  const wishlistItems = useWishlistStore((s) => s.items);
  const cartItems = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addItem);

  const [stats, setStats] = useState<UserStats>({ orders: 0, wishlist: 0, addresses: 0, reviews: 0 });
  const [recentOrders, setRecentOrders] = useState<OrderPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/account/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/auth/profile?userId=${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch {
        // fallback
      }

      try {
        const res = await fetch(`/api/orders/user?userId=${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setRecentOrders(data.orders.slice(0, 5));
        }
      } catch {
        // fallback
      }

      setLoading(false);
    };

    fetchDashboard();
  }, [_hasHydrated, isAuthenticated, user?.id, router]);

  const handleLogout = () => {
    clearUser();
    router.push('/');
  };

  // Order status summary counts
  const orderCounts = {
    pending: recentOrders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
    shipped: recentOrders.filter((o) => o.status === 'shipped').length,
    delivered: recentOrders.filter((o) => o.status === 'delivered').length,
    returned: recentOrders.filter((o) => ['returned', 'cancelled'].includes(o.status)).length,
  };

  if (!_hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading account...</p>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <motion.div
      className="container-shop section-padding"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Welcome Banner ──────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-0 shadow-sm">
          <div
            className="relative p-6 text-white bg-account-gradient"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-white/5 rounded-full translate-y-1/2" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border-2 border-white/30 shadow-lg">
                  <AvatarFallback className="bg-white/20 text-white text-xl font-bold backdrop-blur-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">
                    Namaste, {user.name || 'Shopper'}! 🙏
                  </h1>
                  <p className="text-white/80 text-sm mt-0.5">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Reward Points Banner ─────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mt-4">
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Gift className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    You have <span className="font-bold text-amber-600 dark:text-amber-400">250 MeraShop Points</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Worth ₹25 on your next purchase</p>
                </div>
              </div>
              <Link href="/shop">
                <Button size="sm" variant="outline" className="gap-1.5 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50">
                  Redeem
                  <ArrowRight className="size-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Order Status Summary Cards ──────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mt-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30', count: orderCounts.pending },
            { key: 'shipped', label: 'Shipped', icon: Truck, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/30', count: orderCounts.shipped },
            { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', count: orderCounts.delivered },
            { key: 'returned', label: 'Returned', icon: RotateCcw, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', count: orderCounts.returned },
          ].map((status) => (
            <Card key={status.key} className="text-center">
              <CardContent className="p-3">
                <div className={`size-8 rounded-full ${status.bg} flex items-center justify-center mx-auto mb-1.5`}>
                  <status.icon className={`size-4 ${status.color}`} />
                </div>
                <div className="text-lg font-bold text-foreground">{status.count}</div>
                <div className="text-[10px] text-muted-foreground">{status.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Links Grid ────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-border">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex flex-col items-center gap-2 p-4 bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className={`flex size-10 items-center justify-center rounded-xl ${link.color}`}>
                    <link.icon className="size-5" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">{link.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Orders ────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mt-4">
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            {recentOrders.length > 0 && (
              <Link href="/account/orders" className="text-xs text-primary hover:underline">
                View All
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="size-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Link href="/">
                  <Button variant="link" size="sm" className="text-primary mt-1">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href="/account/orders" className="text-sm font-medium text-foreground hover:text-primary">
                          #{order.orderNumber}
                        </Link>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.items.map((i) => i.productName).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-sm font-semibold text-foreground">
                        {formatINR(order.totalAmount)}
                      </span>
                      {/* Reorder button */}
                      {order.status === 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 shrink-0 text-xs h-7"
                          onClick={() => {
                            order.items.forEach((item) => {
                              addToCart({
                                productId: item.productId || '',
                                name: item.productName,
                                slug: (item.productId || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                price: 0,
                                image: '',
                              });
                            });
                          }}
                        >
                          <RotateCcw className="size-3" />
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Cart Summary ─────────────────────────────────────────────────────── */}
      {cartItems.length > 0 && (
        <motion.div variants={itemVariants} className="mt-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in Cart
                    </p>
                    <p className="text-xs text-muted-foreground">Complete your purchase</p>
                  </div>
                </div>
                <Link href="/cart">
                  <Button size="sm" className="gap-1.5 text-white border-0 bg-saffron-gradient">
                    <TruckIcon className="size-3.5" />
                    Checkout
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Logout Button (Mobile) ────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive hover:text-destructive mt-4 mb-6 md:hidden"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Logout from {SITE_NAME}
        </Button>
      </motion.div>
    </motion.div>
  );
}
