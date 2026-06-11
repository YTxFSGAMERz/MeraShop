'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Package,
  Check,
  Truck,
  ClipboardList,
  Clock,
  MapPin,
  ArrowLeft,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SITE_NAME } from '@/lib/constants';
import { formatINR } from '@/lib/constants';

// ── Demo order for tracking ────────────────────────────────────────────────
// Using static dates to avoid hydration mismatch from new Date() at module scope
const DEMO_ORDER = {
  orderNumber: 'MS-DEMO-2024',
  status: 'shipped',
  totalAmount: 2499,
  shippingName: 'Rahul Sharma',
  shippingCity: 'Mumbai',
  shippingState: 'Maharashtra',
  trackingNumber: 'DTDC123456789',
  estimatedDelivery: '2025-07-15',
  items: [
    { name: 'Wireless Bluetooth Earbuds', quantity: 1, unitPrice: 1499, productImage: null },
    { name: 'USB-C Fast Charging Cable', quantity: 2, unitPrice: 500, productImage: null },
  ],
  createdAt: '2025-07-09',
};

// ── Timeline steps ─────────────────────────────────────────────────────────
interface TimelineStep {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

function getTimelineSteps(orderStatus: string, createdAt: string, estimatedDelivery: string): TimelineStep[] {
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIdx = statusOrder.indexOf(orderStatus);

  const steps: Omit<TimelineStep, 'status' | 'date'>[] = [
    {
      label: 'Order Placed',
      description: 'Your order has been placed successfully',
      icon: ClipboardList,
    },
    {
      label: 'Confirmed',
      description: 'Order confirmed and payment verified',
      icon: Check,
    },
    {
      label: 'Processing',
      description: 'Your order is being packed and prepared',
      icon: Package,
    },
    {
      label: 'Shipped',
      description: 'Your order is on the way',
      icon: Truck,
    },
    {
      label: 'Delivered',
      description: 'Package delivered to your address',
      icon: MapPin,
    },
  ];

  return steps.map((step, idx) => ({
    ...step,
    status: idx <= currentIdx ? (idx === currentIdx ? 'current' : 'completed') : 'upcoming',
    date: idx === 0 ? createdAt : idx === 4 ? estimatedDelivery : undefined,
  }));
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [orderData, setOrderData] = useState<typeof DEMO_ORDER | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!orderNumber.trim()) return;
    setIsSearching(true);
    setError('');
    setOrderData(null);

    try {
      // Try real API first
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrderData({
            orderNumber: data.order.orderNumber,
            status: data.order.status,
            totalAmount: data.order.totalAmount,
            shippingName: data.order.shippingName,
            shippingCity: data.order.shippingCity,
            shippingState: data.order.shippingState,
            trackingNumber: data.order.trackingNumber || `AWB${data.order.orderNumber.replace(/[^A-Z0-9]/g, '')}IND`,
            estimatedDelivery: data.order.estimatedDelivery || format(addDays(new Date(data.order.createdAt), 5), 'yyyy-MM-dd'),
            items: data.order.items || [],
            createdAt: format(new Date(data.order.createdAt), 'yyyy-MM-dd'),
          });
          setIsSearching(false);
          return;
        }
      }

      // If no real order found, show demo for any input
      setOrderData({
        ...DEMO_ORDER,
        orderNumber: orderNumber.trim(),
      });
    } catch {
      // On error, show demo
      setOrderData({
        ...DEMO_ORDER,
        orderNumber: orderNumber.trim(),
      });
    } finally {
      setIsSearching(false);
    }
  };

  const timeline = orderData
    ? getTimelineSteps(orderData.status, orderData.createdAt, orderData.estimatedDelivery)
    : [];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Track Your Order</h1>
              <p className="text-sm text-muted-foreground">
                Enter your order number to see the latest status
              </p>
            </div>
          </div>

          {/* Search Form */}
          <div className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter order number (e.g., MS-DEMO-2024)"
                className="pl-9 h-11"
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              />
            </div>
            <Button onClick={handleTrack} disabled={isSearching || !orderNumber.trim()} className="h-11 px-6">
              {isSearching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Track'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-destructive font-medium">{error}</p>
            </motion.div>
          )}

          {orderData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              {/* Order Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Order #{orderData.orderNumber}</CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        orderData.status === 'delivered'
                          ? 'text-emerald-600 border-emerald-300'
                          : orderData.status === 'shipped'
                          ? 'text-blue-600 border-blue-300'
                          : 'text-amber-600 border-amber-300'
                      }
                    >
                      {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ordered by</p>
                      <p className="font-medium text-foreground">{orderData.shippingName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shipping to</p>
                      <p className="font-medium text-foreground">{orderData.shippingCity}, {orderData.shippingState}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium text-foreground">{orderData.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-price">{formatINR(orderData.totalAmount)}</p>
                    </div>
                  </div>

                  {orderData.trackingNumber && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                      <Truck className="size-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">Tracking:</span>
                      <span className="font-mono font-semibold text-foreground">{orderData.trackingNumber}</span>
                    </div>
                  )}

                  {orderData.estimatedDelivery && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-sm">
                      <Clock className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                        Estimated delivery by {format(new Date(orderData.estimatedDelivery), 'EEEE, d MMMM yyyy')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {timeline.map((step, idx) => {
                      const isLast = idx === timeline.length - 1;
                      const IconComp = step.icon;

                      return (
                        <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                          {/* Vertical line */}
                          {!isLast && (
                            <div
                              className={`absolute left-[17px] top-[38px] w-0.5 h-[calc(100%-38px)] ${
                                step.status === 'completed'
                                  ? 'bg-emerald-400'
                                  : 'bg-border'
                              }`}
                            />
                          )}

                          {/* Icon circle */}
                          <div
                            className={`relative z-10 size-9 rounded-full flex items-center justify-center shrink-0 ${
                              step.status === 'completed'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                : step.status === 'current'
                                ? 'bg-primary/10 ring-2 ring-primary'
                                : 'bg-muted'
                            }`}
                          >
                            {step.status === 'completed' ? (
                              <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                            ) : step.status === 'current' ? (
                              <IconComp className="size-4 text-primary animate-pulse" />
                            ) : (
                              <IconComp className="size-4 text-muted-foreground" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="pt-1">
                            <p
                              className={`text-sm font-medium ${
                                step.status === 'upcoming'
                                  ? 'text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {step.description}
                            </p>
                            {step.date && step.status !== 'upcoming' && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="size-3" />
                                {step.date}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              {orderData.items && orderData.items.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Items in this Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {orderData.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="size-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {item.productImage ? (
                              <img src={item.productImage} alt={item.name} className="size-12 rounded-lg object-cover" />
                            ) : (
                              <ShoppingBag className="size-5 text-muted-foreground/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.name || item.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground shrink-0">
                            {formatINR(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Help text */}
              <div className="text-center text-sm text-muted-foreground py-4">
                Need help with your order?{' '}
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  Contact Support
                </Link>
              </div>
            </motion.div>
          )}

          {/* Default state - no order searched yet */}
          {!orderData && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-md mx-auto text-center py-12"
            >
              <div className="size-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Package className="size-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Where&apos;s my order?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your order number above to track your package in real-time.
                You can find the order number in your order confirmation email.
              </p>
              <p className="text-xs text-muted-foreground">
                Try entering any number to see a demo tracking result
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
