import { Wine, Calendar, Users, ShoppingCart, Grape, Award, MapPin, Star, ArrowRight } from "lucide-react"
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Wine className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            Laberinto
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Discover exceptional wines and unforgettable experiences in the heart of Maipo Valley
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Reservar Experiencia
              <Calendar className="h-5 w-5" />
            </Link>
            <Link
              href="/wines"
              className="bg-white hover:bg-slate-50 text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Ver Vinos
              <Grape className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            What Makes Us Special
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Premium Quality</h3>
              <p className="text-slate-600">
                Award-winning wines crafted with passion and precision in our Maipo Valley vineyard.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Perfect Location</h3>
              <p className="text-slate-600">
                Nestled in the prestigious Maipo Valley with stunning views of the Andes Mountains.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Unique Experiences</h3>
              <p className="text-slate-600">
                From intimate tastings to exclusive vineyard tours, create memories that last a lifetime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Wine Experiences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="bg-purple-100 rounded-xl p-8 text-center hover:bg-purple-200 transition-colors duration-300">
                <div className="text-4xl mb-4">🍷</div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">Group Tastings</h3>
                <p className="text-slate-600 mb-4">
                  Join our scheduled group experiences every weekend. Perfect for wine enthusiasts looking to share the experience.
                </p>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block">
                  From $45,000 CLP
                </div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-blue-100 rounded-xl p-8 text-center hover:bg-blue-200 transition-colors duration-300">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">Private Groups</h3>
                <p className="text-slate-600 mb-4">
                  Book a custom date for your group. Minimum 10 days advance notice required for special arrangements.
                </p>
                <div className="text-slate-600 px-3 py-1 rounded-full text-sm">
                  Custom pricing
                </div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-gold-100 rounded-xl p-8 text-center hover:bg-yellow-200 transition-colors duration-300">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">Exclusive Experiences</h3>
                <p className="text-slate-600 mb-4">
                  Completely personalized experiences tailored to your group. Flexible scheduling and custom activities.
                </p>
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm inline-block">
                  From $65,000 CLP
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Start Booking Process
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">
            Modern Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium text-slate-800">Next.js 14</div>
              <div className="text-sm text-slate-600">React Framework</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="text-2xl mb-2">🗄️</div>
              <div className="font-medium text-slate-800">PostgreSQL</div>
              <div className="text-sm text-slate-600">Database</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-medium text-slate-800">NextAuth.js</div>
              <div className="text-sm text-slate-600">Authentication</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-medium text-slate-800">tRPC</div>
              <div className="text-sm text-slate-600">Type-safe APIs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Wine className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Laberinto Winery</h3>
          <p className="text-slate-400 mb-6">
            Crafting exceptional wines in Chile's Maipo Valley since 2020
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/wines" className="text-purple-400 hover:text-purple-300 transition-colors">
              Wine Collection
            </Link>
            <Link href="/book" className="text-purple-400 hover:text-purple-300 transition-colors">
              Book Experience
            </Link>
            <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 