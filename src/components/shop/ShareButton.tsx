'use client';

import { useCallback } from 'react';
import { Share2, Link2, MessageCircle, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonProps {
  productName: string;
  slug: string;
}

export function ShareButton({ productName, slug }: ShareButtonProps) {
  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/product/${slug}`
    : `/product/${slug}`;

  const shareText = `Check out ${productName} on MeraShop!`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  }, [productUrl]);

  const handleShareWhatsApp = useCallback(() => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${productUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [shareText, productUrl]);

  const handleShareTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [shareText, productUrl]);

  const handleShareFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [productUrl]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: productUrl,
        });
      } catch (err) {
        // User cancelled or error — do nothing
        if ((err as DOMException).name !== 'AbortError') {
          toast.error('Sharing failed');
        }
      }
    }
  }, [productName, shareText, productUrl]);

  // If Web Share API is available (mobile), use a simple button
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  if (canNativeShare) {
    return (
      <Button
        size="lg"
        variant="outline"
        onClick={handleNativeShare}
        className="size-12 p-0 shrink-0"
        aria-label="Share product"
      >
        <Share2 className="size-5" />
      </Button>
    );
  }

  // Desktop: dropdown menu fallback
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="size-12 p-0 shrink-0"
          aria-label="Share product"
        >
          <Share2 className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
          <Link2 className="size-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareWhatsApp} className="gap-2 cursor-pointer">
          <MessageCircle className="size-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter} className="gap-2 cursor-pointer">
          <Twitter className="size-4 text-sky-500" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareFacebook} className="gap-2 cursor-pointer">
          <svg className="size-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
