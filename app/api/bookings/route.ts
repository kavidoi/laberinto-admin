import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const {
      experienceType, // 'existing' | 'grupal' | 'exclusiva'
      guestCount,
      organizerName,
      organizerLastName,
      organizerEmail,
      organizerPhone,
      organizerCountry,
      specialRequests,
      selectedExtras = [],
      totalAmount
    } = data

    if (!experienceType || !guestCount || !organizerName || !organizerEmail || !totalAmount) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Find the wine tasting experience
    const experience = await prisma.experience.findFirst({
      where: { 
        slug: 'wine-tasting-vineyard-tour' 
      }
    })

    if (!experience) {
      return NextResponse.json({ 
        error: 'Experience not found' 
      }, { status: 404 })
    }

    // Find an available event or create a placeholder
    let event = await prisma.event.findFirst({
      where: {
        experienceId: experience.id,
        status: 'SCHEDULED',
        startTime: {
          gte: new Date()
        }
      }
    })

    // If no event exists, create a placeholder event
    if (!event) {
      const location = await prisma.location.findFirst()
      if (!location) {
        return NextResponse.json({ 
          error: 'No location found' 
        }, { status: 500 })
      }

      // Create a placeholder event for future scheduling
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30) // 30 days from now
      
      event = await prisma.event.create({
        data: {
          experienceId: experience.id,
          locationId: location.id,
          startTime: futureDate,
          endTime: new Date(futureDate.getTime() + (2 * 60 * 60 * 1000)), // 2 hours later
          maxParticipants: 12,
          status: 'SCHEDULED',
        }
      })
    }

    // Find or create the organizer user
    let organizer = await prisma.user.findUnique({
      where: { email: organizerEmail }
    })

    if (!organizer) {
      organizer = await prisma.user.create({
        data: {
          email: organizerEmail,
          name: `${organizerName} ${organizerLastName}`,
          firstName: organizerName,
          lastName: organizerLastName,
          phone: organizerPhone,
          role: 'CUSTOMER',
        }
      })
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        organizerId: organizer.id,
        eventId: event.id,
        totalParticipants: guestCount,
        adultsCount: guestCount,
        childrenCount: 0,
        nonDrinkersCount: 0,
        subtotal: totalAmount,
        totalAmount: totalAmount,
        status: 'PENDING',
        specialRequests: specialRequests || null,
        participants: {
          create: Array.from({ length: guestCount }, (_, i) => ({
            name: i === 0 ? `${organizerName} ${organizerLastName}` : `Invitado ${i + 1}`,
            email: i === 0 ? organizerEmail : null,
            phone: i === 0 ? organizerPhone : null,
            isDrinker: true,
          }))
        }
      },
      include: {
        organizer: true,
        event: {
          include: {
            experience: true,
            location: true,
          }
        },
        participants: true,
      }
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        totalAmount: booking.totalAmount,
        totalParticipants: booking.totalParticipants,
        experience: booking.event.experience.name,
        organizer: booking.organizer.name,
        createdAt: booking.createdAt,
      }
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 