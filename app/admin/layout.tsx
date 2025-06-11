'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Reservas', href: '/admin/reservations', icon: '📅' },
  { name: 'Eventos', href: '/admin/events', icon: '🎉' },
  { name: 'Pagos', href: '/admin/payments', icon: '💳' },
  { name: 'Usuarios', href: '/admin/users', icon: '👥' },
  { name: 'Configuración', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log('Admin Layout - Session Status:', status)
    console.log('Admin Layout - Session:', session)
    console.log('Admin Layout - User Role:', session?.user?.role)
    
    if (status === 'loading') return // Still loading

    if (!session) {
      console.log('No session - redirecting to signin')
      router.push('/auth/signin?callbackUrl=/admin')
      return
    }

    if (session.user.role !== 'ADMIN') {
      console.log('User role is not ADMIN:', session.user.role, '- redirecting to homepage')
      router.push('/')
      return
    }
    
    console.log('Admin access granted')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center bg-amber-600">
            <Link href="/admin" className="text-xl font-bold text-white">
              Laberinto Admin
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {session.user.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session.user.name}</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                Panel de Administración
              </h1>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Ver sitio web
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                >
                  Cerrar sesión
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 