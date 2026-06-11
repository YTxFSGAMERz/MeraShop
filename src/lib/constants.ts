// ── MeraShop Site Constants ──────────────────────────────────────────────────

export const SITE_NAME = "MeraShop";
export const SITE_DESCRIPTION =
  "India's favourite online marketplace — fresh deals every day on fashion, electronics, home & more.";
export const SITE_TAGLINE = "Dil Se Indian, Deal Se Smart";
export const SITE_URL = "https://merashop.in";

// ── Navigation ──────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/shop?view=categories" },
  { label: "Deals", href: "/shop?sort=discount" },
  { label: "About", href: "/about" },
];

export const MOBILE_NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Shop", href: "/shop", icon: "grid" },
  { label: "Cart", href: "/cart", icon: "cart" },
  { label: "Wishlist", href: "/wishlist", icon: "heart" },
  { label: "Account", href: "/account", icon: "user" },
];

// ── Footer Links ────────────────────────────────────────────────────────────

export interface FooterSection {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export const FOOTER_LINKS: Record<string, FooterSection> = {
  shop: {
    title: "Shop",
    links: [
      { label: "All Categories", href: "/shop" },
      { label: "Featured", href: "/shop?featured=true" },
      { label: "New Arrivals", href: "/shop?newArrival=true" },
      { label: "Bestsellers", href: "/shop?bestseller=true" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  customerService: {
    title: "Customer Service",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Info", href: "/faq?category=shipping" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Track Order", href: "/track-order" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/about" },
      { label: "Press", href: "/about" },
    ],
  },
  connect: {
    title: "Connect",
    links: [
      { label: "Facebook", href: "https://facebook.com/merashop" },
      { label: "Instagram", href: "https://instagram.com/merashop" },
      { label: "Twitter", href: "https://twitter.com/merashop" },
      { label: "YouTube", href: "https://youtube.com/merashop" },
    ],
  },
};

// ── Category Colors ─────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fashion: { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800" },
  electronics: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  home: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  beauty: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  grocery: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  sports: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  toys: { bg: "bg-yellow-50 dark:bg-yellow-950/30", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-800" },
  books: { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
};

// ── Payment Methods ─────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
  { label: "UPI", id: "upi" },
  { label: "Cards", id: "cards" },
  { label: "Net Banking", id: "netbanking" },
  { label: "COD", id: "cod" },
  { label: "EMI", id: "emi" },
];

// ── Utility Functions ───────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees (INR).
 *
 * Uses the Indian numbering system (e.g. 1,00,000) and the ₹ symbol.
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate the discount percentage between the original price and the sale price.
 * Returns 0 if there is no discount or if the original price is zero/negative.
 */
export function calcDiscountPercent(price: number, salePrice?: number): number {
  if (!salePrice || salePrice >= price || price <= 0) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

/**
 * Truncate text with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
