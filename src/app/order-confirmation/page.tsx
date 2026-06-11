'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { addDays, format } from 'date-fns';
import {
  CheckCircle2,
  Package,
  Truck,
  Download,
  ShoppingBag,
  MapPin,
  CalendarDays,
  Copy,
  Check,
} from 'lucide-react';
import { formatINR } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface OrderData {
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress1: string;
  shippingAddress2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  estimatedDelivery: string | null;
  items: Array<{
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variantName: string | null;
    variantValue: string | null;
  }>;
}

function LoadingState() {
  return (
    <div className="container-shop section-padding">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="size-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Loading order details...</p>
      </div>
    </div>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?orderNumber=${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [estimatedDate, setEstimatedDate] = useState('');

  useEffect(() => {
    if (order?.estimatedDelivery) {
      setEstimatedDate(order.estimatedDelivery);
    } else {
      setEstimatedDate(format(addDays(new Date(), 5), 'EEE, dd MMM yyyy'));
    }
  }, [order?.estimatedDelivery]);

  if (loading) {
    return <LoadingState />;
  }

  if (!order) {
    return (
      <div className="container-shop section-padding">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 rounded-full bg-muted p-6">
            <Package className="size-16 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Order Not Found</h1>
          <p className="mb-8 text-muted-foreground">
            We couldn&apos;t find the order you&apos;re looking for. It may have been removed or the
            link might be incorrect.
          </p>
          <Button asChild size="lg">
            <Link href="/">
              <ShoppingBag className="mr-2 size-5" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shop section-padding">
      <div className="mx-auto max-w-2xl">
        {/* Success animation */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
              <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="absolute -inset-2 animate-ping rounded-full bg-emerald-200/50 dark:bg-emerald-800/30" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Order Placed Successfully!</h1>
          <p className="text-muted-foreground">
            Thank you for shopping with MeraShop. Your order has been confirmed.
          </p>
        </div>

        {/* Order number */}
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Order Number</p>
              <p className="text-lg font-bold tracking-wide">{order.orderNumber}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleCopyOrderNumber}
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Delivery info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Truck className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Estimated Delivery</p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {estimatedDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery address */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 text-primary" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{order.shippingName}</p>
            <p className="text-sm text-muted-foreground">{order.shippingPhone}</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress1}
              {order.shippingAddress2 && `, ${order.shippingAddress2}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
            </p>
          </CardContent>
        </Card>

        {/* Order items */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="size-4 text-primary" />
              Order Items ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-lg font-bold text-muted-foreground">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="size-12 rounded-md object-cover"
                    />
                  ) : (
                    item.productName.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.productName}</p>
                  {item.variantName && item.variantValue && (
                    <p className="text-xs text-muted-foreground">
                      {item.variantName}: {item.variantValue}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatINR(item.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatINR(item.totalPrice)}</span>
              </div>
            ))}

            <Separator />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>−{formatINR(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                {order.shippingCost === 0 ? (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
                ) : (
                  <span>{formatINR(order.shippingCost)}</span>
                )}
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-price">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order status */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Order Status</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {order.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link href="/">
                    <ShoppingBag className="size-3.5" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="size-3.5" />
                  Invoice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-xs text-muted-foreground">
          You will receive an order confirmation on your registered email and phone.
          <br />
          For any queries, contact us at{' '}
          <a href="mailto:support@merashop.in" className="text-primary hover:underline">
            support@merashop.in
          </a>
        </p>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
