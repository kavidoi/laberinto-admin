# Migration Guide: From Airtable to Modern PostgreSQL System

This guide provides a comprehensive overview of migrating from the current Airtable-based Laberinto system to the new modern PostgreSQL-based architecture.

## 📋 Overview

The new system replaces Airtable with a modern tech stack while preserving all existing functionality and adding significant enhancements.

### Current System (Airtable-based)
- **Database**: Airtable (no-code database)
- **Frontend**: Next.js 14 with custom components
- **Payments**: Stripe integration
- **File Storage**: Mixed approach
- **Authentication**: Basic system

### New System (PostgreSQL-based)
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 14 with App Router + tRPC
- **UI**: Shadcn/ui + TailwindCSS
- **Authentication**: NextAuth.js v5
- **Payments**: Enhanced Stripe integration
- **File Storage**: AWS S3 / Cloudinary
- **Caching**: Redis (Upstash)
- **Monitoring**: Sentry + Vercel Analytics

## 🗄️ Data Migration Mapping

### Core Entity Mappings

| Airtable Table | New PostgreSQL Tables | Notes |
|---|---|---|
| `Contactos` | `users`, `user_preferences`, `shipping_addresses` | Split customer data into normalized tables |
| `Vinos` | `wines`, `wine_categories`, `wine_regions` | Enhanced with SEO and categorization |
| `Productos` | `products`, `wine_vintages` | Better vintage management |
| `Añadas` | `wine_vintages` | Dedicated vintage tracking |
| `Locaciones` | `locations`, `location_staff` | Enhanced location management |
| `Experiencias` | `experiences`, `experience_add_ons` | Modular experience system |
| `Eventos` | `events` | Streamlined event management |
| `Reservas` | `bookings`, `booking_participants`, `booking_add_ons` | Comprehensive booking system |
| `Grupos` | Integrated into `bookings` | Simplified group management |
| `Venta de Vinos` | `wine_sales`, `wine_sale_items` | Enhanced sales tracking |
| `Movimientos` | `stock_movements`, `inventory_items` | Real-time inventory |
| `Equipo` | `users` (with role STAFF/MANAGER) | Role-based access |
| `Pago Reservas` | `payments` | Unified payment system |

### Data Transformation Rules

#### User Data Migration
```sql
-- Airtable Contactos → PostgreSQL users
INSERT INTO users (
  email, 
  firstName, 
  lastName, 
  phone, 
  rut,
  role,
  createdAt
) 
SELECT 
  "Correo Electrónico",
  "Nombre",
  "Apellido", 
  "Número de Teléfono",
  "RUT",
  CASE WHEN "Agente de Experiencias" = 'Agente' THEN 'STAFF' ELSE 'CUSTOMER' END,
  NOW()
FROM airtable_contactos;
```

#### Wine Data Migration
```sql
-- Airtable Vinos → PostgreSQL wines
INSERT INTO wines (
  name,
  code,
  slug,
  producer,
  description,
  basePrice,
  isActive,
  createdAt
)
SELECT 
  "Vinos",
  "Código",
  LOWER(REPLACE(REPLACE("Vinos", ' ', '-'), 'ñ', 'n')),
  "Productor", -- If available
  "Características Generales",
  "Precio",
  TRUE,
  NOW()
FROM airtable_vinos;
```

#### Booking Data Migration
```sql
-- Airtable Reservas → PostgreSQL bookings
INSERT INTO bookings (
  organizerId,
  groupName,
  totalParticipants,
  adultsCount,
  childrenCount,
  totalAmount,
  status,
  createdAt
)
SELECT 
  u.id,
  r."Nombre del Grupo",
  r."Tamaño Grupo",
  r."Tamaño Grupo" - r."Niños menores de 12",
  r."Niños menores de 12",
  r."Total a pagar grupo final",
  CASE r."Progreso"
    WHEN 'Completado' THEN 'COMPLETED'
    WHEN 'Pagado' THEN 'PAID'
    WHEN 'Confirmado' THEN 'CONFIRMED'
    ELSE 'PENDING'
  END,
  r."Creada"
FROM airtable_reservas r
JOIN users u ON u.email = (
  SELECT "Correo Electrónico" 
  FROM airtable_contactos c 
  WHERE c.id = r."Organizador"
);
```

## 🔄 Migration Process

### Phase 1: Infrastructure Setup (Week 1)
1. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb laberinto_production
   
   # Run Prisma migrations
   npx prisma migrate deploy
   
   # Seed initial data
   npm run db:seed
   ```

2. **Environment Configuration**
   - Set up environment variables
   - Configure AWS S3 buckets
   - Set up Redis cache
   - Configure Stripe webhooks

3. **Deploy Infrastructure**
   - Deploy to Vercel/hosting platform
   - Set up monitoring (Sentry)
   - Configure CDN

### Phase 2: Data Migration (Week 2)
1. **Export Airtable Data**
   ```bash
   # Export all tables to CSV/JSON
   npm run export:airtable
   ```

2. **Transform and Import Data**
   ```bash
   # Run migration scripts
   npm run migrate:users
   npm run migrate:wines
   npm run migrate:inventory
   npm run migrate:bookings
   npm run migrate:payments
   ```

3. **Data Validation**
   ```bash
   # Verify data integrity
   npm run validate:migration
   ```

### Phase 3: Feature Migration (Week 3)
1. **Core Features**
   - User authentication
   - Wine catalog
   - Booking system
   - Payment processing

2. **Admin Features**
   - Admin dashboard
   - Inventory management
   - Booking management
   - Payment processing

3. **Advanced Features**
   - Analytics dashboard
   - Email notifications
   - Reporting system

### Phase 4: Testing & Deployment (Week 4)
1. **Testing**
   - End-to-end testing
   - Performance testing
   - Security audit

2. **Deployment**
   - Production deployment
   - DNS switchover
   - Monitor and optimize

## 🔧 Technical Implementation

### Database Schema Migration

#### Create Migration Scripts
```typescript
// prisma/migrations/001_initial_setup.sql
-- Create all tables based on schema.prisma

// scripts/migrate-airtable.ts
import { PrismaClient } from '@prisma/client'
import { readCSV } from './utils'

const prisma = new PrismaClient()

async function migrateUsers() {
  const airtableUsers = await readCSV('airtable_export/contactos.csv')
  
  for (const user of airtableUsers) {
    await prisma.user.create({
      data: {
        email: user['Correo Electrónico'],
        firstName: user['Nombre'],
        lastName: user['Apellido'],
        phone: user['Número de Teléfono'],
        rut: user['RUT'],
        role: user['Agente de Experiencias'] === 'Agente' ? 'STAFF' : 'CUSTOMER',
      }
    })
  }
}
```

### API Migration

#### Replace Airtable API Calls
```typescript
// Before (Airtable)
const reservations = await base('Reservas').select().all()

// After (Prisma)
const reservations = await prisma.booking.findMany({
  include: {
    organizer: true,
    event: {
      include: {
        experience: true,
        location: true
      }
    },
    participants: true,
    payments: true
  }
})
```

#### tRPC Procedures
```typescript
// lib/trpc/routers/bookings.ts
export const bookingsRouter = router({
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const bookings = await prisma.booking.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          organizer: true,
          event: {
            include: {
              experience: true,
              location: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      return {
        bookings: bookings.slice(0, input.limit),
        nextCursor: bookings.length > input.limit 
          ? bookings[input.limit].id 
          : undefined
      }
    }),
    
  create: protectedProcedure
    .input(createBookingSchema)
    .mutation(async ({ input, ctx }) => {
      return await prisma.booking.create({
        data: {
          ...input,
          organizerId: ctx.session.user.id
        },
        include: {
          event: {
            include: {
              experience: true
            }
          }
        }
      })
    })
})
```

## 🎨 UI/UX Improvements

### Enhanced Components
- **Wine Cards**: Rich product displays with high-quality images
- **Booking Flow**: Multi-step wizard with progress indication
- **Admin Dashboard**: Modern analytics and management interface
- **Mobile Experience**: Optimized mobile-first design

### New Features
- **Advanced Search**: Faceted search with filters
- **Wishlist**: Save favorite wines
- **Reviews & Ratings**: Customer wine reviews
- **Loyalty Program**: Points and rewards system
- **Subscription Boxes**: Recurring wine deliveries

## 📊 Performance Improvements

### Database Performance
- **Indexing**: Proper database indexes for fast queries
- **Caching**: Redis caching for frequently accessed data
- **Query Optimization**: Efficient database queries with Prisma

### Frontend Performance
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with WebP
- **Lazy Loading**: Components and images loaded on demand

### SEO Improvements
- **Server-Side Rendering**: SSR for better SEO
- **Meta Tags**: Dynamic meta tags for each page
- **Structured Data**: Schema.org markup for rich snippets
- **Sitemap**: Automatic sitemap generation

## 🔒 Security Enhancements

### Authentication & Authorization
- **NextAuth.js**: Secure authentication with multiple providers
- **Role-based Access**: Granular permissions system
- **Session Management**: Secure session handling

### Data Protection
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Built-in CSRF protection

## 📈 Analytics & Monitoring

### Enhanced Analytics
- **Vercel Analytics**: Performance and usage metrics
- **Custom Events**: Track user interactions
- **Conversion Tracking**: Monitor booking and purchase funnels

### Error Monitoring
- **Sentry**: Error tracking and performance monitoring
- **Custom Logging**: Structured logging for debugging

## 🚀 Deployment Strategy

### Blue-Green Deployment
1. **Prepare New Environment**: Set up complete new system
2. **Data Sync**: Keep databases in sync during transition
3. **Testing**: Comprehensive testing on staging
4. **Switch Over**: DNS change to new system
5. **Monitor**: Close monitoring for 48 hours

### Rollback Plan
- Keep old system running for 1 week
- Database backup before migration
- Quick DNS rollback capability
- Data export tools ready

## 📋 Post-Migration Checklist

### Immediate (24 hours)
- [ ] All critical functions working
- [ ] Payment processing functional
- [ ] User authentication working
- [ ] Admin access confirmed
- [ ] Email notifications sending

### Short-term (1 week)
- [ ] Performance metrics baseline
- [ ] User feedback collected
- [ ] Error rates monitored
- [ ] Backup systems verified
- [ ] Staff training completed

### Long-term (1 month)
- [ ] Analytics data flowing
- [ ] SEO performance improved
- [ ] User satisfaction metrics
- [ ] Performance optimizations
- [ ] Feature adoption tracking

## 🆘 Support & Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
npx prisma db push

# Reset database if needed
npx prisma migrate reset
```

#### Authentication Problems
```typescript
// Check NextAuth configuration
// Verify environment variables
// Check session providers
```

#### Performance Issues
```typescript
// Enable query logging
// Check Redis connection
// Monitor database queries
```

### Support Contacts
- **Technical Lead**: technical@laberinto.com
- **Database Admin**: db@laberinto.com
- **DevOps**: devops@laberinto.com

## 📚 Training Materials

### Admin Training
- New admin dashboard walkthrough
- Inventory management guide
- Payment processing procedures
- Reporting and analytics

### Staff Training  
- Customer service procedures
- Booking management
- Wine catalog updates
- Order fulfillment

### Documentation
- API documentation
- Database schema reference
- Deployment procedures
- Troubleshooting guides

## 🎯 Success Metrics

### Technical Metrics
- **Performance**: Page load times < 2 seconds
- **Uptime**: 99.9% availability
- **Error Rate**: < 0.1% error rate
- **Database**: Query response times < 100ms

### Business Metrics
- **User Experience**: Customer satisfaction scores
- **Conversion**: Booking completion rates
- **Sales**: Revenue impact
- **Operations**: Admin efficiency improvements

This migration represents a significant upgrade to the Laberinto platform, providing a solid foundation for future growth and enhanced user experiences. 