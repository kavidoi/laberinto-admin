'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// Booking flow constants
const BOOKING_STEPS = {
  EVENT: 1,
  GROUP: 2,
  EXTRAS: 3,
  PAYMENT: 4,
} as const

type BookingStep = typeof BOOKING_STEPS[keyof typeof BOOKING_STEPS]

// Types
interface EventSelection {
  path: 'existing' | 'grupal' | 'exclusiva'
  eventId?: string
  experienceType?: string
  date?: Date
  time?: string
  selectedActivities?: string[]
}

interface GroupConfig {
  guestCount: number
  organizerName: string
  organizerLastName: string
  organizerEmail: string
  organizerPhone: string
  organizerCountry: string
  isSingleAttendeeAdult?: boolean
  areAllAdultDrinkers?: boolean
  nonDrinkersCount: number
  over16Confirmation?: boolean
  specialRequests: string
}

interface FoodExtra {
  id: string
  name: string
  description: string
  price: number
  quantity: number
}

export default function BookingPage() {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState<BookingStep>(BOOKING_STEPS.EVENT)
  const [maxStepReached, setMaxStepReached] = useState<BookingStep>(BOOKING_STEPS.EVENT)

  // Booking state
  const [eventSelection, setEventSelection] = useState<EventSelection | null>(null)
  const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(null)
  const [selectedExtras, setSelectedExtras] = useState<FoodExtra[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [bookingId, setBookingId] = useState<string | null>(null)

  // Navigation functions
  const goToStep = (step: BookingStep) => {
    if (step <= maxStepReached) {
      setCurrentStep(step)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      const next = (currentStep + 1) as BookingStep
      setCurrentStep(next)
      setMaxStepReached(prev => Math.max(prev, next) as BookingStep)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as BookingStep)
    }
  }

  // Step components
  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => goToStep(step as BookingStep)}
              disabled={step > maxStepReached}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                transition-colors duration-200
                ${step === currentStep
                  ? 'bg-purple-600 text-white'
                  : step <= maxStepReached
                  ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {step}
            </button>
            {step < 4 && (
              <div className={`w-8 h-0.5 ${step < currentStep ? 'bg-purple-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const EventStep = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Selecciona tu Experiencia</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Existing Events Option */}
        <div
          onClick={() => {
            setEventSelection({ path: 'existing' })
            nextStep()
          }}
          className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 hover:border-purple-500"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍷</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Experiencias Programadas</h3>
            <p className="text-gray-600 mb-4">
              Únete a un grupo abierto y ven a compartir el mejor vino rodeados de la Cordillera de los Andes.
            </p>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block">
              Descuento disponible
            </div>
            <p className="text-sm text-gray-500 mt-2">Sábado y Domingo</p>
          </div>
        </div>

        {/* Group Request Option */}
        <div
          onClick={() => {
            setEventSelection({ path: 'grupal' })
            nextStep()
          }}
          className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 hover:border-purple-500"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Experiencia Grupal</h3>
            <p className="text-gray-600 mb-4">
              Si ninguna fecha te acomoda y faltan al menos 10 días, puedes agendar una nueva experiencia grupal.
            </p>
            <p className="text-sm text-gray-500 mt-6">Sábado y Domingo</p>
          </div>
        </div>

        {/* Exclusive Experience Option */}
        <div
          onClick={() => {
            setEventSelection({ path: 'exclusiva' })
            nextStep()
          }}
          className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 hover:border-purple-500"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Experiencia Exclusiva</h3>
            <p className="text-gray-600 mb-4">
              Te invitamos a una experiencia hecha a tu medida y la de tu grupo. Vivirán un momento único.
            </p>
            <p className="text-sm text-gray-500 mt-6">Flexible</p>
          </div>
        </div>
      </div>
    </div>
  )

  const GroupStep = () => {
    const [formData, setFormData] = useState({
      guestCount: 2,
      organizerName: '',
      organizerLastName: '',
      organizerEmail: session?.user?.email || '',
      organizerPhone: '',
      organizerCountry: 'Chile',
      specialRequests: '',
      isSingleAttendeeAdult: null as boolean | null,
      areAllAdultDrinkers: null as boolean | null,
      nonDrinkersCount: 0,
      over16Confirmation: null as boolean | null,
    })

    const handleSubmit = () => {
      // Validation
      if (!formData.organizerName || !formData.organizerEmail || !formData.organizerPhone) {
        alert('Por favor completa todos los campos obligatorios')
        return
      }

      setGroupConfig({
        guestCount: formData.guestCount,
        organizerName: formData.organizerName,
        organizerLastName: formData.organizerLastName,
        organizerEmail: formData.organizerEmail,
        organizerPhone: formData.organizerPhone,
        organizerCountry: formData.organizerCountry,
        specialRequests: formData.specialRequests,
        isSingleAttendeeAdult: formData.isSingleAttendeeAdult || undefined,
        areAllAdultDrinkers: formData.areAllAdultDrinkers || undefined,
        nonDrinkersCount: formData.nonDrinkersCount,
        over16Confirmation: formData.over16Confirmation || undefined,
      })
      
      nextStep()
    }

    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Configura tu Grupo</h2>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Guest Count */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de participantes
            </label>
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => setFormData(prev => ({ ...prev, guestCount: count }))}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium
                    transition-colors duration-200
                    ${formData.guestCount === count
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Organizer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.organizerName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.organizerLastName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizerLastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.organizerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, organizerEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.organizerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, organizerPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Age Confirmations */}
          {formData.guestCount === 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿El participante es mayor de edad?
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, isSingleAttendeeAdult: true }))}
                  className={`px-4 py-2 rounded-md ${
                    formData.isSingleAttendeeAdult === true
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sí
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, isSingleAttendeeAdult: false }))}
                  className={`px-4 py-2 rounded-md ${
                    formData.isSingleAttendeeAdult === false
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {formData.guestCount > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Todos los participantes son mayores de edad y toman alcohol?
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, areAllAdultDrinkers: true }))}
                  className={`px-4 py-2 rounded-md ${
                    formData.areAllAdultDrinkers === true
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sí
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, areAllAdultDrinkers: false }))}
                  className={`px-4 py-2 rounded-md ${
                    formData.areAllAdultDrinkers === false
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Special Requests */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solicitudes especiales (opcional)
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Alergias, preferencias dietéticas, celebraciones especiales..."
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium"
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  const ExtrasStep = () => {
    const availableExtras: FoodExtra[] = [
      {
        id: 'lunch-premium',
        name: 'Almuerzo Premium',
        description: 'Almuerzo de 3 tiempos maridado con nuestros vinos',
        price: 35000,
        quantity: 1,
      },
      {
        id: 'cheese-board',
        name: 'Tabla de Quesos',
        description: 'Selección de quesos artesanales chilenos',
        price: 15000,
        quantity: 1,
      },
      {
        id: 'transport',
        name: 'Transporte desde Santiago',
        description: 'Transporte ida y vuelta desde Santiago',
        price: 25000,
        quantity: 1,
      },
    ]

    const toggleExtra = (extra: FoodExtra) => {
      setSelectedExtras(prev => {
        const exists = prev.find(e => e.id === extra.id)
        if (exists) {
          return prev.filter(e => e.id !== extra.id)
        } else {
          return [...prev, extra]
        }
      })
    }

    const calculateTotal = () => {
      const basePrice = (eventSelection?.path === 'exclusiva' ? 65000 : 45000) * (groupConfig?.guestCount || 1)
      const extrasPrice = selectedExtras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0)
      return basePrice + extrasPrice
    }

    const handleContinue = () => {
      setTotalPrice(calculateTotal())
      nextStep()
    }

    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Extras y Complementos</h2>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4 mb-6">
            {availableExtras.map((extra) => (
              <div
                key={extra.id}
                onClick={() => toggleExtra(extra)}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${selectedExtras.find(e => e.id === extra.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{extra.name}</h3>
                    <p className="text-gray-600 text-sm">{extra.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-purple-600">
                      ${extra.price.toLocaleString()} CLP
                    </p>
                    <div className={`
                      w-5 h-5 rounded border-2 mt-2
                      ${selectedExtras.find(e => e.id === extra.id)
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-gray-300'
                      }
                    `}>
                      {selectedExtras.find(e => e.id === extra.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span>Experiencia base ({groupConfig?.guestCount || 1} personas)</span>
              <span>${((eventSelection?.path === 'exclusiva' ? 65000 : 45000) * (groupConfig?.guestCount || 1)).toLocaleString()} CLP</span>
            </div>
            {selectedExtras.map((extra) => (
              <div key={extra.id} className="flex justify-between items-center mb-2">
                <span>{extra.name}</span>
                <span>${(extra.price * extra.quantity).toLocaleString()} CLP</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span className="text-purple-600">${calculateTotal().toLocaleString()} CLP</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium"
          >
            Proceder al Pago
          </button>
        </div>
      </div>
    )
  }

  const PaymentStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Confirma tu Reserva</h2>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Booking Summary */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Resumen de Reserva</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Experiencia:</span>
              <span>
                {eventSelection?.path === 'existing' && 'Experiencia Programada'}
                {eventSelection?.path === 'grupal' && 'Experiencia Grupal'}
                {eventSelection?.path === 'exclusiva' && 'Experiencia Exclusiva'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Participantes:</span>
              <span>{groupConfig?.guestCount || 1} personas</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Organizador:</span>
              <span>{groupConfig?.organizerName} {groupConfig?.organizerLastName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{groupConfig?.organizerEmail}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Teléfono:</span>
              <span>{groupConfig?.organizerPhone}</span>
            </div>

            {selectedExtras.length > 0 && (
              <div>
                <span className="font-medium">Extras seleccionados:</span>
                <ul className="ml-4 mt-1">
                  {selectedExtras.map((extra) => (
                    <li key={extra.id} className="text-gray-600">
                      • {extra.name} - ${extra.price.toLocaleString()} CLP
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total a Pagar</span>
            <span className="text-purple-600">${totalPrice.toLocaleString()} CLP</span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Método de Pago</h3>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" className="mr-3" defaultChecked />
              <span>Transferencia Bancaria</span>
            </label>
            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" className="mr-3" />
              <span>Tarjeta de Crédito/Débito</span>
            </label>
            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" className="mr-3" />
              <span>PayPal</span>
            </label>
          </div>
        </div>

        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  experienceType: eventSelection?.path,
                  guestCount: groupConfig?.guestCount,
                  organizerName: groupConfig?.organizerName,
                  organizerLastName: groupConfig?.organizerLastName,
                  organizerEmail: groupConfig?.organizerEmail,
                  organizerPhone: groupConfig?.organizerPhone,
                  organizerCountry: groupConfig?.organizerCountry,
                  specialRequests: groupConfig?.specialRequests,
                  selectedExtras: selectedExtras,
                  totalAmount: totalPrice
                })
              })
              
              const result = await response.json()
              
              if (result.success) {
                setBookingId(result.booking.id)
                alert(`¡Reserva confirmada! ID: ${result.booking.id}. Te contactaremos pronto con los detalles.`)
              } else {
                alert(`Error: ${result.error}`)
              }
            } catch (error) {
              console.error('Booking error:', error)
              alert('Error al crear la reserva. Por favor intenta de nuevo.')
            }
          }}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium"
        >
          Confirmar Reserva
        </button>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case BOOKING_STEPS.EVENT:
        return <EventStep />
      case BOOKING_STEPS.GROUP:
        return <GroupStep />
      case BOOKING_STEPS.EXTRAS:
        return <ExtrasStep />
      case BOOKING_STEPS.PAYMENT:
        return <PaymentStep />
      default:
        return <EventStep />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              Experiencia Laberinto
            </Link>
            <div className="flex items-center space-x-4">
              {session ? (
                <span className="text-sm text-gray-600">
                  Hola, {session.user.name}
                </span>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator />
        
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep > 1 && (
          <div className="flex justify-center">
            <button
              onClick={prevStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md font-medium"
            >
              Atrás
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 