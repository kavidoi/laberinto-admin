import { Suspense } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eventos - Admin',
  description: 'Gestionar eventos y programación de degustaciones',
}

// Mock events data based on Airtable Eventos
const eventsData = [
  {
    id: '1',
    name: 'Degustación Privada - Esencia',
    experienceType: 'Degustación Privada',
    date: '2025-06-15',
    time: '15:00',
    duration: 90,
    participants: 6,
    maxParticipants: 8,
    status: 'Scheduled',
    guide: 'María González',
    price: 45000,
    location: 'Sala Degustación A'
  },
  {
    id: '2',
    name: 'Tour Viñedo + Degustación',
    experienceType: 'Tour + Degustación',
    date: '2025-06-16',
    time: '11:00',
    duration: 120,
    participants: 12,
    maxParticipants: 15,
    status: 'Confirmed',
    guide: 'Carlos Mendoza',
    price: 65000,
    location: 'Viñedo Principal'
  },
  {
    id: '3',
    name: 'Cata Maridaje Premium',
    experienceType: 'Maridaje',
    date: '2025-06-17',
    time: '19:00',
    duration: 150,
    participants: 8,
    maxParticipants: 10,
    status: 'Nearly Full',
    guide: 'Ana Restrepo',
    price: 85000,
    location: 'Sala Premium'
  }
]



const eventStats = {
  upcomingEvents: 42,
  totalBookings: 155,
  monthlyRevenue: 8750000,
  occupancyRate: 78
}

function EventStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-gray-900">{eventStats.upcomingEvents}</div>
        <div className="text-sm text-gray-500">Eventos Próximos</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-green-600">{eventStats.totalBookings}</div>
        <div className="text-sm text-gray-500">Total Reservas</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-blue-600">
          ${eventStats.monthlyRevenue.toLocaleString()} CLP
        </div>
        <div className="text-sm text-gray-500">Ingresos Mensuales</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-2xl font-bold text-purple-600">{eventStats.occupancyRate}%</div>
        <div className="text-sm text-gray-500">Tasa de Ocupación</div>
      </div>
    </div>
  )
}

function EventsTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Eventos Próximos</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Vista Calendario
            </button>
            <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Programar Evento
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha y Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participantes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guía
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ingresos
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
            {eventsData.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{event.name}</div>
                    <div className="text-sm text-gray-500">{event.experienceType} • {event.duration}min</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{event.time}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {event.participants}/{event.maxParticipants}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{event.guide}</div>
                  <div className="text-sm text-gray-500">{event.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${(event.participants * event.price).toLocaleString()} CLP
                  </div>
                  <div className="text-sm text-gray-500">
                    ${event.price.toLocaleString()} pp
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    event.status === 'Nearly Full' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-purple-600 hover:text-purple-900 mr-4">
                    Gestionar
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



export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-600">Gestionar eventos programados y reservas de degustaciones</p>
        </div>
      </div>

      <Suspense fallback={<div>Cargando estadísticas...</div>}>
        <EventStats />
      </Suspense>

      <Suspense fallback={<div>Cargando eventos...</div>}>
        <EventsTable />
      </Suspense>
    </div>
  )
} 