import { Suspense } from 'react'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { Emoji } from '@/components/ui/emoji'

export const metadata: Metadata = {
  title: 'Ventas de Vino - Admin',
  description: 'Gestionar ventas de vino y pedidos',
}

async function getSalesStats() {
  const sales = await prisma.wineSale.findMany({
    select: { totalAmount: true, saleDate: true },
  })

  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const avgSaleAmount = totalSales > 0 ? totalRevenue / totalSales : 0
  
  // Placeholder for monthly growth
  const monthlyGrowth = 0 

  return { totalSales, totalRevenue, avgSaleAmount, monthlyGrowth }
}

async function getSales() {
  return prisma.wineSale.findMany({
    orderBy: {
      saleDate: 'desc',
    },
    include: {
      customer: true,
      items: true,
    },
  })
}

async function SalesStats() {
  const stats = await getSalesStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-gray-900">{stats.totalSales}</div>
        <div className="text-sm text-gray-500">Total Ventas</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-green-600">
          {formatCurrency(stats.totalRevenue, 'CLP')}
        </div>
        <div className="text-sm text-gray-500">Ingresos Totales</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-blue-600">
          {formatCurrency(stats.avgSaleAmount, 'CLP')}
        </div>
        <div className="text-sm text-gray-500">Monto Promedio por Venta</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-purple-600">
          +{stats.monthlyGrowth.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-500">Crecimiento (Demo)</div>
      </div>
    </div>
  )
}

async function SalesTable() {
  const sales = await getSales()

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Ventas de Vino Recientes</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Exportar
            </button>
            <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Nueva Venta
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Venta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{sale.notes || `ID: ...${sale.id.slice(-6)}`}</div>
                    <div className="text-sm text-gray-500">{sale.items.length} artículos</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{sale.customer.name}</div>
                    <div className="text-sm text-gray-500">{sale.customer.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(sale.totalAmount, 'CLP')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    sale.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateShort(sale.saleDate)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas de Vino</h1>
          <p className="text-sm text-gray-600">Gestionar ventas de vino y seguimiento de ingresos</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center p-8">Cargando estadísticas...</div>}>
        <SalesStats />
      </Suspense>

      <Suspense fallback={<div className="text-center p-8">Cargando ventas...</div>}>
        <SalesTable />
      </Suspense>
    </div>
  )
} 