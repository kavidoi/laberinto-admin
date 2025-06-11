import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all bookings with related data
    const bookings = await prisma.booking.findMany({
      include: {
        organizer: true,
        event: {
          include: {
            experience: true,
            location: true,
          },
        },
        participants: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get counts
    const totalBookings = await prisma.booking.count()
    const pendingBookings = await prisma.booking.count({
      where: { status: 'PENDING' }
    })
    const confirmedBookings = await prisma.booking.count({
      where: { status: 'CONFIRMED' }
    })

    return NextResponse.json({
      success: true,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      bookings: bookings.map(booking => ({
        id: booking.id,
        status: booking.status,
        totalAmount: booking.totalAmount,
        createdAt: booking.createdAt,
        organizer: {
          name: booking.organizer.name,
          email: booking.organizer.email,
        },
        event: booking.event ? {
          id: booking.event.id,
          startTime: booking.event.startTime,
          experience: {
            name: booking.event.experience.name,
          },
        } : null,
        participantCount: booking.participants.length,
        paymentCount: booking.payments.length,
      })),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 