import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@laberinto.com' }
    })
    
    return NextResponse.json({
      success: true,
      userCount,
      adminExists: !!adminUser,
      adminEmail: adminUser?.email,
      adminRole: adminUser?.role
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 