'use client';

import { Shield } from 'lucide-react';

import { SITE_NAME } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';

const lastUpdated = 'March 4, 2026';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, including:

• **Personal Information**: Name, email address, phone number, delivery address, and payment information when you create an account, place an order, or contact us.
• **Account Data**: Login credentials, profile preferences, and wish list items.
• **Transaction Data**: Order history, purchase details, payment method, and billing information.
• **Communication Data**: Messages, reviews, feedback, and correspondence you send to us.
• **Device & Usage Data**: IP address, browser type, operating system, device identifiers, pages visited, time spent on pages, and links clicked.
• **Location Data**: Approximate location derived from your IP address or the delivery address you provide.`,
  },
  {
    title: '2. How We Use Information',
    content: `We use the information we collect to:

• Process and fulfill your orders, including shipping and returns
• Create and manage your account
• Send order confirmations, shipping updates, and delivery notifications
• Provide customer support and respond to your inquiries
• Personalise your shopping experience with product recommendations
• Send promotional offers, newsletters, and marketing communications (with your consent)
• Detect and prevent fraud, abuse, and security issues
• Comply with legal obligations under Indian law
• Improve our website, app, and services through analytics and research`,
  },
  {
    title: '3. Cookies & Tracking Technologies',
    content: `We use cookies and similar technologies to:

• **Essential Cookies**: Maintain your session, shopping cart, and login state
• **Analytics Cookies**: Understand how visitors interact with our website (e.g., Google Analytics)
• **Marketing Cookies**: Deliver relevant advertisements and measure ad performance
• **Preference Cookies**: Remember your settings, language, and region

You can manage cookie preferences through your browser settings. Disabling certain cookies may affect site functionality.`,
  },
  {
    title: '4. Third-Party Sharing',
    content: `We may share your information with:

• **Logistics Partners**: For order delivery (name, address, phone only)
• **Payment Processors**: Secure payment gateways (Razorpay, UPI providers) for transaction processing
• **Service Providers**: Third-party vendors who assist with email, analytics, and customer support
• **Legal Requirements**: When required by law, regulation, or legal process in India
• **Business Transfers**: In connection with a merger, acquisition, or sale of assets

We do **not** sell your personal information to third parties for their marketing purposes.`,
  },
  {
    title: '5. Data Security',
    content: `We implement industry-standard security measures to protect your data:

• SSL/TLS encryption for all data in transit
• Secure storage of payment information through PCI-DSS compliant payment processors
• Regular security audits and vulnerability assessments
• Access controls limiting employee access to personal data
• Monitoring for unauthorised access or data breaches

While we strive to protect your information, no method of electronic transmission or storage is 100% secure.`,
  },
  {
    title: '6. Your Rights',
    content: `Under applicable Indian data protection laws, you have the right to:

• **Access**: Request a copy of your personal data held by us
• **Correction**: Update or correct inaccurate personal information
• **Deletion**: Request deletion of your account and associated data
• **Opt-Out**: Unsubscribe from marketing communications at any time
• **Data Portability**: Receive your data in a structured, machine-readable format
• **Withdraw Consent**: Withdraw previously given consent for data processing

To exercise these rights, contact us at privacy@merashop.in or through your account settings.`,
  },
  {
    title: '7. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide services. Order and transaction records are retained for a minimum of 7 years as required by Indian tax and accounting regulations. You may request account deletion, after which we will remove your data except where legally required to retain it.`,
  },
  {
    title: '8. Children&apos;s Privacy',
    content: `${SITE_NAME} is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal data, please contact us and we will take steps to delete such information.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or sending you an email. Your continued use of ${SITE_NAME} after any changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:

• **Email**: privacy@merashop.in
• **Address**: ${SITE_NAME} Privacy Team, Mumbai, Maharashtra 400001, India
• **Phone**: 1800-123-4567 (Toll Free, Mon–Sat, 9 AM – 6 PM IST)`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-muted/40 border-b">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="size-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                Privacy Policy
              </h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
            <p className="text-muted-foreground mt-2">
              At {SITE_NAME}, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, and protect your data when
              you use our website and services.
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
