'use client';

import { useState, useCallback, useRef } from 'react';
import { ShieldCheck, Loader2, CreditCard, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Razorpay Types ──────────────────────────────────────────────────────────
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayPaymentFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

interface RazorpayCheckoutProps {
  amount: number; // in paise
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  onSuccess: (response: RazorpayResponse) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
  orderNotes?: Record<string, string>;
}

// ── Declare global Razorpay ─────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response?: RazorpayPaymentFailedResponse) => void) => void;
    };
  }
}

// ── Error code to user-friendly message mapping ─────────────────────────────
function getPaymentErrorMessage(error: RazorpayPaymentFailedResponse['error']): string {
  const code = error?.code || '';
  const description = error?.description || '';

  // Check for specific error descriptions first (most actionable)
  if (description.toLowerCase().includes('international')) {
    return 'International cards are not supported. Please use an Indian card, UPI, or NetBanking.';
  }
  if (description.toLowerCase().includes('insufficient')) {
    return 'Insufficient funds in your account. Please try a different payment method.';
  }
  if (description.toLowerCase().includes('expired')) {
    return 'Your card has expired. Please try a different card.';
  }

  // Map known Razorpay error codes
  switch (code) {
    case 'BAD_REQUEST_ERROR':
      return description || 'Invalid payment request. Please try a different payment method.';
    case 'PAYMENT_DECLINED':
      return 'Your bank declined the payment. Please try a different card or payment method.';
    case 'GATEWAY_ERROR':
      return 'Payment gateway is temporarily unavailable. Please try again in a few minutes.';
    case 'SERVER_ERROR':
      return 'A server error occurred. Please try again.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your internet connection and try again.';
    case 'PRECAPTURE_FAILED':
    case 'AUTHORIZATION_FAILED':
      return 'Payment authorization failed. Please try again with a different method.';
    case 'CAPTURE_FAILED':
      return 'Payment capture failed. Please contact support.';
    default:
      // Include the Razorpay description if available
      if (description) {
        return description;
      }
      return 'Payment failed. Please try again with a different method.';
  }
}

// ── RazorpayCheckout Component ──────────────────────────────────────────────
export function RazorpayCheckout({
  amount,
  currency = 'INR',
  customerName,
  customerEmail,
  customerPhone,
  description = 'MeraShop Order Payment',
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className,
  orderNotes,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [showTestInfo, setShowTestInfo] = useState(true); // Show by default in test mode
  const modalOpenRef = useRef(false);
  // Track the last payment failure — show error only after modal closes
  const lastPaymentErrorRef = useRef<string | null>(null);
  const lastErrorCodeRef = useRef<string | null>(null);

  const handlePayment = useCallback(async () => {
    // Prevent double-click while modal is open
    if (modalOpenRef.current) return;

    setLoading(true);
    setError('');
    setErrorCode('');
    lastPaymentErrorRef.current = null;
    lastErrorCodeRef.current = null;

    try {
      // Step 1: Create order on the server
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        const errorMsg = orderData.error || 'Failed to create payment order';
        setError(errorMsg);
        setErrorCode('ORDER_CREATE_FAILED');
        onError?.(errorMsg);
        setLoading(false);
        return;
      }

      // Step 2: Load Razorpay checkout script if not already loaded
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const loadScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        const errorMsg = 'Failed to load payment gateway. Please check your internet connection.';
        setError(errorMsg);
        setErrorCode('SCRIPT_LOAD_FAILED');
        onError?.(errorMsg);
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay checkout modal
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        const errorMsg = 'Payment gateway is not configured. Please contact support.';
        setError(errorMsg);
        setErrorCode('NO_API_KEY');
        onError?.(errorMsg);
        setLoading(false);
        return;
      }

      const options: RazorpayOptions = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MeraShop',
        description,
        order_id: orderData.order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        notes: orderNotes,
        theme: {
          color: '#d97706', // MeraShop primary amber color
        },
        handler: async (response: RazorpayResponse) => {
          // Payment succeeded — verify signature on the server
          modalOpenRef.current = false;
          lastPaymentErrorRef.current = null; // Clear any previous failure
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              onSuccess(response);
            } else {
              const errorMsg = verifyData.error || 'Payment verification failed. Please contact support with your order details.';
              setError(errorMsg);
              onError?.(errorMsg);
            }
          } catch {
            const errorMsg = 'Payment verification failed. Please contact support with your order details.';
            setError(errorMsg);
            onError?.(errorMsg);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            modalOpenRef.current = false;
            setLoading(false);
            // If there was a payment failure, show the error now that modal is closed
            if (lastPaymentErrorRef.current) {
              setError(lastPaymentErrorRef.current);
              setErrorCode(lastErrorCodeRef.current || '');
              onError?.(lastPaymentErrorRef.current);
              lastPaymentErrorRef.current = null;
              lastErrorCodeRef.current = null;
            } else {
              // User just dismissed without a failure — call cancel
              onCancel?.();
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response?: RazorpayPaymentFailedResponse) => {
        // Store the error but DON'T show it yet — the Razorpay modal is still
        // open and showing the error itself. We'll show our inline error only
        // after the user closes the modal.
        if (response?.error) {
          // Log the FULL error object for debugging
          console.error('[Razorpay] payment.failed FULL response:', JSON.stringify(response, null, 2));
          console.error('[Razorpay] payment.failed error details:', {
            code: response.error.code,
            description: response.error.description,
            source: response.error.source,
            step: response.error.step,
            reason: response.error.reason,
            metadata: response.error.metadata,
          });
        } else {
          console.error('[Razorpay] payment.failed with no error details:', response);
        }
        const errorMsg = response?.error
          ? getPaymentErrorMessage(response.error)
          : 'Payment failed. Please try again with a different method.';
        lastPaymentErrorRef.current = errorMsg;
        lastErrorCodeRef.current = response?.error?.code || 'PAYMENT_FAILED';
        // Note: We intentionally do NOT set loading=false or modalOpenRef=false
        // here because the Razorpay modal is STILL OPEN. The user can retry
        // within the modal. State will be cleaned up when the modal actually
        // closes (ondismiss) or payment succeeds (handler).
      });
      modalOpenRef.current = true;
      rzp.open();
    } catch {
      const errorMsg = 'Something went wrong. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
      setLoading(false);
    }
    // Note: We intentionally do NOT use finally to setLoading(false) here
    // because the Razorpay modal is non-blocking. Loading should only be
    // reset when: payment succeeds (handler), or modal is dismissed (ondismiss).
  }, [amount, currency, customerName, customerEmail, customerPhone, description, onSuccess, onError, onCancel, orderNotes]);

  // Check if we're in test mode (test key starts with rzp_test_)
  const isTestMode = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_');

  return (
    <div className={cn('space-y-3', className)}>
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
          <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-destructive font-medium">{error}</p>
            {errorCode && (
              <p className="text-[11px] text-destructive/60 mt-0.5">
                Error code: {errorCode}
              </p>
            )}
            {(error.includes('declined') || error.includes('failed') || error.includes('not supported')) && (
              <p className="text-[11px] text-destructive/70 mt-1">
                Try using a different payment method (UPI, Indian card, or NetBanking).
              </p>
            )}
            <button
              type="button"
              onClick={() => { setError(''); setErrorCode(''); }}
              className="mt-1.5 text-[11px] font-medium text-primary hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Test mode info banner — ALWAYS visible in test mode */}
      {isTestMode && (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowTestInfo(!showTestInfo)}
            className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 hover:underline w-full justify-center"
          >
            <Info className="size-3" />
            {showTestInfo ? 'Hide' : 'Show'} Test Payment Details
          </button>
          {showTestInfo ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20 px-3 py-2.5 space-y-1.5">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                🧪 Test Mode — No real charges
              </p>
              <div className="space-y-1 text-[11px] text-amber-600 dark:text-amber-400">
                <p><span className="font-medium">Card:</span> 4111 1111 1111 1111</p>
                <p><span className="font-medium">Expiry:</span> Any future date (e.g. 12/26)</p>
                <p><span className="font-medium">CVV:</span> Any 3 digits (e.g. 123)</p>
                <p><span className="font-medium">UPI:</span> success@razorpay</p>
                <p><span className="font-medium">NetBanking:</span> Any bank → Success</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-[10px] text-amber-500 dark:text-amber-500/70">
              This is a test environment. Click above to see test card details.
            </p>
          )}
        </div>
      )}

      <Button
        onClick={handlePayment}
        disabled={disabled || loading || modalOpenRef.current}
        className={cn(
          'w-full gap-2 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]',
          'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
          'disabled:opacity-70 disabled:cursor-not-allowed',
        )}
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="size-5" />
            Pay Securely with Razorpay
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>256-bit SSL Encrypted • Powered by Razorpay</span>
      </div>
    </div>
  );
}
