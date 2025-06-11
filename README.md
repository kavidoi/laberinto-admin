# Laberinto Modern - Wine Experience & Ecommerce Platform

A modern, scalable platform for wine experiences, bookings, and ecommerce built with Next.js 14, PostgreSQL, and modern web technologies.

## 🌟 Features

### Core Business Functions
- **Wine Experience Bookings** - Group and private wine tasting experiences
- **Wine Ecommerce** - Full-featured online wine store with inventory management
- **User Portal** - Customer dashboard for bookings, purchases, and preferences
- **Admin Dashboard** - Comprehensive management interface
- **Payment Processing** - Multiple payment methods with Stripe integration
- **Inventory Management** - Real-time stock tracking across multiple locations
- **Customer Management** - CRM with purchase history and preferences

### Enhanced Features
- **Multi-tenant Architecture** - Support for multiple wine locations/brands
- **Advanced Analytics** - Sales, booking, and customer insights
- **Automated Notifications** - Email, SMS, and WhatsApp integration
- **Mobile-First Design** - Responsive, PWA-ready interface
- **SEO Optimized** - Server-side rendering with dynamic meta tags
- **Performance Focused** - Edge caching, image optimization, and lazy loading

## 🏗️ Architecture

### Frontend Stack
- **Next.js 14** - App Router with Server Components
- **TypeScript** - Full type safety across the application
- **TailwindCSS + Shadcn/ui** - Modern, accessible component library
- **Zustand** - Lightweight state management
- **React Hook Form + Zod** - Form handling and validation

### Backend Stack
- **Next.js API Routes** - Server-side API with Edge Runtime support
- **tRPC** - End-to-end type safety for API calls
- **PostgreSQL** - Primary database with advanced features
- **Prisma ORM** - Database modeling and migrations
- **NextAuth.js v5** - Authentication and authorization
- **Stripe** - Payment processing and subscription management

### Infrastructure
- **Vercel** - Deployment and hosting platform
- **AWS S3/Cloudinary** - File storage and image optimization
- **Upstash Redis** - Caching and session storage
- **Resend** - Transactional email service
- **Sentry** - Error tracking and performance monitoring

## 📊 Database Schema

### Core Entities

#### Users & Authentication
- `users` - Customer and admin accounts
- `accounts` - OAuth provider accounts
- `sessions` - User session management
- `user_preferences` - Wine preferences and settings

#### Wine Catalog
- `wines` - Base wine information
- `wine_vintages` - Specific years and characteristics
- `wine_categories` - Wine types and classifications
- `wine_regions` - Geographic origins
- `wine_ratings` - Customer and expert reviews

#### Inventory & Locations
- `inventory_items` - Stock tracking per location
- `locations` - Warehouse and store locations
- `location_staff` - Staff assignments per location
- `stock_movements` - Inventory transaction history

#### Experiences & Events
- `experiences` - Wine tasting experience types
- `events` - Scheduled experience sessions
- `bookings` - Customer reservations
- `booking_participants` - Group member details
- `booking_add_ons` - Food and extra services

#### Ecommerce
- `products` - Wine products for sale
- `product_variants` - Different sizes, packaging
- `shopping_carts` - Customer cart management
- `orders` - Purchase transactions
- `order_items` - Individual products in orders
- `shipping_addresses` - Customer delivery addresses

#### Payments & Financials
- `payments` - Payment transaction records
- `payment_methods` - Stored customer payment methods
- `invoices` - Tax and billing documents
- `discounts` - Promotional codes and offers
- `loyalty_points` - Customer reward system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis (optional, for caching)
- Stripe account
- AWS account (for file storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/laberinto-modern.git
cd laberinto-modern

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up the database
npm run db:push
npm run db:seed

# Start the development server
npm run dev
```

### Environment Configuration

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/laberinto"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# File Storage
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-west-2"
AWS_S3_BUCKET="laberinto-assets"

# Email
RESEND_API_KEY="re_..."

# Optional: Redis for caching
REDIS_URL="redis://..."
```

## 📱 Key Features Detail

### Wine Ecommerce
- **Product Catalog** - Rich wine listings with detailed information
- **Advanced Filtering** - By region, vintage, price, rating, and preferences
- **Shopping Cart** - Persistent cart with quantity management
- **Checkout Process** - Multi-step checkout with address validation
- **Order Management** - Order tracking and history
- **Wishlist** - Save wines for later purchase
- **Wine Recommendations** - AI-powered suggestions based on preferences

### Experience Booking System
- **Experience Types** - Group tastings, private sessions, wine tours
- **Dynamic Pricing** - Based on group size, date, and add-ons
- **Group Management** - Organizer creates group, members join
- **Calendar Integration** - Sync with Google Calendar
- **Capacity Management** - Automatic availability checking
- **Waitlist System** - Join waitlist for fully booked experiences
- **Cancellation Policies** - Flexible cancellation with refund rules

### User Portal
- **Dashboard** - Overview of bookings, orders, and preferences
- **Booking History** - Past and upcoming wine experiences
- **Purchase History** - Order history with reorder functionality
- **Wine Preferences** - Taste profile and preference settings
- **Loyalty Program** - Points accumulation and redemption
- **Address Book** - Saved shipping and billing addresses
- **Payment Methods** - Stored cards and payment preferences

### Admin Dashboard
- **Analytics Overview** - Sales, bookings, and customer metrics
- **Wine Management** - Add, edit, and manage wine catalog
- **Experience Management** - Create and manage experience offerings
- **Booking Management** - View and manage customer bookings
- **Order Management** - Process and fulfill orders
- **Inventory Management** - Stock levels and movements
- **Customer Management** - Customer profiles and communication
- **Payment Processing** - Handle payments and refunds
- **Reporting** - Generate sales and operational reports

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript check

# Database
npm run db:push         # Push schema changes
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
npm run db:migrate      # Run migrations

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

### Project Structure

```
laberinto-modern/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (shop)/            # Ecommerce pages
│   ├── (experiences)/     # Booking pages
│   ├── (dashboard)/       # User dashboard
│   ├── (admin)/           # Admin interface
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
│   ├── db/               # Database utilities
│   ├── auth/             # Authentication utilities
│   └── utils/            # General utilities
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build Docker image
docker build -t laberinto-modern .

# Run container
docker run -p 3000:3000 laberinto-modern
```

### Environment Setup

For production deployment, ensure the following environment variables are set:
- Database connection string
- Stripe keys (live mode)
- AWS credentials
- Email service credentials
- Redis connection (if using)
- NextAuth secret and URL

## 📈 Performance Optimizations

- **Image Optimization** - Automatic WebP conversion and responsive images
- **Code Splitting** - Automatic route-based code splitting
- **Caching Strategy** - Redis caching for frequently accessed data
- **Database Optimization** - Proper indexing and query optimization
- **CDN Integration** - Static asset delivery via CDN
- **Edge Runtime** - API routes optimized for edge deployment

## 🔒 Security Features

- **Authentication** - Secure user authentication with NextAuth.js
- **Authorization** - Role-based access control
- **Data Validation** - Input validation with Zod schemas
- **CSRF Protection** - Built-in CSRF protection
- **Rate Limiting** - API rate limiting to prevent abuse
- **SQL Injection Prevention** - Prisma ORM prevents SQL injection
- **XSS Protection** - Automatic XSS protection with React

## 📞 Support

For support and questions:
- Email: support@laberinto.com
- Documentation: [docs.laberinto.com](https://docs.laberinto.com)
- GitHub Issues: [Create an issue](https://github.com/your-org/laberinto-modern/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 