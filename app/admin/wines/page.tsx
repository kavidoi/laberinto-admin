import { Suspense } from 'react'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Emoji } from '@/components/ui/emoji'

export const metadata: Metadata = {
  title: 'Catálogo de Vinos - Admin',
  description: 'Gestionar catálogo de vinos e inventario',
}

// NOTE: The 'stock' field is missing from the Wine model. 
// For now, we will use a placeholder and calculate other stats.
async function getWineStats() {
  const allWines = await prisma.wine.findMany({
    select: { basePrice: true, isActive: true },
  })

  const totalWines = allWines.length
  const activeWines = allWines.filter(w => w.isActive).length
  // Cannot calculate outOfStock without a stock field.
  const outOfStock = 0 
  // Cannot calculate inventory value without a stock field.
  const totalValue = 0

  return { totalWines, activeWines, outOfStock, totalValue }
}

async function getWines() {
  return prisma.wine.findMany({
    include: {
      category: true,
      region: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

async function WineStats() {
  const stats = await getWineStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-gray-900">{stats.totalWines}</div>
        <div className="text-sm text-gray-500">Total Vinos</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-green-600">{stats.activeWines}</div>
        <div className="text-sm text-gray-500">Vinos Activos</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
        <div className="text-sm text-gray-500">Agotados</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-blue-600">
          {formatCurrency(stats.totalValue, 'CLP')}
        </div>
        <div className="text-sm text-gray-500">Valor Inventario</div>
      </div>
    </div>
  )
}

async function WineTable() {
  const wines = await getWines()

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Catálogo de Vinos</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Importar CSV
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Exportar
            </button>
            <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Añadir Vino
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vino
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {wines.map((wine) => (
              <tr key={wine.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Emoji emoji="🍷" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{wine.name}</div>
                      <div className="text-sm text-gray-500">{wine.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{wine.category?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{wine.region?.name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{wine.producer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(wine.basePrice ? Number(wine.basePrice) : 0, 'CLP')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium text-gray-500`}>
                    N/A
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    wine.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {wine.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-purple-600 hover:text-purple-900 mr-4">
                    Editar
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    Ver
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

export default function WinesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Vinos</h1>
          <p className="text-sm text-gray-600">Gestionar inventario y catálogo de vinos</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center p-8">Cargando estadísticas...</div>}>
        <WineStats />
      </Suspense>

      <Suspense fallback={<div className="text-center p-8">Cargando vinos...</div>}>
        <WineTable />
      </Suspense>
    </div>
  )
} 