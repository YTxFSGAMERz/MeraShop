'use client';

import Link from 'next/link';
import {
  ShoppingBag,
  Users,
  MapPin,
  Package,
  Heart,
  Shield,
  Lightbulb,
  Award,
  ArrowRight,
  Target,
  Eye,
} from 'lucide-react';

import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
}

const stats: Stat[] = [
  { label: 'Products', value: '50,000+', icon: Package },
  { label: 'Happy Customers', value: '10 Lakh+', icon: Users },
  { label: 'Cities Served', value: '500+', icon: MapPin },
  { label: 'Brands', value: '2,000+', icon: Award },
];

const values = [
  {
    icon: Heart,
    title: 'Customer First',
    description:
      'Every decision we make starts with our customers. Your satisfaction is our measure of success.',
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description:
      'We believe in honest pricing, genuine products, and clear communication — no hidden charges, no surprises.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'From AI-powered recommendations to seamless UPI payments, we leverage technology to make shopping effortless.',
  },
  {
    icon: Users,
    title: 'Inclusive & Diverse',
    description:
      'India is diverse, and so are we. Our catalogue spans every need, every budget, and every corner of Bharat.',
  },
];

const teamMembers = [
  { name: 'Arjun Mehta', role: 'Founder & CEO', initials: 'AM' },
  { name: 'Priya Sharma', role: 'Chief Operating Officer', initials: 'PS' },
  { name: 'Rahul Verma', role: 'Head of Technology', initials: 'RV' },
  { name: 'Ananya Iyer', role: 'VP of Marketing', initials: 'AI' },
  { name: 'Vikram Singh', role: 'Head of Supply Chain', initials: 'VS' },
  { name: 'Neha Gupta', role: 'Customer Experience Lead', initials: 'NG' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div
            className="max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6">
              About {SITE_NAME}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-2 font-medium">
              {SITE_TAGLINE}
            </p>
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
              Born in India, built for India — we are on a mission to make online
              shopping simple, trustworthy, and joyful for every Indian household.
            </p>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
      </section>

      {/* ── Our Story ────────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {SITE_NAME} started with a simple idea: every Indian deserves
              access to quality products at fair prices, no matter where they
              live. Founded in 2022 in Mumbai, we began as a small team
              passionate about solving the challenges of online shopping in
              India — from confusing prices to unreliable delivery.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Today, we serve millions of customers across 500+ cities,
              partnering with over 2,000 trusted brands to bring you everything
              from smartphones to sarees, kitchen appliances to skincare — all
              under one roof.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our journey is just beginning. With every order, every review, and
              every smile we deliver, we move closer to our vision of becoming
              India&apos;s most loved shopping destination.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ─────────────────────────────────────────────── */}
      <section className="section-padding bg-muted/40">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Mission */}
            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 md:p-8">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To make quality products accessible and affordable for every
                  Indian family. We strive to provide a seamless, secure, and
                  delightful shopping experience — from discovery to doorstep
                  delivery.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 md:p-8">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To become India&apos;s most trusted and loved e-commerce
                  platform, where every purchase brings joy, every interaction
                  builds trust, and every Indian feels at home.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="text-center hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="section-padding bg-muted/40">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              What We Stand For
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our core values guide every product we list, every partnership we
              build, and every order we deliver.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="hover:shadow-md transition-shadow text-center"
                >
                  <CardContent className="p-6">
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="size-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind {SITE_NAME} who work tirelessly to
              bring you the best shopping experience.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center">
                <div className="size-20 md:size-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 border-2 border-primary/20">
                  <span className="text-lg md:text-xl font-bold text-primary">
                    {member.initials}
                  </span>
                </div>
                <h4 className="font-semibold text-sm md:text-base">
                  {member.name}
                </h4>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8 text-center">
          <ShoppingBag className="size-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Explore?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Discover thousands of products across electronics, fashion, home &amp;
            more — all at unbeatable prices.
          </p>
          <Button size="lg" asChild>
            <Link href="/shop">
              Start Shopping
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
