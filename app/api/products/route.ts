import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category')

    let where: any = {
      isActive: true
    }

    // Handle multiple categories separated by comma
    if (categoryParam) {
      const categories = categoryParam.split(',').map(c => c.trim())
      where.category = {
        in: categories
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { price: 'asc' }
      ]
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
} 