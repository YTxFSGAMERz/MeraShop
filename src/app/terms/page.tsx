'use client';

import { FileText } from 'lucide-react';

import { SITE_NAME } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';

const lastUpdated = 'March 4, 2026';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using ${SITE_NAME} ("the Website"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services. These Terms apply to all visitors, users, and customers of the Website.

We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the Website. Your continued use after any changes constitutes acceptance of the revised Terms.`,
  },
  {
    title: '2. Account Registration',
    content: `To access certain features, you must create an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain and promptly update your account information
• Keep your password confidential and not share it with any third party
• Notify us immediately of any unauthorised use of your account
• Accept responsibility for all activities under your account

We reserve the right to suspend or terminate accounts that violate these Terms or are involved in fraudulent activity.`,
  },
  {
    title: '3. Products & Pricing',
    content: `• All product listings are subject to availability and may change without notice
• Prices are displayed in Indian Rupees (INR) and include applicable taxes unless stated otherwise
• We strive for accurate product descriptions and images; however, actual products may vary slightly
• Prices may change at any time before purchase; the price at the time of order confirmation will apply
• MRP (Maximum Retail Price) is displayed as required by Indian law
• Sale prices and discounts are subject to terms and conditions and may be withdrawn without prior notice
• Errors in pricing or product information will be corrected, and we reserve the right to cancel orders placed at incorrect prices`,
  },
  {
    title: '4. Orders & Payment',
    content: `• Placing an order constitutes an offer to purchase; it does not guarantee acceptance
• We reserve the right to refuse or cancel orders for any reason, including stock unavailability, pricing errors, or suspected fraud
• Payment must be made at the time of order through our accepted methods: UPI, Credit/Debit Cards, Net Banking, or Cash on Delivery (COD)
• For COD orders, an additional handling fee may apply
• Order confirmation will be sent via email and/or SMS
• Delivery timelines are estimates and not guaranteed; delays due to unforeseen circumstances are not grounds for cancellation penalties`,
  },
  {
    title: '5. Shipping & Delivery',
    content: `• We deliver across India to serviceable pin codes
• Delivery timelines vary by location and product; estimated dates are provided at checkout
• Shipping charges, if applicable, are displayed at checkout before order placement
• Free shipping may be offered on orders above a specified value
• Risk of loss transfers to you upon delivery of the product
• If delivery is attempted and fails due to incorrect address or unavailability, additional charges may apply for re-delivery`,
  },
  {
    title: '6. Returns & Refunds',
    content: `• Returns are governed by our Returns Policy, available on the Website
• Products may be returned within the specified return window (typically 7–15 days from delivery)
• Returns are not accepted for certain categories (innerwear, perishables, personalised items, etc.)
• Refunds are processed to the original payment method within 7–10 business days after we receive and inspect the returned product
• COD refunds will be processed to your bank account or ${SITE_NAME} wallet
• We reserve the right to reject returns that do not meet our conditions (unused, original packaging, tags intact)`,
  },
  {
    title: '7. Intellectual Property',
    content: `• All content on the Website, including text, graphics, logos, images, and software, is the property of ${SITE_NAME} or its licensors
• You may not reproduce, distribute, modify, or create derivative works from any content without our express written consent
• Product images and descriptions are provided for purchase decisions and may not be used for commercial purposes
• ${SITE_NAME} trademarks and trade dress may not be used without prior written permission
• User-submitted content (reviews, photos) grants ${SITE_NAME} a non-exclusive, royalty-free license to use such content`,
  },
  {
    title: '8. Limitation of Liability',
    content: `• ${SITE_NAME} provides the Website "as is" and "as available" without warranties of any kind
• We are not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the Website
• Our total liability for any claim shall not exceed the amount you paid to ${SITE_NAME} for the relevant transaction
• We are not responsible for delays or failures caused by events beyond our reasonable control (force majeure)
• We do not guarantee uninterrupted or error-free operation of the Website
• Third-party links or services on the Website are not endorsed by us, and we are not liable for their content or practices`,
  },
  {
    title: '9. Governing Law & Dispute Resolution',
    content: `• These Terms are governed by and construed in accordance with the laws of India
• Any disputes arising from these Terms or use of the Website shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra
• Before initiating legal proceedings, you agree to attempt to resolve disputes through our customer support team
• Consumer complaints are addressed as per the Consumer Protection Act, 2019

For grievance redressal, contact our Grievance Officer at:
• Email: grievance@merashop.in
• Address: Grievance Officer, ${SITE_NAME}, Mumbai, Maharashtra 400001, India`,
  },
  {
    title: '10. General Provisions',
    content: `• **Severability**: If any provision of these Terms is found invalid, the remaining provisions remain in effect
• **Waiver**: Failure to enforce a provision does not constitute a waiver of that provision
• **Entire Agreement**: These Terms, along with our Privacy Policy and Returns Policy, constitute the entire agreement between you and ${SITE_NAME}
• **Assignment**: You may not assign your rights under these Terms; we may assign our rights to an affiliate or successor
• **Contact**: For questions about these Terms, email legal@merashop.in or write to us at ${SITE_NAME}, Mumbai, Maharashtra 400001, India`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-muted/40 border-b">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="size-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                Terms of Service
              </h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
            <p className="text-muted-foreground mt-2">
              Welcome to {SITE_NAME}. These Terms of Service govern your use of
              our website and services. Please read them carefully before making
              a purchase or using our platform.
            </p>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Table of Contents */}
            <div className="bg-muted/40 rounded-lg p-5 md:p-6">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                Table of Contents
              </h2>
              <ol className="space-y-1.5">
                {sections.map((section, index) => (
                  <li key={index}>
                    <a
                      href={`#section-${index + 1}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            {/* Sections */}
            {sections.map((section, index) => (
              <div key={index} id={`section-${index + 1}`}>
                <h2 className="text-lg md:text-xl font-bold mb-3">
                  {section.title}
                </h2>
                <div className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
                {index < sections.length - 1 && (
                  <Separator className="mt-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
