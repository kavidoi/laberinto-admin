'use client';

import { useState } from 'react';

// Demo settings data
const settingsData = {
  business: {
    name: 'Viñedo Laberinto del Vino',
    email: 'info@laberinto.com',
    phone: '+57 310 123 4567',
    address: 'Ruta del Vino, Villa de Leyva, Boyacá',
    website: 'https://laberinto.com',
    timezone: 'America/Bogota'
  },
  booking: {
    maxAdvanceBooking: 90,
    minAdvanceBooking: 1,
    cancellationPolicy: '48 horas',
    confirmationRequired: true,
    autoConfirm: false,
    depositRequired: true,
    depositPercentage: 50
  },
  payment: {
    currency: 'COP',
    paymentMethods: ['Transferencia bancaria', 'Tuu', 'Efectivo'],
    taxRate: 19,
    processingFee: 2.5,
    refundPolicy: '7 días'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmation: true,
    paymentReminders: true,
    marketingEmails: false
  },
  experiences: {
    tourAromas: { active: true, capacity: 12, duration: 90, price: 450000 },
    tourEsencia: { active: true, capacity: 8, duration: 120, price: 680000 },
    experienciaExclusiva: { active: true, capacity: 6, duration: 180, price: 1200000 }
  }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState(settingsData);

  const tabs = [
    { id: 'business', name: 'Negocio', icon: '🏢' },
    { id: 'booking', name: 'Reservas', icon: '📅' },
    { id: 'payment', name: 'Pagos', icon: '💳' },
    { id: 'experiences', name: 'Experiencias', icon: '✨' },
    { id: 'notifications', name: 'Notificaciones', icon: '🔔' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Información del Negocio</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Negocio</label>
          <input
            type="text"
            value={settings.business.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={settings.business.email}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            value={settings.business.phone}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
          <select
            value={settings.business.timezone}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            disabled
          >
            <option value="America/Bogota">America/Bogota</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <textarea
            value={settings.business.address}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            rows={3}
            readOnly
          />
        </div>
      </div>
    </div>
  );

  const renderBookingSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Reservas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Días máximos de antelación</label>
          <input
            type="number"
            value={settings.booking.maxAdvanceBooking}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Días mínimos de antelación</label>
          <input
            type="number"
            value={settings.booking.minAdvanceBooking}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Política de cancelación</label>
          <input
            type="text"
            value={settings.booking.cancellationPolicy}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Porcentaje de depósito (%)</label>
          <input
            type="number"
            value={settings.booking.depositPercentage}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.booking.confirmationRequired}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            disabled
          />
          <label className="ml-2 text-sm text-gray-700">Confirmación manual requerida</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.booking.depositRequired}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            disabled
          />
          <label className="ml-2 text-sm text-gray-700">Depósito requerido</label>
        </div>
      </div>
    </div>
  );

  const renderExperienceSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Experiencias</h3>
      <div className="space-y-6">
        {Object.entries(settings.experiences).map(([key, experience]) => (
          <div key={key} className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={experience.active}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled
                />
                <label className="ml-2 text-sm text-gray-700">Activa</label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                <input
                  type="number"
                  value={experience.capacity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                <input
                  type="number"
                  value={experience.duration}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                  type="text"
                  value={formatCurrency(experience.price)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <p className="font-medium text-gray-900">Notificaciones por email</p>
            <p className="text-sm text-gray-500">Recibir notificaciones generales por correo</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.emailNotifications}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            disabled
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <p className="font-medium text-gray-900">Confirmación de reservas</p>
            <p className="text-sm text-gray-500">Enviar emails de confirmación automáticos</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.bookingConfirmation}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            disabled
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <p className="font-medium text-gray-900">Recordatorios de pago</p>
            <p className="text-sm text-gray-500">Enviar recordatorios para pagos pendientes</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.paymentReminders}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            disabled
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Pagos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
          <select
            value={settings.payment.currency}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            disabled
          >
            <option value="COP">COP - Peso Colombiano</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tasa de impuesto (%)</label>
          <input
            type="number"
            value={settings.payment.taxRate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Comisión de procesamiento (%)</label>
          <input
            type="number"
            step="0.1"
            value={settings.payment.processingFee}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Política de reembolso</label>
          <input
            type="text"
            value={settings.payment.refundPolicy}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            readOnly
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Métodos de pago aceptados</label>
        <div className="space-y-2">
          {settings.payment.paymentMethods.map((method) => (
            <div key={method} className="flex items-center">
              <input
                type="checkbox"
                checked={true}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                disabled
              />
              <label className="ml-2 text-sm text-gray-700">{method}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'business': return renderBusinessSettings();
      case 'booking': return renderBookingSettings();
      case 'payment': return renderPaymentSettings();
      case 'experiences': return renderExperienceSettings();
      case 'notifications': return renderNotificationSettings();
      default: return renderBusinessSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-600">Administra la configuración del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            🔄 Restablecer
          </button>
          <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
            💾 Guardar Cambios
          </button>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <span className="text-blue-600 mr-2">ℹ️</span>
          <div>
            <p className="text-sm text-blue-700">
              <strong>Modo Demo:</strong> Esta página muestra la configuración actual del sistema. 
              En el modo de producción, estos campos serían editables y se guardarían en la base de datos.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 