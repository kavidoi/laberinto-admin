import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { TRPCProvider } from '@/lib/trpc/provider'

import { Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'wine',
    'wine tasting',
    'wine experiences',
    'Chilean wines',
    'ecommerce',
    'premium wines',
    'wine tours',
    'Laberinto',
  ],
  authors: [
    {
      name: 'Laberinto',
      url: siteConfig.url,
    },
  ],
  creator: 'Laberinto',
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@laberinto_wine',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: `/site.webmanifest`,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="es" 
      className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.variable,
        playfair.variable
      )}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </SessionProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
} 