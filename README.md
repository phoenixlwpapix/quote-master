# QuoteMaster

A modern, multi-tenant quote and order management SaaS built with Next.js 16. QuoteMaster helps businesses create professional quotes, manage customers, track orders, and maintain product catalogs — all with secure user authentication and data isolation.

## Features

- 🔐 **User Authentication** - Secure sign-up/sign-in powered by Neon Auth
- 📊 **Dashboard** - Overview of quotes, orders, and key metrics at a glance
- 👥 **Customer Management** - Add, edit, and manage customer information
- 📦 **Product Catalog** - Maintain a catalog with 4 product types: Solution, OEM Kit, Accessories, Software
- 📝 **Quote Generation** - Create professional quotes with per-item price overrides, quantities, and calculations
- 🛒 **Order Tracking** - Convert quotes to orders and track their status
- 📄 **PDF Export** - Generate PDF quotes for clients
- ⚙️ **Settings** - Configure company information and quote templates
- 🔒 **Multi-tenancy** - Each user only sees their own data
- ⚡ **Optimized Performance** - Client-side caching with React Query for instant navigation

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org) with App Router |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | [Neon](https://neon.tech) (Serverless PostgreSQL) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) |
| **Authentication** | [Neon Auth](https://neon.com/docs/auth) |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) (React Query) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Font** | Geist (optimized via next/font) |

## Brand Colors

- **Primary**: `#24E994` (vibrant green)
- **Background**: `#0f172a` (dark slate)
- **Foreground**: `#e2e8f0` (light slate)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- [Neon](https://neon.tech) account with a project

### Environment Setup

Create a `.env.local` file in the project root:

```env
# Neon Database Connection
DATABASE_URL=postgresql://username:password@your-neon-host/neondb?sslmode=require

# Neon Auth
NEON_AUTH_BASE_URL=https://your-project.neonauth.region.aws.neon.tech/neondb/auth
```

### Installation

```bash
# Install dependencies
pnpm install

# Generate database migrations
pnpm drizzle-kit generate

# Push schema to database
pnpm drizzle-kit push

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
quote-master/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── auth/          # Neon Auth API endpoints
│   ├── auth/              # Authentication pages (sign-in, sign-up)
│   ├── account/           # User account management
│   ├── customers/         # Customer management
│   ├── orders/            # Order tracking
│   ├── products/          # Product catalog
│   ├── quotes/            # Quote creation & management
│   └── settings/          # Application settings
├── components/            # Reusable UI components
├── drizzle/               # Database migrations
├── hooks/                 # Custom React hooks
│   └── use-queries.ts     # React Query hooks for data fetching
├── lib/                   # Utilities and data models
│   ├── auth/              # Authentication utilities
│   ├── models/            # Database models (CRUD operations)
│   ├── api.ts             # Client-side API functions
│   ├── db.ts              # Database connection
│   ├── query-provider.tsx # React Query provider
│   ├── schema.ts          # Drizzle schema definitions
│   └── types.ts           # TypeScript type definitions
└── proxy.ts               # Authentication middleware
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server (Turbopack) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm drizzle-kit generate` | Generate database migrations |
| `pnpm drizzle-kit push` | Push schema changes to database |
| `pnpm drizzle-kit studio` | Open Drizzle Studio (database GUI) |

## Architecture

### Authentication Flow

1. User visits a protected route
2. `proxy.ts` middleware checks for valid session via Neon Auth
3. Unauthenticated users are redirected to `/auth/sign-in`
4. After sign-in, users are redirected to the dashboard

### Data Isolation

- Each database record includes a `user_id` column
- All queries filter by the current user's ID
- Quote/Order numbers are unique per-user (e.g., each user starts from Q-2026-0001)

### Caching Strategy

- React Query caches data for 5 minutes (`staleTime`)
- Cached data shown instantly on tab switch
- Background refetching keeps data fresh
- Mutations automatically invalidate relevant caches

## Design Philosophy

QuoteMaster follows a clean, modern design with:
- **Flat UI** - No gradients or glowing effects
- **Dark theme** - Easy on the eyes for extended use
- **Solid colors** - Consistent, professional appearance
- **Responsive layout** - Works on desktop and mobile devices
- **Instant navigation** - Cached data for smooth user experience

## License

Internal use only.
