'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  ChevronDown,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Circle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatINR } from '@/lib/constants';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productSlug: string | null;
  currentImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantName: string | null;
  variantValue: string | null;
}

interface OrderPayment {
  id: string;
  status: string;
  method: string | null;
  amount: number;
  currency: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
  shipping: {
    name: string;
    phone: string;
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  payment: OrderPayment | null;
}

function getStatusConfig(status: string) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
    pending: { label: 'Pending', variant: 'outline', color: 'text-amber-600' },
    confirmed: { label: 'Confirmed', variant: 'secondary', color: 'text-blue-600' },
    processing: { label: 'Processing', variant: 'secondary', color: 'text-blue-600' },
    shipped: { label: 'Shipped', variant: 'default', color: 'text-green-600' },
    delivered: { label: 'Delivered', variant: 'default', color: 'text-green-700' },
    cancelled: { label: 'Cancelled', variant: 'destructive', color: 'text-red-600' },
    returned: { label: 'Returned', variant: 'outline', color: 'text-amber-600' },
  };
  return map[status] || { label: status, variant: 'outline' as const, color: 'text-muted-foreground' };
}

const timelineSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function StatusTimeline({ status }: { status: string }) {
  const currentIndex = timelineSteps.indexOf(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-2">
        <XCircle className="size-5 text-destructive" />
        <span className="text-sm font-medium text-destructive">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="space-y-1 py-2">
      {timelineSteps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={step} className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className={`size-4 ${isCurrent ? 'text-primary' : 'text-green-500'}`} />
            ) : (
              <Circle className="size-4 text-muted-foreground/40" />
            )}
            <span className={`text-xs capitalize ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/account/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders/user?userId=${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch {
        // fallback
      }
      setLoading(false);
    };

    fetchOrders();
  }, [_hasHydrated, isAuthenticated, user?.id, router]);

  if (!_hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  return (
    <div className="container-shop section-padding">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/account">
          <Button variant="ghost" size="icon" className="size-9">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">My Orders</h1>
        <Badge variant="secondary" className="ml-auto">{orders.length}</Badge>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-20 rounded-lg bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="size-12 mx-auto text-muted-foreground/40 mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-1">No Orders Yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You haven&apos;t placed any orders. Start shopping!
            </p>
            <Link href="/">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div className="flex items-center justify-between p-4 bg-muted/30">
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        #{order.orderNumber}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
                      {order.items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="size-14 flex-shrink-0 rounded-md bg-muted overflow-hidden"
                        >
                          {item.currentImage || item.productImage ? (
                            <img
                              src={item.currentImage || item.productImage || ''}
                              alt={item.productName}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center">
                              <Package className="size-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="size-14 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            +{order.items.length - 4}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {order.items.map((i) => i.productName).join(', ')}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </span>
                        <span className="mx-1.5 text-muted-foreground/40">•</span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatINR(order.totalAmount)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                        <ChevronDown className="size-3.5" />
                      </Button>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                        <Truck className="size-3.5" />
                        <span>Tracking: {order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Order #{selectedOrder.orderNumber}</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                {/* Status Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Order Status</h3>
                  <StatusTimeline status={selectedOrder.status} />
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Items ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="size-14 flex-shrink-0 rounded-md bg-muted overflow-hidden">
                          {item.currentImage || item.productImage ? (
                            <img
                              src={item.currentImage || item.productImage || ''}
                              alt={item.productName}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center">
                              <Package className="size-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.productName}
                          </p>
                          {item.variantName && item.variantValue && (
                            <p className="text-xs text-muted-foreground">
                              {item.variantName}: {item.variantValue}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                            <span className="text-sm font-medium text-foreground">
                              {formatINR(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Price Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatINR(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {selectedOrder.shippingCost > 0 ? formatINR(selectedOrder.shippingCost) : 'Free'}
                      </span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-green-600">-{formatINR(selectedOrder.discountAmount)}</span>
                      </div>
                    )}
                    {selectedOrder.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="text-foreground">{formatINR(selectedOrder.taxAmount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatINR(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Delivery Address */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    Delivery Address
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p className="font-medium text-foreground">{selectedOrder.shipping.name}</p>
                    <p>{selectedOrder.shipping.address1}</p>
                    {selectedOrder.shipping.address2 && <p>{selectedOrder.shipping.address2}</p>}
                    <p>
                      {selectedOrder.shipping.city}, {selectedOrder.shipping.state}{' '}
                      {selectedOrder.shipping.pincode}
                    </p>
                    <p>Phone: {selectedOrder.shipping.phone}</p>
                  </div>
                </div>

                <Separator />

                {/* Payment Info */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <CreditCard className="size-3.5" />
                    Payment Info
                  </h3>
                  {selectedOrder.payment ? (
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method</span>
                        <span className="text-foreground capitalize">
                          {selectedOrder.payment.method || 'Online'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          variant={
                            selectedOrder.payment.status === 'completed'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {selectedOrder.payment.status}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Payment info not available</p>
                  )}
                </div>

                {/* Tracking */}
                {selectedOrder.trackingNumber && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Truck className="size-3.5" />
                        Tracking Info
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Tracking Number: <span className="font-medium text-foreground">{selectedOrder.trackingNumber}</span>
                      </p>
                      {selectedOrder.estimatedDelivery && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Estimated Delivery:{' '}
                          <span className="font-medium text-foreground">
                            {new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  </>
                )}

                {selectedOrder.couponCode && (
                  <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Coupon applied: <span className="font-semibold">{selectedOrder.couponCode}</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
