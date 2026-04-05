# CLEOHN - CAC Registration & E-commerce Platform

A full-stack Next.js application for CLEOHN, a Nigerian CAC registration agency with integrated e-commerce capabilities.

## Features

### Customer-Facing
- **Services & Pricing**: Browse CAC registration services with dynamic pricing
- **E-commerce Shop**: Purchase products (printing services, books, clothing)
- **Shopping Cart**: Add items to cart with localStorage persistence
- **Secure Checkout**: Integrated Paystack payment processing
- **Product Reviews**: Submit and view product reviews
- **Mobile Responsive**: Fully responsive design for all devices

### Admin Dashboard
- **Service Management**: Edit service prices and packages without touching code
- **Product Management**: Add/edit products with multiple images via Cloudinary
- **Category Management**: Organize products into categories
- **Order Management**: View, track, and update order status
- **Review Moderation**: Approve or reject customer reviews
- **Dashboard Analytics**: View key metrics (orders, revenue, customers)
- **Secure Authentication**: Session-based admin authentication

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Turso (Serverless SQLite)
- **ORM**: Drizzle ORM
- **Authentication**: Custom session-based auth with Argon2
- **Payment**: Paystack
- **File Storage**: Cloudinary CDN
- **State Management**: Zustand
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and pnpm
- Turso account and database
- Paystack account (test/live keys)
- Cloudinary account
- Vercel account (for deployment)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (Turso)
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your-turso-auth-token

# Authentication
SESSION_SECRET=your-random-32-character-secret-string

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# App Config
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Change to production URL when deploying
NEXT_PUBLIC_APP_NAME=CLEOHN
```

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

```bash
# Generate database schema
pnpm drizzle-kit generate

# Push schema to Turso
pnpm drizzle-kit push
```

### 3. Seed Data

```bash
# Create admin user
pnpm tsx scripts/seed-admin.ts

# Migrate existing services
pnpm tsx scripts/migrate-services.ts
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

Admin panel: [http://localhost:3000/login](http://localhost:3000/login)

Default admin credentials (created by seed script):
- Email: `admin@cleohn.com`
- Password: `admin123` (change immediately!)

## Project Structure

```
C:\dev\CLEOHN\
├── app/
│   ├── (admin)/          # Admin dashboard pages
│   │   ├── admin/
│   │   │   ├── page.tsx            # Dashboard with stats
│   │   │   ├── services/           # Service management
│   │   │   ├── categories/         # Category management
│   │   │   ├── products/           # Product management
│   │   │   ├── orders/             # Order management
│   │   │   └── reviews/            # Review moderation
│   │   └── login/        # Admin login
│   ├── (shop)/           # Public shop pages
│   │   ├── shop/         # Shop homepage & product details
│   │   ├── cart/         # Shopping cart
│   │   └── checkout/     # Checkout & payment
│   ├── api/              # API routes
│   │   ├── admin/        # Admin API endpoints
│   │   ├── auth/         # Authentication
│   │   ├── cart/         # Cart operations
│   │   ├── checkout/     # Payment initialization & verification
│   │   ├── products/     # Product data
│   │   └── webhooks/     # Paystack webhook
│   └── ...               # Other public pages (home, services, pricing, etc.)
├── components/
│   ├── admin/            # Admin dashboard components
│   ├── cart/             # Shopping cart components
│   ├── shop/             # Shop & product components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth/             # Authentication logic
│   ├── db/               # Database client & schema
│   ├── paystack/         # Paystack integration
│   ├── queries/          # Database queries
│   └── validations/      # Zod schemas
├── hooks/                # Custom React hooks (cart store)
├── scripts/              # Database seed scripts
└── middleware.ts         # Route protection
```

## Key Features Explained

### Payment Flow

1. Customer fills out checkout form
2. POST to `/api/checkout/initialize` creates order and initializes Paystack payment
3. Customer redirected to Paystack payment page
4. After payment, Paystack redirects to `/api/checkout/verify`
5. Verification endpoint updates order status and redirects to success/cancel page
6. Webhook at `/api/webhooks/paystack` handles async payment events

### Admin Workflow

1. Login at `/login`
2. View dashboard with key metrics
3. Manage services, products, categories
4. Review and moderate customer reviews
5. Track and update order status

### Shopping Cart

- Uses Zustand for state management
- Persists in localStorage for guest users
- Can add both services and products
- Calculates totals automatically

## Database Schema

Key tables:
- `users` & `sessions` - Authentication
- `services`, `service_packages`, `package_features` - Service catalog
- `product_categories`, `products`, `product_images` - Product catalog
- `cart_items` - Shopping cart
- `orders`, `order_items` - Order management
- `payment_transactions` - Payment records
- `product_reviews` - Customer reviews

Full schema: `lib/db/schema.ts`

## API Routes

### Public
- `GET /api/products` - List products
- `GET /api/products/[slug]` - Product details
- `GET /api/products/[id]/reviews` - Product reviews
- `POST /api/products/[id]/reviews` - Submit review
- `POST /api/checkout/initialize` - Initialize payment
- `GET /api/checkout/verify` - Verify payment
- `POST /api/webhooks/paystack` - Paystack webhook

### Admin (requires authentication)
- `GET /api/admin/stats` - Dashboard statistics
- `GET/POST/PATCH/DELETE /api/admin/services` - Service management
- `GET/POST/PATCH/DELETE /api/admin/products` - Product management
- `GET/POST/PATCH/DELETE /api/admin/categories` - Category management
- `GET/PATCH /api/admin/orders` - Order management
- `GET/PATCH/DELETE /api/admin/reviews` - Review moderation

## Deployment to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Update `NEXT_PUBLIC_BASE_URL` to your production URL
5. Configure Paystack webhook URL: `https://yourdomain.com/api/webhooks/paystack`
6. Deploy!

## Paystack Configuration

### Test Mode
Use test keys for development. Test cards:
- Success: `4084084084084081`
- Failure: `4084080000000409`

### Live Mode
1. Switch to live keys in environment variables
2. Complete Paystack KYC verification
3. Configure webhook in Paystack dashboard
4. Test payment flow thoroughly before going live

## Security Considerations

- All admin routes protected by middleware
- Session cookies are HTTP-only and secure
- Passwords hashed with Argon2
- Paystack webhook signature verified
- Environment variables never committed to repo

## Maintenance

### Updating Prices
1. Login to admin dashboard
2. Navigate to Services or Products
3. Edit pricing directly in the UI
4. Changes reflect immediately on public pages

### Adding New Products
1. Login to admin dashboard
2. Navigate to Products → Add Product
3. Upload images (stored on Cloudinary)
4. Set price, stock, category
5. Product appears in shop immediately

### Managing Orders
1. Login to admin dashboard
2. Navigate to Orders
3. View order details
4. Update status (Pending → Processing → Shipped → Delivered)
5. Customer receives status updates

## Troubleshooting

### Database Connection Errors
- Verify `DATABASE_URL` and `DATABASE_AUTH_TOKEN` are correct
- Check Turso database is active
- Run `pnpm drizzle-kit push` to sync schema

### Payment Not Working
- Verify Paystack keys are correct (test vs live)
- Check webhook URL is configured in Paystack dashboard
- Review webhook signature validation

### Images Not Uploading
- Verify Cloudinary credentials
- Check file size limits
- Ensure image format is supported (JPG, PNG, WebP)

## Support

For issues or questions, contact: Cleohngroupltd@gmail.com

## License

Proprietary - All rights reserved by CLEOHN Group Ltd.
