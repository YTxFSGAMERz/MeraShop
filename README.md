# MeraShop

**MeraShop** is a full-featured Indian e-commerce platform built with Next.js 16, Tailwind CSS, shadcn/ui, Prisma, and Razorpay payment gateway. It offers a complete shopping experience with product catalog, cart, wishlist, orders, payments, reviews, blog, and admin dashboard.

## 🚀 Features

- **Product Management**: Categories, brands, variants, images, stock, SEO
- **User Authentication**: Email/password, social login (via NextAuth), role-based access (customer/admin/manager)
- **Shopping Cart**: Add/remove items, variant selection, persistent cart
- **Wishlist**: Save products for later
- **Orders & Payments**: Razorpay integration (UPI, card, netbanking, wallet), order tracking, invoices
- **Reviews & Ratings**: Customer reviews with verification
- **Content Management**: Banners, blog posts, FAQs
- **Newsletter**: Email subscription
- **Contact Form**: Customer inquiries
- **Analytics**: Track events (page views, add_to_cart, etc.)
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Dark/Light Theme**: Theme persistence
- **Accessibility**: Follows WCAG guidelines
- **SEO Friendly**: Meta tags, OpenGraph, JSON-LD structured data
- **Multi-language**: Next.js i18n support (via next-intl)

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Prisma ORM](https://www.prisma.io/) with SQLite (easy to switch to PostgreSQL/MySQL)
- **Payments**: [Razorpay](https://razorpay.com/) (test keys included)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: [Zustand](https://zustand-demo.pmndrs.shop/) (cart, wishlist, UI)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Data Fetching**: [React Query](https://tanstack.com/query/latest)
- **UI Components**: Radix UI primitives, Sonner toast, Framer Motion animations
- **Utilities**: Date-fns, UUID, Lodash (via various packages)
- **Dev Tools**: ESLint, TypeScript, Bun (fast installer & runner)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/merashop.git
   cd merashop
   ```

2. **Install dependencies**
   We recommend using [Bun](https://bun.sh/) for faster installs, but npm/yarn work too.
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment variables**
   Copy the example environment file and fill in the values:
   ```bash
   cp .env.example .env   # if .env.example exists, else .env is already present
   ```
   The `.env` file should contain:
   ```env
   DATABASE_URL="file:./db/custom.db"  # SQLite file path
   
   # Razorpay (test keys)
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
   ```

4. **Set up the database**
   ```bash
   bun run db:generate   # generate Prisma client
   bun run db:push       # push schema to SQLite (creates ./db/custom.db)
   # For migrations instead of push:
   # bun run db:migrate
   ```

5. **Run the development server**
   ```bash
   bun dev   # or npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## 📜 Available Scripts

In `package.json`:

- `bun dev` – Start development server on port 3000 (logs to `dev.log`)
- `bun build` – Build for production (outputs standalone)
- `bun start` – Start production server
- `bun lint` – Run ESLint
- `bun run db:generate` – Generate Prisma client
- `bun run db:push` – Push Prisma schema to database
- `bun run db:migrate` – Run Prisma migrations
- `bun run db:reset` – Reset database (dangerous in production)

## 📂 Folder Structure

```
merashop/
├── .github/               # GitHub actions, issue templates
├── .zscripts/             # Utility scripts (dev, build, start)
├── agent-ctx/             # Agent context files (for AI-assisted development)
├── db/                    # SQLite database file (generated)
├── docs/                  # Documentation (API, architecture, etc.)
├── download/              # QA assets, screenshots
├── examples/              # Example code (WebSocket demo)
├── mini-services/         # Placeholder for microservices
├── prisma/                # Prisma schema and migrations
├── public/                # Static assets (logo, robots.txt, sitemap)
├── src/
│   ├── app/               # Next.js App Router (pages, layout, route handlers)
│   │   ├── (routes)/      # Page components (account, admin, blog, cart, checkout, etc.)
│   │   ├── api/           # API route handlers (REST‑like endpoints)
│   │   └── ...            # Other Next.js config
│   ├── components/        # Reusable UI components
│   │   ├── layout/        # Header, footer, navigation
│   │   ├── marketing/     # Banners, hero sections, deals
│   │   ├── shop/          # Product cards, grids, filters, AI assistant
│   │   └── ui/            # shadcn/ui primitives (button, input, modal, etc.)
│   ├── hooks/             # Custom React hooks (use-hydrated, use-mobile, use-toast)
│   ├── lib/               # Utilities (analytics, constants, CSV export, db, stores, notifications, utils)
│   └── theme-provider.tsx # Theme context (light/dark)
├── .env                   # Environment variables
├── .eslintrc.js           # ESLint configuration
├── .gitignore
├── bun.lock               # Bun lockfile
├── components.json        # shadcn/ui config
├── next.config.ts         # Next.js configuration
├── package.json
├── postcss.config.mjs     # Tailwind CSS config
├── tailwind.config.ts     # Tailwind CSS config
├── tsconfig.json          # TypeScript configuration
└── README.md
```

## 🧪 Testing

Currently, the project focuses on manual QA. You can add tests using Jest/Vitest and React Testing Library as needed.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Razorpay](https://razorpay.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Sonner](https://sonner.emilgojel.com/)
- [Zustand](https://zustand-demo.pmndrs.shop/)

---

**Happy shopping!** 🛍️