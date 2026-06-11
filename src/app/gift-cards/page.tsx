'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Cake,
  Heart,
  Sparkles,
  Church,
  HandHeart,
  Award,
  Mail,
  MessageCircle,
  Printer,
  ArrowLeft,
  Gift,
  Send,
  Check,
  ChevronRight,
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ── Occasion Data ──────────────────────────────────────────────────────────
const OCCASIONS = [
  { id: 'birthday', label: 'Birthday', icon: Cake, gradient: 'from-pink-500 to-rose-500', bgLight: 'bg-pink-50 dark:bg-pink-950/30' },
  { id: 'anniversary', label: 'Anniversary', icon: Heart, gradient: 'from-red-500 to-pink-500', bgLight: 'bg-red-50 dark:bg-red-950/30' },
  { id: 'festival', label: 'Festival', icon: Sparkles, gradient: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50 dark:bg-amber-950/30' },
  { id: 'wedding', label: 'Wedding', icon: Church, gradient: 'from-purple-500 to-indigo-500', bgLight: 'bg-purple-50 dark:bg-purple-950/30' },
  { id: 'thankyou', label: 'Thank You', icon: HandHeart, gradient: 'from-emerald-500 to-teal-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { id: 'congrats', label: 'Congratulations', icon: Award, gradient: 'from-yellow-500 to-amber-500', bgLight: 'bg-yellow-50 dark:bg-yellow-950/30' },
] as const;

// ── Gift Card Design Data ──────────────────────────────────────────────────
const CARD_DESIGNS = [
  {
    id: 'saffron',
    label: 'Saffron Joy',
    gradient: 'from-orange-400 via-amber-400 to-yellow-400',
    textColor: 'text-white',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
  },
  {
    id: 'emerald',
    label: 'Emerald Bliss',
    gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    textColor: 'text-white',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)',
  },
  {
    id: 'ocean',
    label: 'Ocean Breeze',
    gradient: 'from-sky-400 via-blue-400 to-indigo-400',
    textColor: 'text-white',
    pattern: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  {
    id: 'rose',
    label: 'Rose Garden',
    gradient: 'from-rose-400 via-pink-400 to-fuchsia-400',
    textColor: 'text-white',
    pattern: 'radial-gradient(circle at 50% 90%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 90% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)',
  },
  {
    id: 'royal',
    label: 'Royal Purple',
    gradient: 'from-purple-400 via-violet-400 to-indigo-400',
    textColor: 'text-white',
    pattern: 'radial-gradient(circle at 10% 90%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(255,255,255,0.1) 0%, transparent 50%)',
  },
  {
    id: 'sunset',
    label: 'Sunset Glow',
    gradient: 'from-red-400 via-orange-400 to-amber-400',
    textColor: 'text-white',
    pattern: 'radial-gradient(circle at 70% 80%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)',
  },
] as const;

// ── Delivery Options ───────────────────────────────────────────────────────
const DELIVERY_OPTIONS = [
  { id: 'email', label: 'Email Delivery', description: 'Send instantly via email', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', description: 'Share on WhatsApp', icon: MessageCircle },
  { id: 'print', label: 'Print at Home', description: 'Download & print', icon: Printer },
] as const;

// ── Preset Amounts ─────────────────────────────────────────────────────────
const PRESET_AMOUNTS = [500, 1000, 2000, 5000] as const;

// ── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Format INR helper ──────────────────────────────────────────────────────
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Main Page Component ────────────────────────────────────────────────────
export default function GiftCardsPage() {
  const [selectedDesign, setSelectedDesign] = useState<string>('saffron');
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('birthday');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('email');
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');

  const activeDesign = CARD_DESIGNS.find((d) => d.id === selectedDesign) ?? CARD_DESIGNS[0];

  const displayAmount = useMemo(() => {
    if (useCustomAmount && customAmount) {
      const parsed = parseInt(customAmount, 10);
      if (!isNaN(parsed) && parsed >= 100 && parsed <= 10000) return parsed;
    }
    return selectedAmount;
  }, [useCustomAmount, customAmount, selectedAmount]);

  const handleCustomAmountChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    setCustomAmount(digits);
    if (digits) {
      setUseCustomAmount(true);
    }
  };

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setUseCustomAmount(false);
    setCustomAmount('');
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <Gift className="size-6 text-primary" />
                Gift Cards
              </h1>
              <p className="text-sm text-muted-foreground">
                The perfect gift for every occasion
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-shop px-4 md:px-6 lg:px-8 py-6 space-y-10">
        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 dark:from-orange-600 dark:via-amber-600 dark:to-yellow-600 p-6 md:p-10 text-white"
        >
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 size-20 rounded-full bg-white/10 blur-sm" />
          <div className="absolute bottom-4 left-8 size-16 rounded-full bg-white/10 blur-sm" />
          <div className="absolute top-1/2 right-1/4 size-8 rounded-full bg-white/15" />
          <motion.div
            className="absolute top-8 right-1/3"
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="size-6 text-white/30" />
          </motion.div>
          <motion.div
            className="absolute bottom-6 right-12"
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Gift className="size-8 text-white/20" />
          </motion.div>

          <div className="relative z-10 max-w-xl">
            <motion.h2
              className="text-3xl md:text-4xl font-extrabold mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Gift Cards
            </motion.h2>
            <motion.p
              className="text-white/90 text-base md:text-lg mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              Perfect gift for every occasion. Give the joy of choice with {SITE_NAME} gift cards.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
                Instant Delivery
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
                No Expiry
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
                Any Amount
              </Badge>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Occasion Grid ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Choose an Occasion
          </h2>
          <motion.div
            className="grid grid-cols-3 md:grid-cols-6 gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {OCCASIONS.map((occasion) => {
              const IconComp = occasion.icon;
              const isSelected = selectedOccasion === occasion.id;
              return (
                <motion.button
                  key={occasion.id}
                  variants={itemVariants}
                  onClick={() => setSelectedOccasion(occasion.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-transparent bg-card hover:border-border'
                  )}
                >
                  <div
                    className={cn(
                      'size-12 rounded-full flex items-center justify-center bg-gradient-to-br text-white shadow-sm',
                      occasion.gradient
                    )}
                  >
                    <IconComp className="size-5" />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium text-center',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {occasion.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* ── Gift Card Designs ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Pick a Design
          </h2>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {CARD_DESIGNS.map((design) => {
              const isSelected = selectedDesign === design.id;
              return (
                <motion.button
                  key={design.id}
                  variants={itemVariants}
                  onClick={() => setSelectedDesign(design.id)}
                  className={cn(
                    'relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-lg',
                    isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-transparent'
                  )}
                >
                  <div
                    className={cn(
                      'aspect-[3/2] bg-gradient-to-br flex flex-col items-center justify-center gap-1 relative',
                      design.gradient
                    )}
                    style={{ backgroundImage: design.pattern }}
                  >
                    <Gift className={cn('size-6', design.textColor, 'opacity-80')} />
                    <span className={cn('text-xs font-bold', design.textColor, 'opacity-90')}>
                      {SITE_NAME}
                    </span>
                  </div>
                  <div className="p-2 bg-card">
                    <p className="text-xs font-medium text-center text-foreground truncate">
                      {design.label}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="size-3 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* ── Amount Selection + Preview ─────────────────────────────────── */}
        <section>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Amount Selection */}
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Select Amount
              </h2>

              {/* Preset Amounts */}
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount && !useCustomAmount ? 'default' : 'outline'}
                    size="lg"
                    className={cn(
                      'font-bold text-sm',
                      selectedAmount === amount && !useCustomAmount
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-sm'
                        : 'hover:border-primary/40'
                    )}
                    onClick={() => handlePresetClick(amount)}
                  >
                    {formatAmount(amount)}
                  </Button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Or enter a custom amount
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="100 - 10,000"
                    className="pl-9 h-11 text-lg font-semibold"
                    min={100}
                    max={10000}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Min: {formatAmount(100)} &bull; Max: {formatAmount(10000)}
                </p>
                {useCustomAmount && customAmount && (() => {
                  const parsed = parseInt(customAmount, 10);
                  if (isNaN(parsed) || parsed < 100 || parsed > 10000) {
                    return (
                      <p className="text-xs text-destructive mt-1">
                        Amount must be between {formatAmount(100)} and {formatAmount(10000)}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <Separator />

              {/* Delivery Options */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-3">
                  Delivery Method
                </h3>
                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map((option) => {
                    const IconComp = option.icon;
                    const isSelected = selectedDelivery === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedDelivery(option.id)}
                        className={cn(
                          'flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-all duration-200 text-left',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        )}
                      >
                        <div
                          className={cn(
                            'size-10 rounded-full flex items-center justify-center shrink-0',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <IconComp className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                        {isSelected && (
                          <Check className="size-5 text-primary ml-auto shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Personalization */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">
                  Personalize (Optional)
                </h3>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Recipient Name
                  </label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Sender Name
                  </label>
                  <Input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 150))}
                    placeholder="Write a heartfelt message..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.length}/150 characters
                  </p>
                </div>
              </div>

              {/* Buy Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base shadow-md hover:shadow-lg transition-all duration-200 h-12"
              >
                <Gift className="size-5 mr-2" />
                Buy Gift Card &mdash; {formatAmount(displayAmount)}
              </Button>
            </div>

            {/* Right: Live Preview Card */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Preview
              </h2>
              <motion.div
                key={selectedDesign + String(displayAmount)}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden shadow-lg border-0">
                  {/* Gift Card Face */}
                  <div
                    className={cn(
                      'relative aspect-[16/9] bg-gradient-to-br flex flex-col items-center justify-center p-6',
                      activeDesign.gradient
                    )}
                    style={{ backgroundImage: activeDesign.pattern }}
                  >
                    {/* Decorative circles */}
                    <div className="absolute top-4 left-4 size-16 rounded-full bg-white/10 blur-sm" />
                    <div className="absolute bottom-4 right-4 size-24 rounded-full bg-white/10 blur-sm" />
                    <div className="absolute top-1/2 right-1/4 size-6 rounded-full bg-white/15" />

                    <div className="relative z-10 text-center space-y-3">
                      <Gift className={cn('size-10 mx-auto opacity-80', activeDesign.textColor)} />
                      <h3 className={cn('text-2xl md:text-3xl font-extrabold', activeDesign.textColor)}>
                        {formatAmount(displayAmount)}
                      </h3>
                      <p className={cn('text-sm font-medium opacity-80', activeDesign.textColor)}>
                        {SITE_NAME} Gift Card
                      </p>
                    </div>
                  </div>

                  {/* Card Details */}
                  <CardContent className="p-4 space-y-3 bg-card">
                    {recipientName && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">To:</span>
                        <span className="text-sm font-medium text-foreground">{recipientName}</span>
                      </div>
                    )}
                    {senderName && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">From:</span>
                        <span className="text-sm font-medium text-foreground">{senderName}</span>
                      </div>
                    )}
                    {message && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground italic line-clamp-2">&ldquo;{message}&rdquo;</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const DeliveryIcon = DELIVERY_OPTIONS.find((o) => o.id === selectedDelivery)?.icon ?? Mail;
                          return <DeliveryIcon className="size-3.5 text-muted-foreground" />;
                        })()}
                        <span className="text-xs text-muted-foreground">
                          {DELIVERY_OPTIONS.find((o) => o.id === selectedDelivery)?.label}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {OCCASIONS.find((o) => o.id === selectedOccasion)?.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">
            How It Works
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {[
              {
                step: 1,
                title: 'Choose',
                description: 'Pick a design, occasion and amount that suits your needs',
                icon: Gift,
                gradient: 'from-orange-500 to-amber-500',
              },
              {
                step: 2,
                title: 'Personalize',
                description: 'Add a heartfelt message and choose your delivery method',
                icon: Heart,
                gradient: 'from-rose-500 to-pink-500',
              },
              {
                step: 3,
                title: 'Send',
                description: 'Send instantly via email, WhatsApp or print at home',
                icon: Send,
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <motion.div key={item.step} variants={itemVariants}>
                  <Card className="text-center p-6 h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="space-y-3">
                      <div
                        className={cn(
                          'size-14 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto text-white shadow-md',
                          item.gradient
                        )}
                      >
                        <IconComp className="size-6" />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="size-6 rounded-full bg-muted text-xs font-bold flex items-center justify-center text-muted-foreground">
                          {item.step}
                        </span>
                        <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ── Popular Gift Cards ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Popular Gift Cards
            </h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Fashion', gradient: 'from-pink-500 to-rose-500', amount: 2000 },
              { label: 'Electronics', gradient: 'from-blue-500 to-indigo-500', amount: 5000 },
              { label: 'Home & Decor', gradient: 'from-amber-500 to-orange-500', amount: 1500 },
              { label: 'Beauty', gradient: 'from-purple-500 to-fuchsia-500', amount: 1000 },
            ].map((card) => (
              <motion.div
                key={card.label}
                whileHover={{ y: -2 }}
                className="cursor-pointer"
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div
                    className={cn(
                      'aspect-[2/1] bg-gradient-to-br flex items-center justify-center',
                      card.gradient
                    )}
                  >
                    <div className="text-center text-white">
                      <Gift className="size-6 mx-auto opacity-70 mb-1" />
                      <p className="text-xs font-bold opacity-90">{card.label}</p>
                      <p className="text-lg font-extrabold">{formatAmount(card.amount)}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
