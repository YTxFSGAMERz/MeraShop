'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentFailurePage() {
  return (
    <div className="container-shop section-padding">
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center py-16 text-center">
          <div className="relative mb-6">
            <div className="flex size-24 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50">
              <XCircle className="size-14 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Payment Failed</h1>
          <p className="mb-8 max-w-sm text-muted-foreground">
            Your payment could not be processed. No amount has been deducted from your account.
            Please try again.
          </p>

          <Card className="mb-6 w-full text-left">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold">Possible Reasons:</h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Insufficient balance or credit limit</li>
                <li>• Incorrect card details or UPI ID</li>
                <li>• Transaction timed out</li>
                <li>• Bank server unavailable</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex w-full flex-col gap-3">
            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">
                <ArrowLeft className="mr-2 size-4" />
                Retry Payment
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link href="/cart">
                <ShoppingBag className="mr-2 size-4" />
                Back to Cart
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Need help? Contact us at{' '}
            <a href="mailto:support@merashop.in" className="text-primary hover:underline">
              support@merashop.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
