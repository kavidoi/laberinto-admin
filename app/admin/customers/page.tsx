import { Suspense } from 'react'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Emoji } from '@/components/ui/emoji'

export const metadata: Metadata = {
  title: 'Clientes - Admin',
  description: 'Gestionar base de datos de clientes y relaciones',
}

async function getCustomerStats() {
  const totalCustomers = await prisma.user.count()
  const activeCustomers = await prisma.user.count({ where: { role: { not: 'INACTIVE' } } })
  const vipCustomers = await prisma.user.count({ where: { role: 'VIP' } }) // Assuming VIP role exists

  // This is a simplified calculation. A real LTV would be more complex.
  const sales = await prisma.wineSale.findMany({ select: { totalAmount: true } })
  const totalLifetimeValue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  return { totalCustomers, activeCustomers, vipCustomers, totalLifetimeValue }
}

async function getCustomers() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      wineSales: {
        select: {
          totalAmount: true,
          saleDate: true
        }
      }
    }
  })
}

async function CustomerStats() {
  const stats = await getCustomerStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
        <div className="text-sm text-gray-500">Total Clientes</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
        <div className="text-sm text-gray-500">Clientes Activos</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-purple-600">{stats.vipCustomers}</div>
        <div className="text-sm text-gray-500">Clientes VIP</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-blue-600">
          {formatCurrency(stats.totalLifetimeValue, 'CLP')}
        </div>
        <div className="text-sm text-gray-500">Valor Total de Ventas</div>
      </div>
    </div>
  )
}

async function CustomerTable() {
  const customers = await getCustomers()

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Base de Datos de Clientes</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Exportar
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Filtros
            </button>
            <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Agregar Cliente
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ventas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Gastado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => {
              const totalSpent = customer.wineSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
              const lastOrder = customer.wineSales.length > 0 ? new Date(customer.wineSales[0].saleDate) : null
              return (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Emoji emoji="👤" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">ID: ...{customer.id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone || 'Sin teléfono'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.wineSales.length} órdenes</div>
                    <div className="text-sm text-gray-500">
                      {lastOrder ? `Última: ${lastOrder.toLocaleDateString()}` : 'Sin órdenes'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(totalSpent, 'CLP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      customer.role === 'VIP' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-purple-600 hover:text-purple-900 mr-4">
                      Ver
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Editar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-600">Gestionar relaciones y datos de clientes</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center p-8">Cargando estadísticas...</div>}>
        <CustomerStats />
      </Suspense>

      <Suspense fallback={<div className="text-center p-8">Cargando clientes...</div>}>
        <CustomerTable />
      </Suspense>
    </div>
  )
} 