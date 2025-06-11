import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const adminRouter = createTRPCRouter({
  // Get all bookings with full details
  getAllBookings: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(['PENDING', 'CONFIRMED', 'PARTIALLY_PAID', 'PAID', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
        search: z.string().optional(),
        sortBy: z.enum(['createdAt', 'eventDate', 'totalAmount', 'status']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Solo los administradores pueden acceder a esta información',
        })
      }

      const { page, limit, status, search, sortBy, sortOrder } = input
      const skip = (page - 1) * limit

      // Build where clause
      const where: any = {}
      
      if (status) {
        where.status = status
      }

      if (search) {
        where.OR = [
          { groupName: { contains: search, mode: 'insensitive' } },
          { organizer: { name: { contains: search, mode: 'insensitive' } } },
          { organizer: { email: { contains: search, mode: 'insensitive' } } },
          { event: { experience: { name: { contains: search, mode: 'insensitive' } } } },
        ]
      }

      // Build orderBy clause
      let orderBy: any = {}
      if (sortBy === 'eventDate') {
        orderBy = { event: { startTime: sortOrder } }
      } else if (sortBy === 'createdAt') {
        orderBy = { createdAt: sortOrder }
      } else if (sortBy === 'totalAmount') {
        orderBy = { totalAmount: sortOrder }
      } else if (sortBy === 'status') {
        orderBy = { status: sortOrder }
      }

      const [bookings, totalCount] = await Promise.all([
        ctx.prisma.booking.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            event: {
              include: {
                                 experience: {
                   select: {
                     id: true,
                     name: true,
                     type: true,
                     duration: true,
                     basePrice: true,
                   },
                 },
                location: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                  },
                },
              },
            },
            participants: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                age: true,
                isDrinker: true,
              },
            },
            addOns: {
              include: {
                addOn: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                  },
                },
              },
            },
            payments: {
              select: {
                id: true,
                amount: true,
                status: true,
                method: true,
                createdAt: true,
              },
            },
          },
        }),
        ctx.prisma.booking.count({ where }),
      ])

      return {
        bookings,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
      }
    }),

  // Get booking statistics for dashboard
  getBookingStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.session.user.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Solo los administradores pueden acceder a esta información',
      })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      monthlyBookings,
      weeklyBookings,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      ctx.prisma.booking.count(),
      ctx.prisma.booking.count({ where: { status: 'PENDING' } }),
      ctx.prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'PAID', 'COMPLETED'] } } }),
      ctx.prisma.booking.count({ where: { status: 'CANCELLED' } }),
      ctx.prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
      ctx.prisma.booking.count({ where: { createdAt: { gte: startOfWeek } } }),
      ctx.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['PAID', 'COMPLETED'] } },
      }),
      ctx.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['PAID', 'COMPLETED'] },
          createdAt: { gte: startOfMonth },
        },
      }),
    ])

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      monthlyBookings,
      weeklyBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
    }
  }),

  // Get booking by ID with full details
  getBookingById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Solo los administradores pueden acceder a esta información',
        })
      }

      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
        include: {
          organizer: true,
          event: {
            include: {
              experience: true,
              location: true,
            },
          },
          participants: true,
          addOns: {
            include: {
              addOn: true,
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reserva no encontrada',
        })
      }

      return booking
    }),

  // Update booking status
  updateBookingStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'CONFIRMED', 'PARTIALLY_PAID', 'PAID', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Solo los administradores pueden modificar reservas',
        })
      }

      const { id, status, notes } = input

      const booking = await ctx.prisma.booking.update({
        where: { id },
        data: {
          status,
          ...(notes && { notes }),
          updatedAt: new Date(),
        },
        include: {
          organizer: { select: { name: true, email: true } },
          event: {
            include: {
              experience: { select: { name: true } },
            },
          },
        },
      })

      return booking
    }),

  // Get recent activity
  getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Solo los administradores pueden acceder a esta información',
      })
    }

    const recentBookings = await ctx.prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        organizer: { select: { name: true, email: true } },
        event: {
          include: {
            experience: { select: { name: true } },
          },
        },
      },
    })

    const recentPayments = await ctx.prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            organizer: { select: { name: true } },
            event: {
              include: {
                experience: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    return {
      recentBookings,
      recentPayments,
    }
  }),
}) 