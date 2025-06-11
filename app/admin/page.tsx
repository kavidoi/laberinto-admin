'use client'

import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend 
}: { 
  title: string
  value: string | number
  description: string
  icon: string
  trend?: { value: number; label: string }
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
        {trend && (
          <div className="mt-2 flex items-center">
            <span className={`text-sm font-medium ${
              trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend.value > 0 ? '↗' : trend.value < 0 ? '↘' : '→'} {Math.abs(trend.value)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">{trend.label}</span>
          </div>
        )}
      </div>
      <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800'
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    case 'NO_SHOW':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    PARTIALLY_PAID: 'Pago Parcial',
    PAID: 'Pagada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No Asistió'
  }
  return statusMap[status] || status
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.getBookingStats.useQuery()
  const { data: activity, isLoading: activityLoading } = trpc.admin.getRecentActivity.useQuery()

  if (statsLoading || activityLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido al Panel de Administración</h2>
        <p className="text-gray-600">Aquí puedes gestionar todas las reservas y experiencias de Laberinto.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reservas"
          value={stats?.totalBookings || 0}
          description="Todas las reservas registradas"
          icon="📅"
        />
        <StatCard
          title="Reservas Pendientes"
          value={stats?.pendingBookings || 0}
          description="Esperando confirmación"
          icon="⏳"
        />
        <StatCard
          title="Reservas Confirmadas"
          value={stats?.confirmedBookings || 0}
          description="Confirmadas y pagadas"
          icon="✅"
        />
        <StatCard
          title="Ingresos Totales"
          value={formatCurrency(Number(stats?.totalRevenue || 0))}
          description="Todos los pagos recibidos"
          icon="💰"
        />
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Reservas Este Mes"
          value={stats?.monthlyBookings || 0}
          description="Nuevas reservas del mes"
          icon="📊"
        />
        <StatCard
          title="Reservas Esta Semana"
          value={stats?.weeklyBookings || 0}
          description="Reservas de los últimos 7 días"
          icon="📈"
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(Number(stats?.monthlyRevenue || 0))}
          description="Pagos recibidos este mes"
          icon="💳"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Reservas Recientes</h3>
              <Link 
                href="/admin/reservations"
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                Ver todas
              </Link>
            </div>
          </div>
          <div className="p-6">
            {activity?.recentBookings && activity.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {activity.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.organizer.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.event.experience.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(booking.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {formatStatus(booking.status)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(Number(booking.totalAmount))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay reservas recientes</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Pagos Recientes</h3>
              <Link 
                href="/admin/payments"
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                Ver todos
              </Link>
            </div>
          </div>
          <div className="p-6">
            {activity?.recentPayments && activity.recentPayments.length > 0 ? (
              <div className="space-y-4">
                {activity.recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {payment.booking?.organizer.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payment.booking?.event.experience.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'COMPLETED' ? 'Completado' : 
                         payment.status === 'PENDING' ? 'Pendiente' : 
                         payment.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(Number(payment.amount))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay pagos recientes</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/reservations"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">📅</span>
            <div>
              <p className="font-medium text-gray-900">Gestionar Reservas</p>
              <p className="text-sm text-gray-500">Ver y administrar todas las reservas</p>
            </div>
          </Link>
          <Link
            href="/admin/events"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">🎉</span>
            <div>
              <p className="font-medium text-gray-900">Crear Evento</p>
              <p className="text-sm text-gray-500">Programar nuevas experiencias</p>
            </div>
          </Link>
          <Link
            href="/admin/payments"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">💳</span>
            <div>
              <p className="font-medium text-gray-900">Ver Pagos</p>
              <p className="text-sm text-gray-500">Revisar historial de pagos</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 