import { initTRPC, TRPCError } from '@trpc/server'
import { type Session } from 'next-auth'
import { auth } from '../auth'
import { prisma } from '../prisma'
import superjson from 'superjson'
import { ZodError } from 'zod'

interface CreateContextOptions {
  session: Session | null
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  }
}

export const createTRPCContext = async () => {
  const session = await auth()

  return createInnerTRPCContext({
    session,
  })
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// Auth middleware
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

// Admin middleware  
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  // NOTE: This is a temporary workaround for demo mode.
  // This bypasses the admin check completely.
  return next({
    ctx: {
      ...ctx,
      session: {
        // @ts-ignore
        user: { 
          role: 'ADMIN', 
          name: 'Demo Admin',
          id: 'cl_demo_admin'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  });

  /* Original security check - temporarily disabled for demo
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  
  if (ctx.session.user.role !== 'ADMIN' && ctx.session.user.role !== 'SUPER_ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
  */
})

export const protectedProcedure = publicProcedure.use(enforceUserIsAuthed)
export const adminProcedure = publicProcedure.use(enforceUserIsAdmin) 