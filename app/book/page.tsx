'use client'

import { useState, useEffect } from 'react'
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
interface Experience {
  id: string
  name: string
  type: string
  description: string
  duration: number
  maxParticipants: number
  basePrice: number
  location: {
    name: string
  }
  _count: {
    events: number
  }
}

interface Event {
  id: string
  title: string
  startTime: string
  endTime: string
  maxCapacity: number
  experience: Experience
  location: {
    name: string
  }
  _count: {
    bookings: number
  }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
}

interface EventSelection {
  path: 'existing' | 'grupal' | 'exclusiva'
  eventId?: string
  experienceId?: string
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

  // Data state
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Booking state
  const [eventSelection, setEventSelection] = useState<EventSelection | null>(null)
  const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(null)
  const [selectedExtras, setSelectedExtras] = useState<FoodExtra[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [bookingId, setBookingId] = useState<string | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [experiencesRes, eventsRes, productsRes] = await Promise.all([
          fetch('/api/experiences'),
          fetch('/api/events'),
          fetch('/api/products?category=food,transport')
        ])

        const [experiencesData, eventsData, productsData] = await Promise.all([
          experiencesRes.json(),
          eventsRes.json(),
          productsRes.json()
        ])

        setExperiences(experiencesData.experiences || [])
        setEvents(eventsData.events || [])
        setProducts(productsData.products || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  // Helper functions
  const getExperiencesByType = (type: string) => {
    return experiences.filter(exp => {
      if (type === 'grupal') return exp.type === 'Grupal'
      if (type === 'exclusiva') return exp.type === 'Privada'
      return true
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-CL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando experiencias...</p>
        </div>
      </div>
    )
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

  const EventStep = () => {
    const grupalExperiences = getExperiencesByType('grupal')
    const exclusiveExperiences = getExperiencesByType('exclusiva')
    const upcomingEvents = events.filter(event => new Date(event.startTime) > new Date())

    // If user has selected "existing" but hasn't picked a specific event yet
    if (eventSelection?.path === 'existing' && !eventSelection.eventId) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setEventSelection(null)}
              className="text-purple-600 hover:text-purple-800 mr-4"
            >
              ← Volver
            </button>
            <h2 className="text-3xl font-bold">Selecciona un Evento</h2>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No hay eventos programados disponibles en este momento.</p>
              <button
                onClick={() => setEventSelection({ path: 'grupal' })}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700"
              >
                Solicitar Experiencia Grupal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => {
                const { date, time } = formatDateTime(event.startTime)
                const availableSpots = event.maxCapacity - event._count.bookings
                
                return (
                  <div
                    key={event.id}
                    onClick={() => {
                      setEventSelection({
                        path: 'existing',
                        eventId: event.id,
                        experienceId: event.experience.id
                      })
                      nextStep()
                    }}
                    className="bg-white border-2 rounded-lg p-6 cursor-pointer hover:border-purple-500 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-xl text-purple-600 mb-2">{event.experience.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{event.experience.description}</p>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">📅 Fecha:</span>
                        <span className="font-medium">{date}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">🕐 Hora:</span>
                        <span className="font-medium">{time}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">📍 Ubicación:</span>
                        <span className="font-medium">{event.location.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">⏱️ Duración:</span>
                        <span className="font-medium">{event.experience.duration} minutos</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-2xl text-purple-600">
                          {formatPrice(event.experience.basePrice)}
                        </span>
                        <div className="text-right">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            availableSpots > 5 
                              ? 'bg-green-100 text-green-800' 
                              : availableSpots > 0 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {availableSpots > 0 ? `${availableSpots} cupos` : 'Agotado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // If user has selected "grupal" but hasn't picked a specific experience yet
    if (eventSelection?.path === 'grupal' && !eventSelection.experienceId) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setEventSelection(null)}
              className="text-purple-600 hover:text-purple-800 mr-4"
            >
              ← Volver
            </button>
            <h2 className="text-3xl font-bold">Experiencias Grupales</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {grupalExperiences.map((experience) => (
              <div
                key={experience.id}
                onClick={() => {
                  setEventSelection({
                    path: 'grupal',
                    experienceId: experience.id
                  })
                  nextStep()
                }}
                className="bg-white border-2 rounded-lg p-6 cursor-pointer hover:border-purple-500 transition-colors shadow-lg hover:shadow-xl"
              >
                <h3 className="font-bold text-xl text-purple-600 mb-3">{experience.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{experience.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">⏱️ Duración:</span>
                    <span className="font-medium">{experience.duration} minutos</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">📍 Ubicación:</span>
                    <span className="font-medium">{experience.location.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">👥 Máximo:</span>
                    <span className="font-medium">{experience.maxParticipants} personas</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <span className="font-bold text-2xl text-purple-600">
                    {formatPrice(experience.basePrice)}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">por persona</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // If user has selected "exclusiva" but hasn't picked a specific experience yet
    if (eventSelection?.path === 'exclusiva' && !eventSelection.experienceId) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setEventSelection(null)}
              className="text-purple-600 hover:text-purple-800 mr-4"
            >
              ← Volver
            </button>
            <h2 className="text-3xl font-bold">Experiencias Exclusivas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exclusiveExperiences.map((experience) => (
              <div
                key={experience.id}
                onClick={() => {
                  setEventSelection({
                    path: 'exclusiva',
                    experienceId: experience.id
                  })
                  nextStep()
                }}
                className="bg-white border-2 rounded-lg p-6 cursor-pointer hover:border-purple-500 transition-colors shadow-lg hover:shadow-xl"
              >
                <h3 className="font-bold text-xl text-purple-600 mb-3">{experience.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{experience.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">⏱️ Duración:</span>
                    <span className="font-medium">{experience.duration} minutos</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">📍 Ubicación:</span>
                    <span className="font-medium">{experience.location.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">🎯 Tipo:</span>
                    <span className="font-medium">Experiencia Privada</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <span className="font-bold text-2xl text-purple-600">
                    {formatPrice(experience.basePrice)}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">por persona</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Default view: Show the three main options
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Selecciona tu Experiencia</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Existing Events Option */}
          <div
            onClick={() => {
              setEventSelection({ path: 'existing' })
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
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block mb-2">
                {upcomingEvents.length} eventos disponibles
              </div>
              {grupalExperiences.length > 0 && (
                <p className="text-sm text-gray-500">
                  Desde {formatPrice(Math.min(...grupalExperiences.map(e => e.basePrice)))}
                </p>
              )}
            </div>
          </div>

          {/* Group Request Option */}
          <div
            onClick={() => {
              setEventSelection({ path: 'grupal' })
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
              {grupalExperiences.length > 0 && (
                <p className="text-sm text-gray-500 mt-6">
                  Desde {formatPrice(Math.min(...grupalExperiences.map(e => e.basePrice)))}
                </p>
              )}
            </div>
          </div>

          {/* Exclusive Experience Option */}
          <div
            onClick={() => {
              setEventSelection({ path: 'exclusiva' })
            }}
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 hover:border-purple-500"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Experiencia Exclusiva</h3>
              <p className="text-gray-600 mb-4">
                Te invitamos a una experiencia hecha a tu medida y la de tu grupo. Vivirán un momento único.
              </p>
              {exclusiveExperiences.length > 0 && (
                <p className="text-sm text-gray-500 mt-6">
                  Desde {formatPrice(Math.min(...exclusiveExperiences.map(e => e.basePrice)))}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

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
    // Convert products to FoodExtra format for compatibility
    const availableExtras: FoodExtra[] = products
      .filter(product => product.category !== 'wine') // Exclude wine products
      .map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        quantity: 1,
      }))

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
      let basePrice = 0
      
      if (eventSelection?.experienceId) {
        // Use the actual experience price
        const selectedExperience = experiences.find(exp => exp.id === eventSelection.experienceId)
        if (selectedExperience) {
          basePrice = selectedExperience.basePrice * (groupConfig?.guestCount || 1)
        }
      } else if (eventSelection?.eventId) {
        // Use the event's experience price
        const selectedEvent = events.find(event => event.id === eventSelection.eventId)
        if (selectedEvent) {
          basePrice = selectedEvent.experience.basePrice * (groupConfig?.guestCount || 1)
        }
      } else {
        // Fallback to default pricing
        basePrice = (eventSelection?.path === 'exclusiva' ? 65000 : 45000) * (groupConfig?.guestCount || 1)
      }
      
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
                      {formatPrice(extra.price)}
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
              <span>{formatPrice(calculateTotal() - selectedExtras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0))}</span>
            </div>
            {selectedExtras.map((extra) => (
              <div key={extra.id} className="flex justify-between items-center mb-2">
                <span>{extra.name}</span>
                <span>{formatPrice(extra.price * extra.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span className="text-purple-600">{formatPrice(calculateTotal())}</span>
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
                      • {extra.name} - {formatPrice(extra.price)}
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
            <span className="text-purple-600">{formatPrice(totalPrice)}</span>
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
              const bookingData = {
                experienceType: eventSelection?.path,
                eventId: eventSelection?.eventId,
                experienceId: eventSelection?.experienceId,
                guestCount: groupConfig?.guestCount,
                organizerName: groupConfig?.organizerName,
                organizerLastName: groupConfig?.organizerLastName,
                organizerEmail: groupConfig?.organizerEmail,
                organizerPhone: groupConfig?.organizerPhone,
                organizerCountry: groupConfig?.organizerCountry,
                specialRequests: groupConfig?.specialRequests,
                selectedExtras: selectedExtras,
                totalAmount: totalPrice,
                isSingleAttendeeAdult: groupConfig?.isSingleAttendeeAdult,
                areAllAdultDrinkers: groupConfig?.areAllAdultDrinkers,
                nonDrinkersCount: groupConfig?.nonDrinkersCount || 0
              }

              console.log('Sending booking data:', bookingData)

              const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
              })
              
              const result = await response.json()
              console.log('Booking response:', result)
              
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