import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      where: {
        isActive: true
      },
      include: {
        location: true,
        _count: {
          select: {
            events: {
              where: {
                status: 'SCHEDULED',
                startTime: {
                  gte: new Date()
                }
              }
            }
          }
        }
      },
      orderBy: {
        basePrice: 'asc'
      }
    })

    return NextResponse.json({ experiences })
  } catch (error) {
    console.error('Error fetching experiences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    )
  }
} 