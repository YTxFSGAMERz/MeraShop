// MeraShop Analytics - Event Tracking System
// Tracks user interactions for product analytics and conversion optimization

export type AnalyticsEventType =
  | 'page_view'
  | 'search'
  | 'filter_applied'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'checkout_start'
  | 'payment_initiated'
  | 'payment_success'
  | 'payment_failure'
  | 'order_created'
  | 'newsletter_signup'
  | 'contact_form_submit'
  | 'coupon_applied'
  | 'coupon_failed'
  | 'review_submitted'
  | 'share_product'
  | 'variant_selected'
  | 'category_browse'
  | 'banner_click';

interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  userId?: string;
  sessionId?: string;
  data?: Record<string, unknown>;
  url?: string;
  referrer?: string;
  userAgent?: string;
}

// Generate a session ID stored in sessionStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('merashop-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('merashop-session-id', sessionId);
  }
  return sessionId;
}

// Get user ID from auth store if available
function getUserId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const authData = localStorage.getItem('merashop-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.state?.user?.id;
    }
  } catch {
    // Ignore parse errors
  }
  return undefined;
}

// Queue events for batch sending
let eventQueue: AnalyticsEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

async function flushEvents() {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue = [];

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
  } catch {
    // Silently fail - analytics should not break the app
    // Re-queue failed events (limit to prevent memory leak)
    if (eventQueue.length < 50) {
      eventQueue = [...events.slice(0, 10), ...eventQueue];
    }
  }
}

function scheduleFlush() {
  if (flushTimeout) clearTimeout(flushTimeout);
  // Flush after 2 seconds of inactivity, or immediately if queue is large
  if (eventQueue.length >= 10) {
    flushEvents();
  } else {
    flushTimeout = setTimeout(flushEvents, 2000);
  }
}

/**
 * Track an analytics event.
 * This is the main public API for tracking user interactions.
 */
export function trackEvent(
  eventType: AnalyticsEventType,
  data?: Record<string, unknown>,
) {
  if (typeof window === 'undefined') return;

  const event: AnalyticsEvent = {
    eventType,
    userId: getUserId(),
    sessionId: getSessionId(),
    data,
    url: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
  };

  eventQueue.push(event);
  scheduleFlush();

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventType, data || '');
  }
}

/**
 * Track a page view.
 * Call this on route changes.
 */
export function trackPageView(url?: string) {
  trackEvent('page_view', {
    path: url || (typeof window !== 'undefined' ? window.location.pathname : ''),
    title: typeof document !== 'undefined' ? document.title : '',
  });
}

/**
 * Track product view.
 */
export function trackProductView(productId: string, productName: string, category?: string, price?: number) {
  trackEvent('product_view', { productId, productName, category, price });
}

/**
 * Track add to cart.
 */
export function trackAddToCart(productId: string, productName: string, price: number, quantity: number = 1) {
  trackEvent('add_to_cart', { productId, productName, price, quantity });
}

/**
 * Track remove from cart.
 */
export function trackRemoveFromCart(productId: string, productName: string) {
  trackEvent('remove_from_cart', { productId, productName });
}

/**
 * Track wishlist add.
 */
export function trackWishlistAdd(productId: string, productName: string) {
  trackEvent('wishlist_add', { productId, productName });
}

/**
 * Track wishlist remove.
 */
export function trackWishlistRemove(productId: string, productName: string) {
  trackEvent('wishlist_remove', { productId, productName });
}

/**
 * Track checkout start.
 */
export function trackCheckoutStart(cartTotal: number, itemCount: number) {
  trackEvent('checkout_start', { cartTotal, itemCount });
}

/**
 * Track payment initiated.
 */
export function trackPaymentInitiated(amount: number, method: string) {
  trackEvent('payment_initiated', { amount, method });
}

/**
 * Track payment success.
 */
export function trackPaymentSuccess(orderId: string, amount: number, method: string) {
  trackEvent('payment_success', { orderId, amount, method });
}

/**
 * Track payment failure.
 */
export function trackPaymentFailure(amount: number, method: string, reason?: string) {
  trackEvent('payment_failure', { amount, method, reason });
}

/**
 * Track order created.
 */
export function trackOrderCreated(orderId: string, total: number, itemCount: number) {
  trackEvent('order_created', { orderId, total, itemCount });
}

/**
 * Track search.
 */
export function trackSearch(query: string, resultsCount?: number) {
  trackEvent('search', { query, resultsCount });
}

/**
 * Track filter applied.
 */
export function trackFilterApplied(filterType: string, filterValue: string) {
  trackEvent('filter_applied', { filterType, filterValue });
}

/**
 * Track newsletter signup.
 */
export function trackNewsletterSignup(email: string) {
  trackEvent('newsletter_signup', { email });
}

/**
 * Track contact form submission.
 */
export function trackContactFormSubmit(subject: string) {
  trackEvent('contact_form_submit', { subject });
}

// Flush remaining events on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery on page unload
      const events = [...eventQueue];
      eventQueue = [];
      try {
        navigator.sendBeacon(
          '/api/analytics',
          JSON.stringify({ events }),
        );
      } catch {
        // Silently fail
      }
    }
  });
}
