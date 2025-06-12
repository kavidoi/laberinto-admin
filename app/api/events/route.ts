import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const experienceId = searchParams.get('experienceId')

    const where = {
      status: 'SCHEDULED',
      startTime: {
        gte: new Date()
      },
      ...(experienceId && { experienceId })
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        experience: true,
        location: true,
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
} 