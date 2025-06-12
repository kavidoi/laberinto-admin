'use client';

import { useState } from 'react';

// Demo analytics data based on Airtable export
const analyticsData = {
  overview: {
    totalRevenue: 25500000,
    totalBookings: 66,
    totalCustomers: 158,
    conversionRate: 39.2,
    avgBookingValue: 386364,
    monthlyGrowth: 15.8
  },
  monthlyData: [
    { month: 'Ene', revenue: 1850000, bookings: 8, customers: 15 },
    { month: 'Feb', revenue: 2100000, bookings: 9, customers: 18 },
    { month: 'Mar', revenue: 2450000, bookings: 11, customers: 22 },
    { month: 'Abr', revenue: 2800000, bookings: 13, customers: 25 },
    { month: 'May', revenue: 3200000, bookings: 15, customers: 28 },
    { month: 'Jun', revenue: 3750000, bookings: 18, customers: 32 }
  ],
  topExperiences: [
    { name: 'Experiencia Exclusiva', bookings: 28, revenue: 14000000 },
    { name: 'Tour Esencia', bookings: 22, revenue: 6600000 },
    { name: 'Tour Aromas', bookings: 16, revenue: 4800000 }
  ],
  customerSegments: [
    { segment: 'Clientes Premium', count: 45, revenue: 15300000 },
    { segment: 'Clientes Regulares', count: 78, revenue: 7800000 },
    { segment: 'Clientes Nuevos', count: 35, revenue: 2400000 }
  ]
};

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analíticas</h1>
          <p className="text-sm text-gray-600">Análisis de rendimiento del negocio</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="1m">Último mes</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último año</option>
          </select>
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            📊 Exportar Reporte
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.overview.totalRevenue)}
              </p>
              <p className="text-sm text-green-600">
                +{analyticsData.overview.monthlyGrowth}% vs mes anterior
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reservas</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalBookings}</p>
              <p className="text-sm text-blue-600">
                Promedio: {formatCurrency(analyticsData.overview.avgBookingValue)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.conversionRate}%</p>
              <p className="text-sm text-purple-600">
                {analyticsData.overview.totalCustomers} clientes totales
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia de Ingresos</h3>
        <div className="relative h-64">
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between space-x-2 h-full">
            {analyticsData.monthlyData.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-purple-600 rounded-t-md w-full transition-all duration-300 hover:bg-purple-700"
                  style={{ height: `${(data.revenue / Math.max(...analyticsData.monthlyData.map(d => d.revenue))) * 100}%` }}
                  title={`${data.month}: ${formatCurrency(data.revenue)}`}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Experiences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Experiencias Más Populares</h3>
          <div className="space-y-4">
            {analyticsData.topExperiences.map((exp, index) => (
              <div key={exp.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{exp.name}</p>
                    <p className="text-sm text-gray-500">{exp.bookings} reservas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(exp.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Segmentos de Clientes</h3>
          <div className="space-y-4">
            {analyticsData.customerSegments.map((segment, index) => (
              <div key={segment.segment} className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{segment.segment}</span>
                  <span className="text-sm text-gray-500">{segment.count} clientes</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(segment.revenue / analyticsData.overview.totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(segment.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Performance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Rendimiento Mensual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nuevos Clientes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio por Reserva</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.monthlyData.map((data) => (
                <tr key={data.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.month} 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(data.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.customers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(data.revenue / data.bookings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 