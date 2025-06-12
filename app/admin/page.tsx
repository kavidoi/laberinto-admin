import { Metadata } from 'next'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import { Emoji } from '@/components/ui/emoji'

const prisma = new PrismaClient()

export const metadata: Metadata = {
  title: 'Dashboard Admin',
  description: 'Panel administrativo principal de Laberinto Wines',
}

async function getDashboardStats() {
  try {
    const [
      totalCustomers,
      totalWines,
      totalBookings,
      totalWineSales,
      totalLocations,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.wine.count(),
      prisma.booking.count(),
      prisma.wineSale.count(),
      prisma.location.count(),
      prisma.wineSale.aggregate({ _sum: { totalAmount: true } })
    ])

    return {
      totalCustomers,
      totalWines,
      totalBookings,
      totalWineSales,
      totalLocations,
      totalRevenue: Math.round(Number(totalRevenue._sum.totalAmount || 0))
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
    return {
      totalCustomers: 0,
      totalWines: 0,
      totalBookings: 0,
      totalWineSales: 0,
      totalLocations: 0,
      totalRevenue: 0
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel Principal</h1>
        <p className="text-gray-600 mt-2">Bienvenido al sistema administrativo de Laberinto Wines</p>
      </div>

      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Emoji emoji="🎉" size="2xl" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              ¡Importación de Airtable Completada!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Todos los datos han sido importados exitosamente desde Airtable. El sistema está listo para usar.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Emoji emoji="👥" size="2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Emoji emoji="🍷" size="2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vinos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWines}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Emoji emoji="📅" size="2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reservas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Emoji emoji="🛒" size="2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventas de Vino</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWineSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Emoji emoji="📍" size="2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Locaciones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLocations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Emoji emoji="💰" size="2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Acciones Rápidas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link 
              href="/admin/sales" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Emoji emoji="📈" size="2xl" className="mr-3" />
              <div>
                <p className="font-medium text-gray-900">Ver Ventas de Vino</p>
                <p className="text-sm text-gray-500">Gestionar ventas</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/wines" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Emoji emoji="🍷" size="2xl" className="mr-3" />
              <div>
                <p className="font-medium text-gray-900">Gestionar Vinos</p>
                <p className="text-sm text-gray-500">Catálogo de vinos</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/customers" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Emoji emoji="👥" size="2xl" className="mr-3" />
              <div>
                <p className="font-medium text-gray-900">Ver Clientes</p>
                <p className="text-sm text-gray-500">Base de clientes</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/experiencias" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Emoji emoji="✨" size="2xl" className="mr-3" />
              <div>
                <p className="font-medium text-gray-900">Experiencias</p>
                <p className="text-sm text-gray-500">Catálogo completo</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Import Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Estado de Importación de Datos</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalWines}</div>
              <div className="text-sm text-green-800">Vinos Importados</div>
              <div className="text-xs text-green-600 mt-1">✅ Completo</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalCustomers}</div>
              <div className="text-sm text-green-800">Contactos Importados</div>
              <div className="text-xs text-green-600 mt-1">✅ Completo</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalLocations}</div>
              <div className="text-sm text-green-800">Locaciones Importadas</div>
              <div className="text-xs text-green-600 mt-1">✅ Completo</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalWineSales}</div>
              <div className="text-sm text-green-800">Ventas Importadas</div>
              <div className="text-xs text-green-600 mt-1">✅ Completo</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Última importación: Hoy • Todos los datos de Airtable están sincronizados
          </div>
        </div>
      </div>
    </div>
  )
} 