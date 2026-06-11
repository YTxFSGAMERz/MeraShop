'use client';

import Link from 'next/link';
import {
  SearchX,
  Home,
  ShoppingBag,
  Search,
  ArrowRight,
} from 'lucide-react';

import { SITE_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center section-padding">
      <div className="container-shop px-4 md:px-6 lg:px-8 max-w-lg mx-auto text-center">
        {/* Fun Icon */}
        <div className="relative mb-6 inline-block">
          <div className="size-28 md:size-36 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <SearchX className="size-14 md:size-20 text-primary" />
          </div>
          <span className="absolute -top-1 -right-1 text-5xl md:text-6xl font-extrabold text-primary/10">
            404
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-6">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let&apos;s help you find what you need.
        </p>

        {/* Search Suggestion */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form
              action="/search"
              method="get"
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search for products..."
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <Home className="size-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">
              <ShoppingBag className="size-4 mr-2" />
              Browse Products
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Think this is an error?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Let us know
          </Link>{' '}
          and we&apos;ll fix it.
        </p>
      </div>
    </div>
  );
}
