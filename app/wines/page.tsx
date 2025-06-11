'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'

export default function WinesPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  
  // Fetch wines with search and filters
  const { data: winesData, isLoading: winesLoading } = trpc.wines.getAll.useQuery({
    limit: 12,
    offset: 0,
    search: search || undefined,
    categoryId: categoryId || undefined,
  })

  // Fetch categories for filter
  const { data: categories } = trpc.wines.getCategories.useQuery()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Wine Collection</h1>
            <div className="flex items-center space-x-4">
              {session ? (
                <span className="text-sm text-gray-600">
                  Welcome, {session.user.name}
                </span>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search wines..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category._count.wines})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Wine Grid */}
        {winesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading wines...</p>
          </div>
        ) : winesData?.wines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No wines found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {winesData?.wines.map((wine) => (
              <div
                key={wine.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {wine.images.length > 0 ? (
                  <img
                    src={wine.images[0]}
                    alt={wine.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {wine.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{wine.producer}</p>
                  <p className="text-purple-600 font-bold text-lg">
                    ${wine.basePrice.toLocaleString()} CLP
                  </p>
                  {wine.category && (
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-2">
                      {wine.category.name}
                    </span>
                  )}
                  {wine.isFeatured && (
                    <span className="inline-block bg-gold-100 text-gold-800 text-xs px-2 py-1 rounded-full mt-2 ml-2">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination info */}
        {winesData && (
          <div className="mt-8 text-center text-gray-600">
            Showing {winesData.wines.length} of {winesData.total} wines
          </div>
        )}
      </div>
    </div>
  )
} 