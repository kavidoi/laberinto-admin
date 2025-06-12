'use client';

import { useState } from 'react';

// Demo payment data based on Airtable export
const demoPayments = [
  {
    id: 'PMT-001',
    date: '2024-06-10',
    amount: 12500000,
    currency: 'COP',
    method: 'Transferencia bancaria',
    status: 'completed',
    customer: 'María González',
    booking: 'RES-123',
    description: 'Experiencia Exclusiva - 4 personas',
    reference: 'TRF-789456123'
  },
  {
    id: 'PMT-002',
    date: '2024-06-09',
    amount: 8900000,
    currency: 'COP',
    method: 'Tuu',
    status: 'completed',
    customer: 'Carlos Rodríguez',
    booking: 'RES-124',
    description: 'Tour Esencia + Cena',
    reference: 'TUU-456789012'
  },
  {
    id: 'PMT-003',
    date: '2024-06-08',
    amount: 15600000,
    currency: 'COP',
    method: 'Transferencia bancaria',
    status: 'pending',
    customer: 'Ana Martínez',
    booking: 'RES-125',
    description: 'Experiencia Exclusiva - 6 personas',
    reference: 'TRF-234567890'
  },
  {
    id: 'PMT-004',
    date: '2024-06-07',
    amount: 6750000,
    currency: 'COP',
    method: 'Tuu',
    status: 'completed',
    customer: 'Luis Fernández',
    booking: 'RES-126',
    description: 'Tour Aromas',
    reference: 'TUU-567890123'
  },
  {
    id: 'PMT-005',
    date: '2024-06-06',
    amount: 11200000,
    currency: 'COP',
    method: 'Transferencia bancaria',
    status: 'failed',
    customer: 'Patricia Silva',
    booking: 'RES-127',
    description: 'Experiencia Exclusiva - 3 personas',
    reference: 'TRF-345678901'
  }
];

const paymentStats = {
  totalRevenue: 54950000,
  totalTransactions: 5,
  avgTransaction: 10990000,
  pendingAmount: 15600000,
  completedTransactions: 3,
  failedTransactions: 1
};

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const filteredPayments = demoPayments.filter(payment => {
    const matchesSearch = payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.booking.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getMethodBadge = (method: string) => {
    return method === 'Tuu' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-sm text-gray-600">Administra transacciones y métodos de pago</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
            📊 Exportar
          </button>
          <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2">
            💳 Procesar Pago
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(paymentStats.totalRevenue)}
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
              <p className="text-sm font-medium text-gray-500">Transacciones</p>
              <p className="text-2xl font-bold text-gray-900">{paymentStats.totalTransactions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Promedio por Transacción</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(paymentStats.avgTransaction)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(paymentStats.pendingAmount)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por cliente, referencia o reserva..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'completed', label: 'Completados' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'failed', label: 'Fallidos' }
            ].map((status) => (
              <button
                key={status.key}
                onClick={() => setStatusFilter(status.key as any)}
                className={`px-4 py-2 text-sm rounded-md ${
                  statusFilter === status.key
                    ? 'bg-purple-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Transacciones Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserva</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm">{payment.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(payment.date).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900">{payment.customer}</p>
                      <p className="text-sm text-gray-500">{payment.reference}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodBadge(payment.method)}`}>
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                      {payment.status === 'completed' ? 'Completado' :
                       payment.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-blue-600">{payment.booking}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-purple-600 hover:text-purple-900 mr-4">
                      Ver
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Más
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron transacciones con los filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
} 