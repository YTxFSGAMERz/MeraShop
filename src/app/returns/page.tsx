'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RefreshCcw,
  Truck,
  Clock,
  CreditCard,
  Package,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  Loader2,
  ShieldCheck,
  IndianRupee,
  Smartphone,
  CalendarDays,
  HelpCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbNav } from '@/components/layout/Breadcrumb';

// ── Animation variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ── Return Policy Data ──────────────────────────────────────────────────────
const POLICY_CARDS = [
  {
    icon: RefreshCcw,
    title: '7-Day Returns',
    description: 'Return most items within 7 days of delivery',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: Truck,
    title: 'Easy Pickup',
    description: 'Free doorstep pickup from your location',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    icon: CreditCard,
    title: 'Instant Refund',
    description: 'Refund initiated to original payment source',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: ShieldCheck,
    title: '15-Day Electronics',
    description: 'Extended 15-day window for electronics',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
];

// ── How to Return Steps ─────────────────────────────────────────────────────
const RETURN_STEPS = [
  {
    step: 1,
    title: 'Request Return',
    description: 'Go to My Orders, select the item, and click "Return"',
    icon: Package,
  },
  {
    step: 2,
    title: 'Schedule Pickup',
    description: 'Choose a convenient date and time for pickup',
    icon: CalendarDays,
  },
  {
    step: 3,
    title: 'Hand Over Item',
    description: 'Our delivery partner will pick it up from your doorstep',
    icon: Truck,
  },
  {
    step: 4,
    title: 'Get Refund',
    description: 'Refund is initiated after quality check is passed',
    icon: IndianRupee,
  },
];

// ── Eligibility Data ────────────────────────────────────────────────────────
const ELIGIBLE_ITEMS = [
  'Clothing & Fashion Accessories',
  'Footwear (unused, original packaging)',
  'Books & Stationery',
  'Electronics (within 15 days)',
  'Home & Kitchen items',
  'Beauty & Personal Care (sealed)',
  'Sports & Fitness Equipment',
  'Toys & Games (unopened)',
];

const NON_RETURNABLE_ITEMS = [
  'Innerwear & Lingerie',
  'Perishables & Groceries',
  'Personalized/Custom items',
  'Digital products & Gift cards',
  'Swimwear & Socks',
  'Used or damaged items',
  'Items without original packaging',
  'Clearance/Sale items (marked)',
];

// ── Refund Timeline Data ────────────────────────────────────────────────────
const REFUND_TIMELINE = [
  {
    method: 'UPI',
    icon: Smartphone,
    timeline: '2-3 business days',
    description: 'Fastest refund via UPI apps like GPay, PhonePe, Paytm',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    barColor: 'bg-emerald-500',
    width: 'w-[85%]',
  },
  {
    method: 'Credit/Debit Card',
    icon: CreditCard,
    timeline: '5-7 business days',
    description: 'Refund to original card used for payment',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    barColor: 'bg-blue-500',
    width: 'w-[60%]',
  },
  {
    method: 'Net Banking',
    icon: IndianRupee,
    timeline: '5-7 business days',
    description: 'Refund to your bank account via NEFT/IMPS',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    barColor: 'bg-purple-500',
    width: 'w-[60%]',
  },
  {
    method: 'Wallets (Paytm/Amazon Pay)',
    icon: Smartphone,
    timeline: '2-3 business days',
    description: 'Refund to your digital wallet',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    barColor: 'bg-orange-500',
    width: 'w-[85%]',
  },
  {
    method: 'COD (Cash on Delivery)',
    icon: IndianRupee,
    timeline: '7-10 business days',
    description: 'Refund via NEFT to your bank account',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    barColor: 'bg-amber-500',
    width: 'w-[40%]',
  },
];

// ── FAQ Data ────────────────────────────────────────────────────────────────
const RETURN_FAQS = [
  {
    question: 'How do I initiate a return?',
    answer:
      'Go to "My Orders" in your account, find the item you want to return, and click the "Return" button. Select a reason for the return and choose a pickup date. Our delivery partner will come to your doorstep to collect the item.',
  },
  {
    question: 'What is the return window for different categories?',
    answer:
      'Most items can be returned within 7 days of delivery. Electronics and appliances have an extended 15-day return window. Fashion items must be unused with original tags attached. Check the product page for specific return policies.',
  },
  {
    question: 'When will I receive my refund?',
    answer:
      'Refunds are initiated within 24 hours after the returned item passes the quality check. UPI refunds take 2-3 business days, card refunds take 5-7 business days, and COD refunds are sent via NEFT within 7-10 business days.',
  },
  {
    question: 'Can I return an item without the original packaging?',
    answer:
      'Items should be returned in their original packaging with all tags and accessories included. Returns without original packaging may be rejected during the quality check. However, we understand some packaging may be discarded — contact our support team for assistance.',
  },
  {
    question: 'Do I have to pay for return shipping?',
    answer:
      'No, return shipping is completely free for eligible items. Our delivery partner will pick up the item from your doorstep at no extra cost. This is part of our hassle-free returns promise.',
  },
  {
    question: 'What if my return pickup is missed?',
    answer:
      'If you miss a scheduled pickup, you can reschedule it from the "My Returns" section. We allow up to 3 rescheduling attempts. After that, please contact our support team for assistance.',
  },
  {
    question: 'Can I exchange an item instead of returning it?',
    answer:
      'Yes! For fashion items (clothing, footwear), you can choose the "Exchange" option instead of "Return" when initiating the request. Select the new size or variant, and we will deliver the exchanged item during pickup.',
  },
  {
    question: 'What happens if my return is rejected?',
    answer:
      'If the quality check fails (e.g., item is used, damaged, or missing parts), the return may be rejected. In such cases, the item will be shipped back to you at no cost, and our support team will reach out to discuss the next steps.',
  },
];

// ── Demo return tracking data ───────────────────────────────────────────────
const DEMO_RETURN = {
  orderNumber: 'MS-RETURN-2024',
  returnStatus: 'pickup_scheduled',
  returnReason: 'Size too large',
  returnInitiated: '2024-12-10',
  pickupDate: '2024-12-13',
  refundAmount: 1499,
  refundMethod: 'UPI',
  item: 'Men\'s Running Shoes - Size 10',
};

export default function ReturnsPage() {
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [returnData, setReturnData] = useState<typeof DEMO_RETURN | null>(null);
  const [trackError, setTrackError] = useState('');

  const handleTrackReturn = async () => {
    if (!trackOrderNumber.trim()) return;
    setIsTracking(true);
    setTrackError('');
    setReturnData(null);

    try {
      // Try real API first
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(trackOrderNumber.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setReturnData({
            orderNumber: data.order.orderNumber,
            returnStatus: 'requested',
            returnReason: 'Item not as expected',
            returnInitiated: data.order.createdAt ? new Date(data.order.createdAt).toISOString().split('T')[0] : '',
            pickupDate: '',
            refundAmount: data.order.totalAmount,
            refundMethod: data.order.paymentMethod || 'UPI',
            item: data.order.items?.[0]?.name || data.order.items?.[0]?.productName || 'Item from order',
          });
          setIsTracking(false);
          return;
        }
      }
      // Fallback to demo
      setReturnData({ ...DEMO_RETURN, orderNumber: trackOrderNumber.trim() });
    } catch {
      setReturnData({ ...DEMO_RETURN, orderNumber: trackOrderNumber.trim() });
    } finally {
      setIsTracking(false);
    }
  };

  const getReturnTimelineStep = (status: string) => {
    const steps = ['requested', 'approved', 'pickup_scheduled', 'picked_up', 'quality_check', 'refund_initiated', 'refunded'];
    return steps.indexOf(status);
  };

  const returnSteps = [
    { label: 'Return Requested', icon: Package },
    { label: 'Approved', icon: CheckCircle2 },
    { label: 'Pickup Scheduled', icon: Truck },
    { label: 'Picked Up', icon: Package },
    { label: 'Quality Check', icon: ShieldCheck },
    { label: 'Refund Initiated', icon: CreditCard },
    { label: 'Refunded', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 dark:from-orange-950/20 dark:via-amber-950/10 dark:to-red-950/20">
        <div className="indian-pattern-overlay absolute inset-0 opacity-50" />
        <div className="container-shop relative px-4 md:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumb */}
          <div className="mb-4">
            <BreadcrumbNav
              items={[
                { label: 'Home', href: '/' },
                { label: 'Returns & Refunds' },
              ]}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="size-12 md:size-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <RefreshCcw className="size-6 md:size-7 text-white" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold gradient-text">
                Returns & Refunds
              </h1>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg">
              Hassle-free returns with free doorstep pickup. Your satisfaction is our promise — get quick refunds to your original payment method.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-shop px-4 md:px-6 lg:px-8">
        {/* ── Return Policy Summary ────────────────────────────────────── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="section-padding"
        >
          <motion.h2
            variants={itemVariants}
            className="text-xl md:text-2xl font-bold text-foreground mb-6"
          >
            Our Return Policy
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {POLICY_CARDS.map((card) => {
              const IconComp = card.icon;
              return (
                <motion.div key={card.title} variants={itemVariants}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6 flex flex-col items-center text-center gap-3">
                      <div className={`size-12 md:size-14 rounded-xl ${card.bg} flex items-center justify-center`}>
                        <IconComp className={`size-6 md:size-7 ${card.color}`} />
                      </div>
                      <h3 className="font-bold text-sm md:text-base text-foreground">{card.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <Separator />

        {/* ── How to Return ────────────────────────────────────────────── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="section-padding"
        >
          <motion.h2
            variants={itemVariants}
            className="text-xl md:text-2xl font-bold text-foreground mb-6"
          >
            How to Return an Item
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {RETURN_STEPS.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <motion.div key={step.step} variants={itemVariants}>
                  <Card className="h-full relative group hover:shadow-md transition-all hover:-translate-y-1">
                    <CardContent className="p-4 md:p-6 flex flex-col items-center text-center gap-3">
                      {/* Step number */}
                      <div className="size-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {step.step}
                      </div>
                      {/* Icon */}
                      <div className="size-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                        <IconComp className="size-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="font-bold text-sm md:text-base text-foreground">{step.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      {/* Arrow connector (hidden on last step) */}
                      {idx < RETURN_STEPS.length - 1 && (
                        <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                          <ArrowRight className="size-5 text-primary/40" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <Separator />

        {/* ── Return Eligibility ───────────────────────────────────────── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="section-padding"
        >
          <motion.h2
            variants={itemVariants}
            className="text-xl md:text-2xl font-bold text-foreground mb-6"
          >
            Return Eligibility
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Eligible Items */}
            <motion.div variants={itemVariants}>
              <Card className="h-full border-emerald-200 dark:border-emerald-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-5" />
                    Eligible Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {ELIGIBLE_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Non-Returnable Items */}
            <motion.div variants={itemVariants}>
              <Card className="h-full border-red-200 dark:border-red-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle className="size-5" />
                    Non-Returnable Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {NON_RETURNABLE_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <XCircle className="size-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        <Separator />

        {/* ── Track Return ─────────────────────────────────────────────── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="section-padding"
        >
          <motion.h2
            variants={itemVariants}
            className="text-xl md:text-2xl font-bold text-foreground mb-2"
          >
            Track Your Return
          </motion.h2>
          <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-6">
            Enter your order number to check the status of your return
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-2 max-w-lg mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={trackOrderNumber}
                onChange={(e) => setTrackOrderNumber(e.target.value)}
                placeholder="Enter order number (e.g., MS-RETURN-2024)"
                className="pl-9 h-11"
                onKeyDown={(e) => e.key === 'Enter' && handleTrackReturn()}
              />
            </div>
            <Button
              onClick={handleTrackReturn}
              disabled={isTracking || !trackOrderNumber.trim()}
              className="h-11 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            >
              {isTracking ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Track Return
                  <ArrowRight className="size-4 ml-1" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Return tracking result */}
          {returnData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">
                      Return for Order #{returnData.orderNumber}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        returnData.returnStatus === 'refunded'
                          ? 'text-emerald-600 border-emerald-300'
                          : returnData.returnStatus === 'pickup_scheduled'
                          ? 'text-blue-600 border-blue-300'
                          : 'text-amber-600 border-amber-300'
                      }
                    >
                      {returnData.returnStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Item</p>
                      <p className="font-medium text-foreground">{returnData.item}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reason</p>
                      <p className="font-medium text-foreground">{returnData.returnReason}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Refund Amount</p>
                      <p className="font-bold text-price">₹{returnData.refundAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Refund Method</p>
                      <p className="font-medium text-foreground">{returnData.refundMethod}</p>
                    </div>
                  </div>

                  {/* Return timeline */}
                  <div className="pt-2">
                    <p className="text-sm font-semibold text-foreground mb-3">Return Progress</p>
                    <div className="relative">
                      {returnSteps.map((step, idx) => {
                        const currentStep = getReturnTimelineStep(returnData.returnStatus);
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        const isLast = idx === returnSteps.length - 1;
                        const IconComp = step.icon;

                        return (
                          <div key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
                            {!isLast && (
                              <div
                                className={`absolute left-[15px] top-[34px] w-0.5 h-[calc(100%-34px)] ${
                                  isCompleted ? 'bg-emerald-400' : 'bg-border'
                                }`}
                              />
                            )}
                            <div
                              className={`relative z-10 size-8 rounded-full flex items-center justify-center shrink-0 ${
                                isCompleted
                                  ? isCurrent
                                    ? 'bg-primary/10 ring-2 ring-primary'
                                    : 'bg-emerald-100 dark:bg-emerald-900/30'
                                  : 'bg-muted'
                              }`}
                            >
                              {isCompleted && !isCurrent ? (
                                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                              ) : isCurrent ? (
                                <IconComp className="size-3.5 text-primary animate-pulse" />
                              ) : (
                                <IconComp className="size-3.5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="pt-1">
                              <p
                                className={`text-xs font-medium ${
                                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!returnData && !trackError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-sm mx-auto text-center py-4"
            >
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <RefreshCcw className="size-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your order number above to track a return. Try any number for a demo.
              </p>
            </motion.div>
          )}
        </motion.section>

        <Separator />

        {/* ── Refund Timeline ──────────────────────────────────────────── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="section-padding"
        >
          <motion.h2
            variants={itemVariants}
            className="text-xl md:text-2xl font-bold text-foreground mb-2"
          >
            Refund Timeline
          </motion.h2>
          <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-6">
            How long until your refund arrives? It depends on your payment method.
          </motion.p>

          <div className="space-y-3 max-w-2xl">
            {REFUND_TIMELINE.map((item) => {
              const IconComp = item.icon;
              return (
                <motion.div key={item.method} variants={itemVariants}>
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`size-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                          <IconComp className={`size-4 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-sm text-foreground">{item.method}</h3>
                            <Badge variant="outline" className="text-xs shrink-0">
                              <Clock className="size-3 mr-1" />
                              {item.timeline}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        </div>
                      </div>
                      {/* Visual progress bar */}
                      <div className="ml-12">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${item.barColor}`}
                            initial={{ width: '0%' }}
                            whileInView={{ width: item.width.replace('w-[', '').replace(']', '') }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <Separator />

        {/* ── FAQ Section ──────────────────────────────────────────────── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="section-padding"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              {RETURN_FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-sm md:text-base text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </motion.section>

        {/* ── Bottom CTA ───────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-padding text-center"
        >
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6 md:p-8 flex flex-col items-center gap-4">
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                Need Help with a Return?
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Our customer support team is here to assist you with any return or refund queries.
              </p>
              <div className="flex gap-3">
                <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600">
                  <Link href="/contact">
                    Contact Support
                    <ArrowRight className="size-4 ml-1" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/account/orders">
                    View My Orders
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
