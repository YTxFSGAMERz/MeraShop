'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  CreditCard,
  ClipboardCheck,
  Check,
  ChevronLeft,
  Tag,
  X,
  Loader2,
  ShoppingBag,
  ShieldCheck,
  Banknote,
  Building2,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Home,
  Briefcase,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  QrCode,
  Truck,
  CalendarDays,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatINR, calcDiscountPercent } from '@/lib/constants';
import { notifyOrderSuccess, notifyCouponApply, notifyCouponInvalid } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RazorpayCheckout } from '@/components/shop/RazorpayCheckout';

// ── Types ───────────────────────────────────────────────────────────────────
interface AddressForm {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  saveAddress: boolean;
  addressType: 'home' | 'work' | 'other';
}

interface SavedAddress {
  id: string;
  label: string | null;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AppliedCoupon {
  code: string;
  discount: number;
  discountType: string;
  discountValue: number;
}

type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'cod' | 'emi' | 'demo';
type CheckoutStep = 1 | 2 | 3;

// ── Indian States ───────────────────────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_CHARGE = 49;

const STEP_CONFIG = [
  { step: 1 as CheckoutStep, label: 'Address', description: 'Where to deliver', icon: MapPin },
  { step: 2 as CheckoutStep, label: 'Payment', description: 'How to pay', icon: CreditCard },
  { step: 3 as CheckoutStep, label: 'Review', description: 'Confirm order', icon: ClipboardCheck },
];

// ── Card type detection ─────────────────────────────────────────────────────
function detectCardType(number: string): string {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^6/.test(cleaned)) return 'RuPay';
  if (/^3[47]/.test(cleaned)) return 'Amex';
  return '';
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

// ── Delivery estimation ─────────────────────────────────────────────────────
function getDeliveryEstimate(seed: string): string {
  // Deterministic delivery based on seed hash (avoids hydration mismatch)
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const days = 3 + (Math.abs(hash) % 5); // 3-7 days, deterministic
  const now = new Date();
  const delivery = new Date(now.getTime() + days * 86400000);
  return delivery.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// ── Popular Indian Banks ────────────────────────────────────────────────────
const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India', short: 'SBI' },
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', short: 'Axis' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', short: 'Kotak' },
];

const OTHER_BANKS = [
  { id: 'pnb', name: 'Punjab National Bank' },
  { id: 'bob', name: 'Bank of Baroda' },
  { id: 'canara', name: 'Canara Bank' },
  { id: 'idbi', name: 'IDBI Bank' },
  { id: 'union', name: 'Union Bank of India' },
];

// ── UPI Apps ────────────────────────────────────────────────────────────────
const UPI_APPS = [
  { name: 'Google Pay', color: 'bg-blue-500' },
  { name: 'PhonePe', color: 'bg-purple-500' },
  { name: 'Paytm', color: 'bg-sky-500' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getDiscount, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [placing, setPlacing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Address form
  const [address, setAddress] = useState<AddressForm>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    saveAddress: false,
    addressType: 'home',
  });
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string>('');
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [emiMonths, setEmiMonths] = useState('3');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Mobile order summary toggle
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Delivery estimate - computed in useEffect to avoid hydration mismatch
  const [deliveryEstimate, setDeliveryEstimate] = useState('');

  useEffect(() => {
    setDeliveryEstimate(getDeliveryEstimate('checkout-delivery'));
  }, []);

  // Fetch saved addresses
  const fetchSavedAddresses = useCallback(async () => {
    try {
      const userId = 'demo-user-1';
      const res = await fetch(`/api/addresses?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data.addresses || []);
      }
    } catch {
      // Silently fail - saved addresses are optional
    }
  }, []);

  useEffect(() => {
    fetchSavedAddresses();
  }, [fetchSavedAddresses]);

  // ── Computed ───────────────────────────────────────────────────────────
  const subtotal = getSubtotal();
  const productDiscount = getDiscount();
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const total = subtotal + deliveryCharge - couponDiscount;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Card type
  const cardType = useMemo(() => detectCardType(cardNumber), [cardNumber]);

  // ── Redirect if empty cart ─────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container-shop section-padding">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 rounded-full bg-muted p-6">
            <ShoppingBag className="size-16 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Your Cart is Empty</h1>
          <p className="mb-8 text-muted-foreground">Add items to cart before checking out.</p>
          <Button asChild size="lg">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Address validation ─────────────────────────────────────────────────
  const validateAddress = (): boolean => {
    const errors: Partial<Record<keyof AddressForm, string>> = {};
    if (!address.fullName.trim()) errors.fullName = 'Full name is required';
    if (!address.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(address.phone.trim())) errors.phone = 'Enter a valid 10-digit phone number';
    if (!address.addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(address.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode';

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Step navigation ────────────────────────────────────────────────────
  const goToStep = (step: CheckoutStep) => {
    if (step === 2 && currentStep === 1) {
      if (!validateAddress()) return;
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Apply saved address ────────────────────────────────────────────────
  const applySavedAddress = (addrId: string) => {
    const found = savedAddresses.find((a) => a.id === addrId);
    if (found) {
      setAddress({
        ...address,
        fullName: found.name,
        phone: found.phone,
        addressLine1: found.addressLine1,
        addressLine2: found.addressLine2 || '',
        city: found.city,
        state: found.state,
        pincode: found.pincode,
      });
      setSelectedSavedAddress(addrId);
      setAddressErrors({});
    }
  };

  // ── Coupon ─────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), cartTotal: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount: data.discount,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
        });
        setCouponCode('');
        notifyCouponApply(couponCode.trim().toUpperCase(), data.discount);
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        notifyCouponInvalid(couponCode.trim().toUpperCase());
      }
    } catch {
      setCouponError('Failed to validate coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Place order ────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderData = {
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        paymentMethod: paymentMethod === 'demo' ? 'demo' : paymentMethod,
        couponCode: appliedCoupon?.code,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId,
          variantName: item.variantName,
          unitPrice: item.salePrice ?? item.price,
          totalPrice: (item.salePrice ?? item.price) * item.quantity,
        })),
        subtotal,
        shippingCost: deliveryCharge,
        discountAmount: productDiscount + couponDiscount,
        totalAmount: total,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      const data = await res.json();
      clearCart();
      notifyOrderSuccess(data.order.orderNumber);
      router.push(`/order-confirmation?order=${data.order.orderNumber}`);
    } catch (err) {
      console.error('Order placement failed:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // ── Step Progress Indicator ────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="mb-8">
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center justify-center">
        {STEP_CONFIG.map((config, index) => {
          const isActive = currentStep === config.step;
          const isCompleted = currentStep > config.step;
          const Icon = config.icon;

          return (
            <div key={config.step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isActive
                        ? 'border-primary bg-primary/10 text-primary scale-110'
                        : 'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1.5 text-xs font-medium transition-colors',
                    isActive ? 'text-primary' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                  )}
                >
                  {config.label}
                </span>
                <span
                  className={cn(
                    'text-[10px] transition-colors',
                    isActive ? 'text-primary/70' : 'text-muted-foreground/60'
                  )}
                >
                  {config.description}
                </span>
              </div>
              {index < STEP_CONFIG.length - 1 && (
                <div className="mx-4 flex items-center">
                  <div
                    className={cn(
                      'h-0.5 w-16 lg:w-24 transition-all duration-500',
                      currentStep > config.step ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper - simplified with progress dots */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          {STEP_CONFIG.map((config) => {
            const isActive = currentStep === config.step;
            const isCompleted = currentStep > config.step;

            return (
              <div key={config.step} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" />
                  ) : (
                    <span className="text-xs font-bold">{config.step}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1 text-[10px] font-medium',
                    isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-muted-foreground'
                  )}
                >
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className="h-1 rounded-full bg-muted-foreground/20 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  // ── Order Summary Sidebar ─────────────────────────────────────────────
  const OrderSummarySidebar = () => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Items preview */}
        <div className="max-h-64 space-y-3 overflow-y-auto scrollbar-hide">
          {items.map((item) => {
            const effectivePrice = item.salePrice ?? item.price;
            const discount = calcDiscountPercent(item.price, item.salePrice);
            return (
              <div
                key={`${item.productId}-${item.variantId ?? 'nv'}`}
                className="flex items-center gap-3"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {formatINR(effectivePrice)}
                    </span>
                    {discount > 0 && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        {formatINR(item.price)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatINR(effectivePrice * item.quantity)}</span>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Apply Coupon */}
        {!appliedCoupon ? (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Tag className="size-3.5 text-primary" />
              Apply Coupon
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                className="h-8 text-xs uppercase"
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="h-8 text-xs"
              >
                {couponLoading ? '...' : 'Apply'}
              </Button>
            </div>
            {couponError && <p className="text-xs text-destructive">{couponError}</p>}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {appliedCoupon.code}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                Save {formatINR(appliedCoupon.discount)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:text-rose-500"
              onClick={() => setAppliedCoupon(null)}
            >
              <X className="size-3" />
            </Button>
          </div>
        )}

        <Separator />

        {/* Price breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          {productDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Product Discount</span>
              <span>−{formatINR(productDiscount)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Coupon ({appliedCoupon?.code})</span>
              <span>−{formatINR(couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            {deliveryCharge === 0 ? (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
            ) : (
              <span>{formatINR(deliveryCharge)}</span>
            )}
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-primary">{formatINR(total)}</span>
          </div>
        </div>

        {/* Secure checkout badge */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
          <Lock className="size-4 text-primary flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Secure Checkout • SSL Encrypted</span>
        </div>

        {/* Accepted payment methods */}
        <div className="flex items-center gap-3 justify-center">
          <span className="text-[10px] text-muted-foreground">We accept</span>
          <div className="flex items-center gap-1.5">
            <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">UPI</span>
            <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">VISA</span>
            <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">MC</span>
            <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">RuPay</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ── Render Step 1: Address ──────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Delivery Address</h2>
      </div>

      {/* Saved addresses */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowSavedAddresses(!showSavedAddresses)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            {showSavedAddresses ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            Use a saved address
          </button>

          {showSavedAddresses && (
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => applySavedAddress(addr.id)}
                  className={cn(
                    'w-full text-left rounded-lg border p-3 transition-all text-sm',
                    selectedSavedAddress === addr.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {addr.label === 'Home' ? (
                      <Home className="size-3.5 text-primary" />
                    ) : addr.label === 'Office' || addr.label === 'Work' ? (
                      <Briefcase className="size-3.5 text-primary" />
                    ) : (
                      <MapPin className="size-3.5 text-primary" />
                    )}
                    <span className="font-medium">{addr.name}</span>
                    {addr.isDefault && (
                      <Badge variant="secondary" className="text-[10px] h-4">Default</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-muted-foreground">{addr.phone}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address type selector */}
      <div className="space-y-2">
        <Label className="text-sm">Address Type</Label>
        <div className="flex gap-2">
          {[
            { value: 'home' as const, label: 'Home', icon: Home },
            { value: 'work' as const, label: 'Work', icon: Briefcase },
            { value: 'other' as const, label: 'Other', icon: HelpCircle },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setAddress({ ...address, addressType: type.value })}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all',
                address.addressType === type.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'hover:bg-muted/50'
              )}
            >
              <type.icon className="size-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            value={address.fullName}
            onChange={(e) => {
              setAddress({ ...address, fullName: e.target.value });
              if (addressErrors.fullName) setAddressErrors({ ...addressErrors, fullName: undefined });
            }}
            aria-invalid={!!addressErrors.fullName}
          />
          {addressErrors.fullName && (
            <p className="text-xs text-destructive">{addressErrors.fullName}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            placeholder="10-digit mobile number"
            value={address.phone}
            onChange={(e) => {
              setAddress({ ...address, phone: e.target.value.replace(/\D/g, '').slice(0, 10) });
              if (addressErrors.phone) setAddressErrors({ ...addressErrors, phone: undefined });
            }}
            aria-invalid={!!addressErrors.phone}
          />
          {addressErrors.phone && (
            <p className="text-xs text-destructive">{addressErrors.phone}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="addressLine1">Address Line 1 *</Label>
          <Input
            id="addressLine1"
            placeholder="House no., Building, Street"
            value={address.addressLine1}
            onChange={(e) => {
              setAddress({ ...address, addressLine1: e.target.value });
              if (addressErrors.addressLine1) setAddressErrors({ ...addressErrors, addressLine1: undefined });
            }}
            aria-invalid={!!addressErrors.addressLine1}
          />
          {addressErrors.addressLine1 && (
            <p className="text-xs text-destructive">{addressErrors.addressLine1}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            placeholder="Locality, Landmark (optional)"
            value={address.addressLine2}
            onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="Enter city"
            value={address.city}
            onChange={(e) => {
              setAddress({ ...address, city: e.target.value });
              if (addressErrors.city) setAddressErrors({ ...addressErrors, city: undefined });
            }}
            aria-invalid={!!addressErrors.city}
          />
          {addressErrors.city && (
            <p className="text-xs text-destructive">{addressErrors.city}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="state">State *</Label>
          <Select
            value={address.state}
            onValueChange={(val) => {
              setAddress({ ...address, state: val });
              if (addressErrors.state) setAddressErrors({ ...addressErrors, state: undefined });
            }}
          >
            <SelectTrigger
              className={cn('w-full', addressErrors.state ? 'border-destructive' : '')}
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {addressErrors.state && (
            <p className="text-xs text-destructive">{addressErrors.state}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pincode" className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            Pincode *
          </Label>
          <Input
            id="pincode"
            placeholder="6-digit pincode"
            value={address.pincode}
            onChange={(e) => {
              setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) });
              if (addressErrors.pincode) setAddressErrors({ ...addressErrors, pincode: undefined });
            }}
            aria-invalid={!!addressErrors.pincode}
          />
          {addressErrors.pincode && (
            <p className="text-xs text-destructive">{addressErrors.pincode}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="saveAddress"
            checked={address.saveAddress}
            onCheckedChange={(checked) =>
              setAddress({ ...address, saveAddress: checked === true })
            }
          />
          <Label htmlFor="saveAddress" className="text-sm text-muted-foreground">
            Save this address for future orders
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="sameAsBilling"
            checked={sameAsBilling}
            onCheckedChange={(checked) => setSameAsBilling(checked === true)}
          />
          <Label htmlFor="sameAsBilling" className="text-sm text-muted-foreground">
            Billing address same as delivery address
          </Label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" onClick={() => goToStep(2)}>
          Continue to Payment
          <CreditCard className="size-4" />
        </Button>
      </div>
    </div>
  );

  // ── Render Step 2: Payment ──────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Payment Method</h2>
      </div>

      <RadioGroup
        value={paymentMethod}
        onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
        className="space-y-3"
      >
        {/* Razorpay - Online Payment */}
        <div
          className={cn(
            'rounded-lg border p-4 transition-colors',
            paymentMethod === 'razorpay' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'
          )}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="razorpay" id="razorpay" />
            <Label htmlFor="razorpay" className="flex cursor-pointer items-center gap-2 font-medium">
              <ShieldCheck className="size-4 text-amber-600" />
              Online Payment (UPI, Cards, NetBanking, Wallets)
            </Label>
          </div>
          {paymentMethod === 'razorpay' && (
            <div className="mt-4 pl-7 space-y-4">
              <div className="rounded-lg border bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Powered by</span>
                    <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white">Razorpay</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pay securely using UPI, Credit/Debit Cards, NetBanking, or Wallets.
                  Your payment is protected with 256-bit SSL encryption.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">UPI</span>
                  <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">VISA</span>
                  <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">MC</span>
                  <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">RuPay</span>
                  <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">NetBanking</span>
                  <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">Wallets</span>
                </div>
                <RazorpayCheckout
                  amount={Math.round(total * 100)} // Convert to paise
                  customerName={address.fullName}
                  customerEmail={undefined}
                  customerPhone={address.phone}
                  description={`MeraShop Order - ${formatINR(total)}`}
                  onSuccess={async (response) => {
                    setPlacing(true);
                    try {
                      const orderData = {
                        shippingAddress: {
                          fullName: address.fullName,
                          phone: address.phone,
                          addressLine1: address.addressLine1,
                          addressLine2: address.addressLine2,
                          city: address.city,
                          state: address.state,
                          pincode: address.pincode,
                        },
                        paymentMethod: 'razorpay',
                        couponCode: appliedCoupon?.code,
                        items: items.map((item) => ({
                          productId: item.productId,
                          quantity: item.quantity,
                          variantId: item.variantId,
                          variantName: item.variantName,
                          unitPrice: item.salePrice ?? item.price,
                          totalPrice: (item.salePrice ?? item.price) * item.quantity,
                        })),
                        subtotal,
                        shippingCost: deliveryCharge,
                        discountAmount: productDiscount + couponDiscount,
                        totalAmount: total,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature,
                      };

                      const res = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData),
                      });

                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || 'Failed to place order');
                      }

                      const data = await res.json();
                      clearCart();
                      notifyOrderSuccess(data.order.orderNumber);
                      router.push(`/payment/success?order=${data.order.orderNumber}`);
                    } catch (err) {
                      console.error('Order placement failed after payment:', err);
                      router.push('/payment/failure');
                    } finally {
                      setPlacing(false);
                    }
                  }}
                  onCancel={() => {
                    // User dismissed the Razorpay modal — no action needed, error shown by component
                  }}
                  onError={(error) => {
                    // Error is displayed by the RazorpayCheckout component itself
                    console.warn('Razorpay payment error:', error);
                  }}
                  disabled={placing || !address.fullName || !address.phone}
                  orderNotes={{
                    address_type: address.addressType,
                    items_count: String(itemCount),
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* UPI */}
        <div
          className={cn(
            'rounded-lg border p-4 transition-colors',
            paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          )}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="upi" id="upi" />
            <Label htmlFor="upi" className="flex cursor-pointer items-center gap-2 font-medium">
              <Smartphone className="size-4 text-violet-600" />
              UPI (Demo)
            </Label>
          </div>
          {paymentMethod === 'upi' && (
            <div className="mt-4 pl-7 space-y-4">
              {/* UPI QR Code Mock */}
              <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <QrCode className="size-5 text-primary" />
                  Scan QR to Pay
                </div>
                <div className="relative h-36 w-36 rounded-lg bg-white p-2 shadow-sm">
                  {/* Mock QR pattern */}
                  <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-0.5">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'rounded-[1px]',
                          (i < 3 || (i > 4 && i < 8) || i % 8 < 3 || i % 8 > 4 || (i * 7 + 13) % 3 !== 0)
                            ? 'bg-foreground/80'
                            : 'bg-transparent'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Open any UPI app & scan</p>
              </div>

              {/* UPI Apps */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Pay with any UPI app</p>
                <div className="flex gap-2">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/50"
                    >
                      <span className={cn('h-4 w-4 rounded-full', app.color)} />
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI ID input */}
              <div className="space-y-1.5">
                <Label className="text-sm">Or enter UPI ID</Label>
                <Input
                  placeholder="name@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Card */}
        <div
          className={cn(
            'rounded-lg border p-4 transition-colors',
            paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          )}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex cursor-pointer items-center gap-2 font-medium">
              <CreditCard className="size-4 text-rose-600" />
              Credit / Debit Card (Demo)
            </Label>
            {cardType && paymentMethod === 'card' && (
              <Badge variant="outline" className="text-[10px] h-5">
                {cardType}
              </Badge>
            )}
          </div>
          {paymentMethod === 'card' && (
            <div className="mt-4 space-y-3 pl-7">
              <div className="space-y-1.5">
                <Label className="text-sm">Card Number</Label>
                <div className="relative max-w-sm">
                  <Input
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    className="pr-12"
                  />
                  {cardType && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      {cardType}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3 max-w-sm">
                <div className="space-y-1.5">
                  <Label className="text-sm">Expiry</Label>
                  <Input
                    placeholder="MM/YY"
                    value={formatExpiry(cardExpiry)}
                    onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-28"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">CVV</Label>
                  <div className="relative">
                    <Input
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="w-24 pr-8"
                      type={showCvv ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvv(!showCvv)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCvv ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="size-3" />
                Payment processed securely via Razorpay
              </p>
            </div>
          )}
        </div>

        {/* EMI */}
        <div
          className={cn(
            'rounded-lg border p-4 transition-colors',
            paymentMethod === 'emi' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          )}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="emi" id="emi" />
            <Label htmlFor="emi" className="flex cursor-pointer items-center gap-2 font-medium">
              <CreditCard className="size-4 text-amber-600" />
              EMI
            </Label>
            <Badge className="text-[10px] h-5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              No Cost EMI
            </Badge>
          </div>
          {paymentMethod === 'emi' && (
            <div className="mt-4 pl-7 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Select EMI tenure</Label>
                <div className="flex gap-2 flex-wrap">
                  {['3', '6', '9', '12', '18', '24'].map((months) => {
                    const perMonth = Math.ceil(total / parseInt(months));
                    return (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setEmiMonths(months)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-center transition-all',
                          emiMonths === months
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <p className="text-sm font-semibold">{months} mo</p>
                        <p className="text-[10px] text-muted-foreground">{formatINR(perMonth)}/mo</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                EMI available on select credit cards. No extra charges on 3 & 6 month tenure.
              </p>
            </div>
          )}
        </div>

        {/* Net Banking */}
        <div
          className={cn(
            'rounded-lg border p-4 transition-colors',
            paymentMethod === 'netbanking' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          )}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="netbanking" id="netbanking" />
            <Label
              htmlFor="netbanking"
              className="flex cursor-pointer items-center gap-2 font-medium"
            >
              <Building2 className="size-4 text-sky-600" />
              Net Banking
            </Label>
          </div>
          {paymentMethod === 'netbanking' && (
            <div className="mt-4 pl-7 space-y-3">
              <p className="text-sm font-medium">Popular Banks</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POPULAR_BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBank(bank.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all',
                      selectedBank === bank.id
                        ? 'border-primary bg-primary/5 font-medium'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <Building2 className="size-4 text-muted-foreground" />
                    {bank.short}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Other Banks</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {OTHER_BANKS.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* COD */}
        <div
          className={cn(
            'rounded-lg border p-4 transition-colors',
            paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          )}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="cod" id="cod" />
            <Label htmlFor="cod" className="flex cursor-pointer items-center gap-2 font-medium">
              <Banknote className="size-4 text-emerald-600" />
              Cash on Delivery
            </Label>
            <Badge variant="secondary" className="text-[10px]">
              ₹0 extra
            </Badge>
          </div>
        </div>

        {/* Demo Payment */}
        <div
          className={cn(
            'rounded-lg border p-4 transition-colors',
            paymentMethod === 'demo' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'
          )}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="demo" id="demo" />
            <Label htmlFor="demo" className="flex cursor-pointer items-center gap-2 font-medium">
              <Zap className="size-4 text-emerald-600" />
              Demo Payment (Instant Success)
            </Label>
          </div>
          {paymentMethod === 'demo' && (
            <div className="mt-4 pl-7">
              <div className="rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-2">
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  🧪 Demo Mode — Payment will succeed instantly without real charges
                </p>
                <p className="text-xs text-muted-foreground">
                  Use this to test the checkout flow. No real payment will be processed.
                </p>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placing || termsAccepted === false}
                  className="w-full gap-2 mt-2"
                >
                  {placing ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  {placing ? 'Placing Order...' : 'Place Demo Order'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </RadioGroup>

      <div className="flex justify-between">
        <Button variant="ghost" className="gap-1" onClick={() => goToStep(1)}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button className="gap-2" onClick={() => goToStep(3)}>
          Review Order
          <ClipboardCheck className="size-4" />
        </Button>
      </div>
    </div>
  );

  // ── Render Step 3: Review ──────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Review Your Order</h2>
      </div>

      {/* Delivery estimate */}
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <CalendarDays className="size-5 text-primary flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Expected delivery by {deliveryEstimate}</p>
          <p className="text-xs text-muted-foreground">Order within 2 hours for same-day dispatch</p>
        </div>
      </div>

      {/* Address summary */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 text-primary" />
              Delivery Address
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => goToStep(1)}>
              Change
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{address.fullName}</span>
            <Badge variant="secondary" className="text-[10px] h-4 capitalize">
              {address.addressType}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{address.phone}</p>
          <p className="text-sm text-muted-foreground">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {address.city}, {address.state} - {address.pincode}
          </p>
        </CardContent>
      </Card>

      {/* Payment summary */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CreditCard className="size-4 text-primary" />
              Payment Method
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => goToStep(2)}>
              Change
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            {paymentMethod === 'upi' && (
              <>
                <Smartphone className="size-4 text-violet-600" />
                <span>UPI{upiId && ` - ${upiId}`}</span>
              </>
            )}
            {paymentMethod === 'card' && (
              <>
                <CreditCard className="size-4 text-rose-600" />
                <span>Card{cardNumber && ` ending ${cardNumber.slice(-4)}`}</span>
                {cardType && <Badge variant="outline" className="text-[10px] h-5">{cardType}</Badge>}
              </>
            )}
            {paymentMethod === 'emi' && (
              <>
                <CreditCard className="size-4 text-amber-600" />
                <span>EMI - {emiMonths} months ({formatINR(Math.ceil(total / parseInt(emiMonths)))}/mo)</span>
              </>
            )}
            {paymentMethod === 'netbanking' && (
              <>
                <Building2 className="size-4 text-sky-600" />
                <span>Net Banking{selectedBank && ` - ${selectedBank.toUpperCase()}`}</span>
              </>
            )}
            {paymentMethod === 'cod' && (
              <>
                <Banknote className="size-4 text-emerald-600" />
                <span>Cash on Delivery</span>
              </>
            )}
            {paymentMethod === 'razorpay' && (
              <>
                <ShieldCheck className="size-4 text-amber-600" />
                <span>Online Payment (Razorpay)</span>
              </>
            )}
            {paymentMethod === 'demo' && (
              <>
                <Zap className="size-4 text-emerald-600" />
                <span>Demo Payment (Instant Success)</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShoppingBag className="size-4 text-primary" />
            Order Items ({itemCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => {
            const effectivePrice = item.salePrice ?? item.price;
            const discount = calcDiscountPercent(item.price, item.salePrice);
            return (
              <div
                key={`${item.productId}-${item.variantId ?? 'nv'}`}
                className="flex gap-3"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {formatINR(effectivePrice)}
                    </span>
                    {discount > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatINR(item.price)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  {formatINR(effectivePrice * item.quantity)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Price breakdown */}
      <Card>
        <CardContent className="space-y-2 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          {productDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Product Discount</span>
              <span>−{formatINR(productDiscount)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Coupon ({appliedCoupon?.code})</span>
              <span>−{formatINR(couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            {deliveryCharge === 0 ? (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
            ) : (
              <span>{formatINR(deliveryCharge)}</span>
            )}
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-primary">{formatINR(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="mt-0.5"
        />
        <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
          I agree to the{' '}
          <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </Label>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
        <ShieldCheck className="size-4 flex-shrink-0" />
        Your payment information is encrypted and secure. MeraShop never stores your card details.
      </div>

      {/* Payment action based on method */}
      {paymentMethod === 'razorpay' ? (
        <div className="space-y-3">
          <RazorpayCheckout
            amount={Math.round(total * 100)} // Convert to paise
            customerName={address.fullName}
            customerEmail={undefined}
            customerPhone={address.phone}
            description={`MeraShop Order - ${formatINR(total)}`}
            onSuccess={async (response) => {
              setPlacing(true);
              try {
                const orderData = {
                  shippingAddress: {
                    fullName: address.fullName,
                    phone: address.phone,
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                  },
                  paymentMethod: 'razorpay',
                  couponCode: appliedCoupon?.code,
                  items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    variantId: item.variantId,
                    variantName: item.variantName,
                    unitPrice: item.salePrice ?? item.price,
                    totalPrice: (item.salePrice ?? item.price) * item.quantity,
                  })),
                  subtotal,
                  shippingCost: deliveryCharge,
                  discountAmount: productDiscount + couponDiscount,
                  totalAmount: total,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                };

                const res = await fetch('/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(orderData),
                });

                if (!res.ok) {
                  const data = await res.json();
                  throw new Error(data.error || 'Failed to place order');
                }

                const data = await res.json();
                clearCart();
                notifyOrderSuccess(data.order.orderNumber);
                router.push(`/order-confirmation?order=${data.order.orderNumber}`);
              } catch (err) {
                console.error('Order placement failed after payment:', err);
                router.push('/payment/failure');
              } finally {
                setPlacing(false);
              }
            }}
            onCancel={() => {
              // User dismissed the Razorpay modal — no action needed, error shown by component
            }}
            onError={(error) => {
              console.warn('Razorpay payment error:', error);
            }}
            disabled={placing || !termsAccepted || !address.fullName || !address.phone}
            orderNotes={{
              address_type: address.addressType,
              items_count: String(itemCount),
            }}
          />
          <div className="flex justify-start">
            <Button variant="ghost" className="gap-1" onClick={() => goToStep(2)}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
          </div>
        </div>
      ) : paymentMethod === 'demo' ? (
        <div className="space-y-3">
          <div className="rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
              <Zap className="size-4" />
              Demo Payment — Instant Success
            </p>
            <p className="text-xs text-muted-foreground">
              No real payment will be processed. The order will be placed immediately.
            </p>
            <Button
              onClick={handlePlaceOrder}
              disabled={placing || !termsAccepted}
              className="w-full gap-2 mt-2"
              size="lg"
            >
              {placing ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {placing ? 'Placing Demo Order...' : `Place Demo Order • ${formatINR(total)}`}
            </Button>
          </div>
          <div className="flex justify-start">
            <Button variant="ghost" className="gap-1" onClick={() => goToStep(2)}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between">
          <Button variant="ghost" className="gap-1" onClick={() => goToStep(2)}>
            <ChevronLeft className="size-4" />
            Back
          </Button>
          <Button
            className="gap-2 min-w-[180px]"
            size="lg"
            onClick={handlePlaceOrder}
            disabled={placing || !termsAccepted}
          >
            {placing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Place Order • {formatINR(total)}
              </>
            )}
          </Button>
        </div>
      )}

      {/* 100% Secure Payment trust badge */}
      <div className="flex items-center justify-center gap-2 py-2">
        <ShieldCheck className="size-5 text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          100% Secure Payment
        </span>
      </div>
    </div>
  );

  return (
    <div className="container-shop section-padding">
      <StepIndicator />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main step content - 60% */}
        <div className="lg:col-span-3">
          {/* Mobile collapsible order summary */}
          <div className="lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              className="w-full flex items-center justify-between rounded-lg border bg-card p-3 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-primary" />
                Order Summary ({itemCount} items)
              </span>
              <span className="flex items-center gap-2">
                <span className="font-bold text-primary">{formatINR(total)}</span>
                {mobileSummaryOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </span>
            </button>
            {mobileSummaryOpen && (
              <div className="mt-2">
                <OrderSummarySidebar />
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-4 sm:p-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar summary (desktop) - 40% */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="sticky top-24">
            <OrderSummarySidebar />
          </div>
        </div>
      </div>

      {/* Mobile summary bar at bottom */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 backdrop-blur-sm lg:hidden safe-bottom">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{itemCount} items</p>
            <p className="text-lg font-bold text-primary">{formatINR(total)}</p>
          </div>
          {currentStep < 3 ? (
            <Button
              className="gap-2"
              onClick={() => goToStep((currentStep + 1) as CheckoutStep)}
            >
              {currentStep === 1 ? 'Continue' : 'Review Order'}
            </Button>
          ) : (
            <Button
              className="gap-2"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={placing || !termsAccepted}
            >
              {placing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                `Pay ${formatINR(total)}`
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Extra bottom padding on mobile for sticky bar */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
