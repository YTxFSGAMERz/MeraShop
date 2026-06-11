# Contributing to MeraShop

First off, thank you for considering contributing to MeraShop! It's people like you that make MeraShop such a great platform.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Our Standards

**Positive behavior includes**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes**:
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When creating a bug report, include:

1. **Clear title**: Summarize the problem
2. **Steps to reproduce**: Detailed steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Environment**: Browser, OS, device
7. **Console errors**: Any error messages

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

1. **Clear title**: Describe the enhancement
2. **Problem statement**: Why is this needed?
3. **Proposed solution**: How should it work?
4. **Alternatives considered**: Other approaches you've thought about
5. **Mockups**: Visual references if applicable

### Contributing Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write clear commit messages
5. Push to your fork
6. Open a Pull Request

---

## Development Setup

### Prerequisites

- **Node.js** ≥ 18
- **Bun** (recommended) or npm/yarn/pnpm
- **Git**
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/merashop.git
cd merashop

# 2. Install dependencies
bun install

# 3. Set up environment
cp .env.example .env

# 4. Set up database
bun run db:push
bun run db:generate

# 5. (Optional) Seed demo data
bun run prisma db seed

# 6. Start dev server
bun run dev
```

### Development Workflow

```bash
# Start development server (port 3000)
bun run dev

# Run linter
bun run lint

# Push schema changes to database
bun run db:push

# Generate Prisma client after schema changes
bun run db:generate
```

---

## Code Style Guidelines

### TypeScript

- **Strict mode**: Always use strict TypeScript
- **No `any`**: Avoid `any` type; use `unknown` with type guards if needed
- **Interfaces over types**: Prefer `interface` for object shapes, `type` for unions/intersections
- **Explicit return types**: Add return types to exported functions
- **No non-null assertions**: Avoid `!` operator; use optional chaining

```typescript
// ✅ Good
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
}

// ❌ Bad
export function formatPrice(price) {
  return price.toLocaleString('en-IN');
}
```

### React Components

- **Named exports**: Use named exports, not default exports
- **Client components**: Add `'use client'` directive when using hooks, state, or event handlers
- **Props interface**: Define a `Props` or `ComponentNameProps` interface above the component
- **Destructuring**: Destructure props in the function signature

```typescript
// ✅ Good
interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  // ...
}

// ❌ Bad
export default function ProductCard(props: any) {
  // ...
}
```

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Pages | lowercase or `[slug]` | `page.tsx`, `[slug]/page.tsx` |
| API Routes | lowercase | `route.ts` |
| Stores | kebab-case | `cart-store.ts` |
| Hooks | camelCase with `use` | `use-mobile.ts` |
| Utilities | kebab-case | `csv-export.ts` |

### Import Order

Organize imports in this order:

```typescript
// 1. React / Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Custom components
import { RatingStars } from '@/components/shop/RatingStars';

// 5. Stores & hooks
import { useCartStore } from '@/lib/stores/cart-store';
import { useHydrated } from '@/hooks/use-hydrated';

// 6. Utilities & constants
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/constants';
```

### Styling

- **Tailwind CSS**: Use Tailwind utility classes, not custom CSS
- **Responsive**: Mobile-first approach (`sm:`, `md:`, `lg:`, `xl:`)
- **Dark mode**: Use CSS variables via `bg-background`, `text-foreground`, etc.
- **No indigo/blue**: Avoid indigo or blue colors unless explicitly requested
- **cn() helper**: Use `cn()` from `@/lib/utils` for conditional classes

```tsx
// ✅ Good
<div className={cn(
  'flex items-center gap-2 rounded-lg p-4',
  isActive && 'bg-primary text-primary-foreground',
  className
)} />

// ❌ Bad
<div className={`flex items-center gap-2 rounded-lg p-4 ${isActive ? 'bg-blue-600 text-white' : ''}`} />
```

### API Route Handlers

- **Consistent error handling**: Always use try/catch with proper status codes
- **Input validation**: Validate all request body fields
- **Console logging**: Log errors with descriptive prefix `[API /endpoint]`
- **JSON responses**: Always return JSON with proper Content-Type

```typescript
// ✅ Good
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await db.user.findUnique({ where: { email } });
    return NextResponse.json({ user: result });
  } catch (error) {
    console.error('[API /users] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
```

### Database (Prisma)

- **Soft deletes**: Use `deletedAt` for products instead of hard deletes
- **Select fields**: Use `select` or `include` to limit query results
- **Transactions**: Use Prisma transactions for multi-step operations
- **Schema changes**: Always run `bun run db:push` after modifying `schema.prisma`

---

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons) |
| `refactor` | Code refactoring without feature changes |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, tooling |
| `ci` | CI/CD configuration |

### Scopes

| Scope | Description |
|-------|-------------|
| `products` | Product catalog features |
| `cart` | Shopping cart features |
| `checkout` | Checkout flow |
| `auth` | Authentication & user management |
| `admin` | Admin dashboard |
| `api` | API route handlers |
| `ui` | UI components & styling |
| `db` | Database schema & Prisma |
| `seo` | SEO & meta tags |
| `ai` | AI assistant features |

### Examples

```bash
feat(cart): add quantity selector with stock validation
fix(checkout): resolve Razorpay order creation for COD
docs(api): update API documentation for reviews endpoint
style(ui): improve ProductCard hover animation
refactor(stores): extract shared logic from Zustand stores
perf(products): add pagination to product listing API
chore(deps): update Next.js to v16.1.1
```

---

## Pull Request Process

### Before Submitting

1. **Lint your code**: `bun run lint` passes with no errors
2. **Test manually**: All affected features work correctly
3. **Check responsive**: Changes work on mobile, tablet, and desktop
4. **Check dark mode**: Changes look correct in both themes
5. **Update documentation**: If you changed API or component behavior

### PR Title

Use the same format as commit messages:

```
feat(cart): add quantity selector with stock validation
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Manual testing on desktop
- [ ] Manual testing on mobile
- [ ] Dark mode tested
- [ ] Lint passes

## Screenshots (if applicable)
Add screenshots of the change.

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review
- [ ] I have commented complex code
- [ ] My changes generate no new lint warnings
- [ ] I have updated documentation where needed
```

### Review Process

1. **Automated checks**: Lint and build must pass
2. **Code review**: At least one maintainer approval required
3. **Manual testing**: Reviewer tests the changes
4. **Merge**: Squash and merge to `main`

---

## Project Structure

When adding new features, follow the established patterns:

### Adding a New Page

1. Create a new folder under `src/app/` with a `page.tsx`
2. Add any route-specific API handlers under `src/app/api/`
3. Create components in `src/components/` organized by feature
4. Update the navigation in `src/lib/constants.ts`

### Adding a New API Endpoint

1. Create a `route.ts` file in the appropriate `src/app/api/` directory
2. Follow the established pattern: try/catch, input validation, JSON responses
3. Use `import { db } from '@/lib/db'` for database access
4. Add documentation to `docs/API.md`

### Adding a New Component

1. Create the component file in the appropriate `src/components/` subdirectory
2. Use `'use client'` if the component needs interactivity
3. Define a Props interface
4. Use named exports
5. Add documentation to `docs/COMPONENTS.md`

### Adding a New Store

1. Create the store file in `src/lib/stores/`
2. Use Zustand `create` with TypeScript
3. Add `persist` middleware if state should survive page refreshes
4. Export the store hook as `use[Name]Store`
5. Add to `src/lib/stores/index.ts`

---

## Questions?

Feel free to open an issue with the `question` label, or start a discussion on GitHub.

Thank you for contributing to MeraShop! 🛍️
