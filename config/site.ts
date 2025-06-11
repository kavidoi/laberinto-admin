export const siteConfig = {
  name: 'Laberinto',
  description: 'Experiencias premium de vinos y tienda online especializada en vinos chilenos de alta calidad.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://laberinto.com',
  ogImage: '/images/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/laberinto_wine',
    github: 'https://github.com/laberinto',
    instagram: 'https://instagram.com/laberinto_wine',
    facebook: 'https://facebook.com/laberinto.wine',
  },
  keywords: [
    'vinos chilenos',
    'wine tasting',
    'experiencias de vino',
    'ecommerce vinos',
    'cata de vinos',
    'vinos premium',
    'Chile wines',
    'wine tours',
    'maridajes',
    'viticultura',
  ],
  authors: [
    {
      name: 'Laberinto Team',
      url: 'https://laberinto.com',
    },
  ],
  creator: 'Laberinto',
  manifest: '/site.webmanifest',
}

export type SiteConfig = typeof siteConfig 