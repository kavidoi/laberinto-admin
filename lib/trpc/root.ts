import { createTRPCRouter } from './server'
import { winesRouter } from './routers/wines'
import { adminRouter } from './routers/admin'

export const appRouter = createTRPCRouter({
  wines: winesRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter 