import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../server'

export const winesRouter = createTRPCRouter({
  // Get all wines (public)
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        categoryId: z.string().optional(),
        regionId: z.string().optional(),
        featured: z.boolean().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, categoryId, regionId, featured, search } = input

      const where = {
        isActive: true,
        ...(categoryId && { categoryId }),
        ...(regionId && { regionId }),
        ...(featured !== undefined && { isFeatured: featured }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { producer: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      const [wines, total] = await Promise.all([
        ctx.prisma.wine.findMany({
          where,
          include: {
            category: true,
            region: true,
            vintages: {
              where: { isAvailable: true },
              orderBy: { year: 'desc' },
            },
            _count: {
              select: { ratings: true },
            },
          },
          orderBy: [
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: limit,
          skip: offset,
        }),
        ctx.prisma.wine.count({ where }),
      ])

      return {
        wines,
        total,
        hasMore: offset + limit < total,
      }
    }),

  // Get wine by ID or slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const wine = await ctx.prisma.wine.findUnique({
        where: { slug: input.slug },
        include: {
          category: true,
          region: true,
          vintages: {
            where: { isAvailable: true },
            orderBy: { year: 'desc' },
          },
          ratings: {
            where: { isPublic: true },
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: { ratings: true },
          },
        },
      })

      if (!wine) {
        throw new Error('Wine not found')
      }

      // Calculate average rating
      const avgRating = await ctx.prisma.wineRating.aggregate({
        where: { wineId: wine.id },
        _avg: { rating: true },
      })

      return {
        ...wine,
        averageRating: avgRating._avg.rating || 0,
      }
    }),

  // Create wine (admin only)
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        slug: z.string().min(1),
        categoryId: z.string(),
        regionId: z.string(),
        producer: z.string().min(1),
        alcohol: z.number().min(0).max(100).optional(),
        description: z.string().optional(),
        tastingNotes: z.string().optional(),
        pairingNotes: z.string().optional(),
        basePrice: z.number().min(0),
        images: z.array(z.string()).default([]),
        isFeatured: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.wine.create({
        data: input,
        include: {
          category: true,
          region: true,
        },
      })
    }),

  // Update wine (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        producer: z.string().min(1).optional(),
        alcohol: z.number().min(0).max(100).optional(),
        description: z.string().optional(),
        tastingNotes: z.string().optional(),
        pairingNotes: z.string().optional(),
        basePrice: z.number().min(0).optional(),
        images: z.array(z.string()).optional(),
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.wine.update({
        where: { id },
        data,
        include: {
          category: true,
          region: true,
        },
      })
    }),

  // Delete wine (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.wine.delete({
        where: { id: input.id },
      })
    }),

  // Get wine categories (public)
  getCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.wineCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { wines: { where: { isActive: true } } },
        },
      },
    })
  }),

  // Get wine regions (public)
  getRegions: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.wineRegion.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { wines: { where: { isActive: true } } },
        },
      },
    })
  }),
}) 