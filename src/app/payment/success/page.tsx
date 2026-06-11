'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    const timer = setTimeout(() => {
      const target = orderNumber
        ? `/order-confirmation?order=${orderNumber}`
        : '/order-confirmation';
      router.replace(target);
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, orderNumber]);

  return (
    <div className="container-shop section-padding">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-6">
          <div className="flex size-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
            <CheckCircle2 className="size-14 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="absolute -inset-3 animate-ping rounded-full bg-emerald-200/50 dark:bg-emerald-800/30" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Payment Successful!</h1>
        <p className="text-muted-foreground">Redirecting to your order confirmation...</p>
        <Loader2 className="mt-4 size-6 animate-spin text-primary" />
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-shop section-padding">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Processing...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
