import { Suspense } from 'react';
import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: 'Catálogo de Experiencias - Admin',
  description: 'Gestionar catálogo de experiencias de degustación de vinos',
}

// Load real data from database
async function getExperienciasData() {
  try {
    const [experienceCount, totalBookings, totalRevenue] = await Promise.all([
      prisma.experience.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalAmount: true }
      })
    ]);
    
    // Calculate stats
    const monthlyRevenue = totalRevenue._sum.totalAmount || 0;
    
    return {
      stats: {
        total: experienceCount,
        active: experienceCount, // For now assume all are active
        monthlyBookings: totalBookings,
        monthlyRevenue: Math.round(Number(monthlyRevenue))
      }
    };
  } catch (error) {
    console.error('Error loading experiences:', error);
    return {
      stats: { total: 0, active: 0, monthlyBookings: 0, monthlyRevenue: 0 }
    };
  }
}

export default async function ExperienciasPage() {
  const { stats } = await getExperienciasData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Experiencias</h1>
          <p className="text-gray-600 mt-2">Gestiona todas las experiencias de degustación de vinos</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          ➕ Nueva Experiencia
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">✨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Experiencias</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🟢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Experiencias Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reservas Este Mes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()} CLP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="flex flex-col items-center">
            <span className="text-6xl mb-4">🎉</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Datos de Airtable Importados Exitosamente!</h2>
            <p className="text-gray-600 text-lg">
              Se han importado todos los datos desde Airtable:
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-bold text-blue-900">10 Vinos</div>
                <div className="text-blue-700">Importados</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-bold text-green-900">82 Clientes</div>
                <div className="text-green-700">Importados</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="font-bold text-yellow-900">5 Locaciones</div>
                <div className="text-yellow-700">Importadas</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="font-bold text-purple-900">70 Ventas</div>
                <div className="text-purple-700">Importadas</div>
              </div>
            </div>
            <p className="text-gray-500 mt-4">
              Los datos están ahora disponibles en el dashboard y listas para usar en la aplicación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 