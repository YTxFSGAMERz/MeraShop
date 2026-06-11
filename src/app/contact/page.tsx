'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  CheckCircle2,
  Loader2,
  HelpCircle,
} from 'lucide-react';

import { SITE_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'support@merashop.in',
    subDetail: 'We reply within 24 hours',
    href: 'mailto:support@merashop.in',
  },
  {
    icon: Phone,
    title: 'Call Us',
    detail: '1800-123-4567',
    subDetail: 'Toll Free',
    href: 'tel:18001234567',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'Mumbai, Maharashtra',
    subDetail: 'India',
    href: null,
  },
  {
    icon: Clock,
    title: 'Business Hours',
    detail: 'Mon – Sat',
    subDetail: '9:00 AM – 6:00 PM IST',
    href: null,
  },
];

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com/merashop' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/merashop' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/merashop' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/merashop' },
];

const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'order', label: 'Order Issue' },
  { value: 'return', label: 'Return / Refund' },
  { value: 'product', label: 'Product Question' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'feedback', label: 'Feedback / Suggestion' },
  { value: 'partnership', label: 'Business Partnership' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <MessageCircle className="size-10 text-white/80 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3">
              Get in Touch
            </h1>
            <p className="text-base md:text-lg text-white/90">
              Have a question, suggestion, or issue? We&apos;d love to hear from
              you. Our team typically responds within 24 hours.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      </section>

      <div className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* ── Contact Form ─────────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 md:p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We&apos;ll get back to you
                        within 24 hours.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <h2 className="text-xl font-bold mb-1">
                        Send Us a Message
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Fields marked with <span className="text-red-500">*</span>{' '}
                        are required
                      </p>

                      {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                          {error}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-sm text-muted-foreground">
                              +91
                            </span>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="98765 43210"
                              value={form.phone}
                              onChange={handleChange}
                              className="rounded-l-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Select
                            value={form.subject}
                            onValueChange={(value) =>
                              setForm((prev) => ({ ...prev, subject: value }))
                            }
                          >
                            <SelectTrigger id="subject">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjectOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">
                          Message <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us how we can help you..."
                          rows={6}
                          value={form.message}
                          onChange={handleChange}
                          required
                          minLength={10}
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:w-auto"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="size-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Contact Info Sidebar ──────────────────────────────────────── */}
            <div className="space-y-6">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                const Wrapper = info.href ? 'a' : 'div';
                return (
                  <Card
                    key={info.title}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <Wrapper
                        {...(info.href
                          ? {
                              href: info.href,
                              className:
                                'flex items-start gap-4 no-underline text-inherit',
                            }
                          : { className: 'flex items-start gap-4' })}
                      >
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{info.title}</p>
                          <p className="text-sm text-foreground">
                            {info.detail}
                          </p>
                          {info.subDetail && (
                            <p className="text-xs text-muted-foreground">
                              {info.subDetail}
                            </p>
                          )}
                        </div>
                      </Wrapper>
                    </CardContent>
                  </Card>
                );
              })}

              {/* FAQ Link */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <HelpCircle className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        Looking for quick answers?
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Check our FAQ for instant answers to common questions.
                      </p>
                      <Button variant="link" size="sm" className="px-0 h-auto" asChild>
                        <Link href="/faq">Visit FAQ →</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardContent className="p-5">
                  <p className="font-semibold text-sm mb-3">Follow Us</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Stay connected for deals, updates & more on {SITE_NAME}.
                  </p>
                  <div className="flex items-center gap-2">
                    {socialLinks.map(({ icon: Icon, label, href }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Icon className="size-4" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
