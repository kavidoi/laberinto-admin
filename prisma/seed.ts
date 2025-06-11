import { PrismaClient, UserRole, ExperienceType, LocationType, EventStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // =============================================
  // USERS & AUTHENTICATION
  // =============================================

  // Create admin user - Fixed email consistency for authentication
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@laberinto.com' },
    update: {},
    create: {
      email: 'admin@laberinto.com',
      name: 'Admin Laberinto',
      firstName: 'Admin',
      lastName: 'Laberinto',
      role: UserRole.ADMIN,
      phone: '+56912345678',
      rut: '12345678-9',
    },
  })

  // Create sample customer
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'María González',
      firstName: 'María',
      lastName: 'González',
      role: UserRole.CUSTOMER,
      phone: '+56987654321',
      rut: '98765432-1',
      preferences: {
        create: {
          preferredWineTypes: ['red', 'white'],
          preferredRegions: ['Maipo Valley', 'Casablanca Valley'],
          emailNotifications: true,
          marketingEmails: true,
        },
      },
    },
  })

  console.log('✅ Users created')

  // =============================================
  // WINE CATALOG
  // =============================================

  // Wine regions
  const maipoValley = await prisma.wineRegion.upsert({
    where: { name: 'Maipo Valley' },
    update: {},
    create: {
      name: 'Maipo Valley',
      country: 'Chile',
      description: 'Famous for its Cabernet Sauvignon and proximity to Santiago',
    },
  })

  const casablancaValley = await prisma.wineRegion.upsert({
    where: { name: 'Casablanca Valley' },
    update: {},
    create: {
      name: 'Casablanca Valley',
      country: 'Chile',
      description: 'Cool climate region ideal for white wines and Pinot Noir',
    },
  })

  // Wine categories
  const redWineCategory = await prisma.wineCategory.upsert({
    where: { slug: 'red-wines' },
    update: {},
    create: {
      name: 'Red Wines',
      slug: 'red-wines',
      description: 'Full-bodied red wines',
    },
  })

  const whiteWineCategory = await prisma.wineCategory.upsert({
    where: { slug: 'white-wines' },
    update: {},
    create: {
      name: 'White Wines',
      slug: 'white-wines',
      description: 'Crisp and refreshing white wines',
    },
  })

  // Sample wines
  const cabernet = await prisma.wine.upsert({
    where: { code: 'LAB-CAB-2021' },
    update: {},
    create: {
      name: 'Laberinto Cabernet Sauvignon Reserva',
      code: 'LAB-CAB-2021',
      slug: 'laberinto-cabernet-sauvignon-reserva-2021',
      categoryId: redWineCategory.id,
      regionId: maipoValley.id,
      producer: 'Viña Laberinto',
      alcohol: 14.5,
      description: 'An elegant Cabernet Sauvignon with notes of blackcurrant, cedar, and spice.',
      tastingNotes: 'Dark ruby color with aromas of blackcurrant, cedar, and vanilla. On the palate, well-structured tannins with a long, elegant finish.',
      pairingNotes: 'Perfect with grilled red meats, aged cheeses, and dark chocolate.',
      basePrice: 25990,
      images: ['/images/wines/cabernet-reserva.jpg'],
      isFeatured: true,
    },
  })

  const sauvignonBlanc = await prisma.wine.upsert({
    where: { code: 'LAB-SB-2023' },
    update: {},
    create: {
      name: 'Laberinto Sauvignon Blanc',
      code: 'LAB-SB-2023',
      slug: 'laberinto-sauvignon-blanc-2023',
      categoryId: whiteWineCategory.id,
      regionId: casablancaValley.id,
      producer: 'Viña Laberinto',
      alcohol: 13.0,
      description: 'A fresh and vibrant Sauvignon Blanc with tropical fruit flavors.',
      tastingNotes: 'Pale yellow color with green hues. Aromas of passion fruit, grapefruit, and fresh herbs. Crisp acidity with a clean, refreshing finish.',
      pairingNotes: 'Excellent with seafood, salads, goat cheese, and light appetizers.',
      basePrice: 18990,
      images: ['/images/wines/sauvignon-blanc.jpg'],
      isFeatured: true,
    },
  })

  console.log('✅ Wine catalog created')

  // =============================================
  // LOCATIONS
  // =============================================

  // Check if location exists first
  let mainLocation = await prisma.location.findFirst({
    where: { name: 'Laberinto Main Winery' }
  })
  
  if (!mainLocation) {
    mainLocation = await prisma.location.create({
      data: {
        name: 'Laberinto Main Winery',
        type: LocationType.VINEYARD,
        address: 'Camino Laberinto 123, Maipo Valley',
        city: 'Santiago',
        state: 'Metropolitana',
        country: 'Chile',
        postalCode: '8320000',
        contactPhone: '+56223456789',
        contactEmail: 'winery@laberinto.com',
        capacity: 200,
        isActive: true,
      },
    })
  }

  // Add staff to location if not exists
  const existingStaff = await prisma.locationStaff.findFirst({
    where: {
      locationId: mainLocation.id,
      userId: adminUser.id,
    },
  })
  
  if (!existingStaff) {
    await prisma.locationStaff.create({
      data: {
        locationId: mainLocation.id,
        userId: adminUser.id,
        role: 'Winery Manager',
      },
    })
  }

  console.log('✅ Locations created')

  // =============================================
  // EXPERIENCES
  // =============================================

  const wineTouring = await prisma.experience.upsert({
    where: { slug: 'wine-tasting-vineyard-tour' },
    update: {},
    create: {
      name: 'Wine Tasting & Vineyard Tour',
      slug: 'wine-tasting-vineyard-tour',
      type: ExperienceType.WINE_TOUR,
      description: 'Discover the art of winemaking with a guided tour through our vineyards followed by a tasting of our premium wines.',
      longDescription: 'Join us for an unforgettable journey through our vineyards and cellars. Learn about our winemaking process, from grape to bottle, and taste our finest selections paired with local delicacies.',
      duration: 120, // 2 hours
      maxParticipants: 12,
      minParticipants: 2,
      basePrice: 45000,
      requirements: 'Minimum age 18, Comfortable walking shoes recommended',
      ageRestriction: 18,
      isActive: true,
      images: ['/images/experiences/wine-tour.jpg'],
    },
  })

  // Create sample events (skip if they already exist)
  try {
    const event1 = await prisma.event.create({
      data: {
        experienceId: wineTouring.id,
        locationId: mainLocation.id,
        startTime: new Date('2024-12-15T10:00:00'),
        endTime: new Date('2024-12-15T12:00:00'),
        maxParticipants: 12,
        status: EventStatus.SCHEDULED,
      },
    })

    const event2 = await prisma.event.create({
      data: {
        experienceId: wineTouring.id,
        locationId: mainLocation.id,
        startTime: new Date('2024-12-15T15:00:00'),
        endTime: new Date('2024-12-15T17:00:00'),
        maxParticipants: 12,
        status: EventStatus.SCHEDULED,
      },
    })
  } catch (error) {
    // Events might already exist, that's okay
    console.log('⚠️ Events might already exist, skipping...')
  }

  console.log('✅ Experiences and events created')

  // =============================================
  // SYSTEM CONFIG
  // =============================================

  try {
    await prisma.systemConfig.createMany({
      skipDuplicates: true,
      data: [
        {
          key: 'site_name',
          value: 'Laberinto',
        },
        {
          key: 'currency',
          value: 'CLP',
        },
        {
          key: 'timezone',
          value: 'America/Santiago',
        },
        {
          key: 'max_booking_advance_days',
          value: '90',
        },
        {
          key: 'min_booking_advance_hours',
          value: '24',
        },
      ],
    })
  } catch (error) {
    // Config might already exist, that's okay
    console.log('⚠️ System config might already exist, skipping...')
  }

  console.log('✅ System configuration created')
  console.log('🎉 Database seeding completed successfully!')
  
  console.log('\n📊 Summary:')
  console.log(`- Users: ${await prisma.user.count()}`)
  console.log(`- Wines: ${await prisma.wine.count()}`)
  console.log(`- Experiences: ${await prisma.experience.count()}`)
  console.log(`- Events: ${await prisma.event.count()}`)
  console.log(`- Locations: ${await prisma.location.count()}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 