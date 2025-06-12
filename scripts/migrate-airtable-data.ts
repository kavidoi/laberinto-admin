/**
 * Migration script to import Airtable data into PostgreSQL database
 * Usage: npm run migrate:airtable
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Path to exported Airtable data
const AIRTABLE_EXPORT_PATH = path.join(__dirname, '..', '..', 'laberinto-booking', 'airtable-export')

interface AirtableRecord {
  id: string
  fields: Record<string, any>
  createdTime: string
}

interface AirtableTable {
  tableName: string
  recordCount: number
  records: AirtableRecord[]
  exportedAt: string
}

/**
 * Load Airtable table data
 */
function loadAirtableTable(tableName: string): AirtableRecord[] {
  try {
    const fileName = `${tableName.replace(/[^a-zA-Z0-9]/g, '_')}.json`
    const filePath = path.join(AIRTABLE_EXPORT_PATH, fileName)
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fileName}`)
      return []
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as AirtableTable
    console.log(`📊 Loaded ${data.recordCount} records from ${tableName}`)
    return data.records
  } catch (error) {
    console.error(`❌ Error loading ${tableName}:`, error)
    return []
  }
}

/**
 * Migrate Contactos (Customers) to Users table
 */
async function migrateContactos() {
  console.log('\n👥 Migrating Contactos to Users...')
  const contactos = loadAirtableTable('Contactos')
  
  const migrations = []
  
  for (const contacto of contactos) {
    const fields = contacto.fields
    
         const userData = {
       email: fields['Correo Electrónico'] || `airtable_${contacto.id}@temp.com`,
       name: fields['Nombre Completo'] || `${fields['Nombre'] || ''} ${fields['Apellido'] || ''}`.trim(),
       firstName: fields['Nombre'] || null,
       lastName: fields['Apellido'] || null,
       phone: fields['Número de Teléfono'] || null,
       rut: fields['RUT'] || null,
       role: 'CUSTOMER' as const
     }

    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData
      })
      migrations.push(user.id)
    } catch (error) {
      console.error(`Error migrating contacto ${contacto.id}:`, error)
    }
  }

  console.log(`✅ Migrated ${migrations.length} customers`)
  return migrations
}

/**
 * Migrate Vinos to Wines table
 */
async function migrateVinos() {
  console.log('\n🍷 Migrating Vinos to Wines...')
  const vinos = loadAirtableTable('Vinos')
  
     // First ensure we have regions and categories
   const defaultRegion = await prisma.wineRegion.upsert({
     where: { name: 'Chile - General' },
     update: {},
     create: {
       name: 'Chile - General',
       country: 'Chile'
     }
   })

  const defaultCategory = await prisma.wineCategory.upsert({
    where: { slug: 'vino-tinto' },
    update: {},
    create: {
      name: 'Vino Tinto',
      slug: 'vino-tinto'
    }
  })

  const migrations = []
  
  for (const vino of vinos) {
    const fields = vino.fields
    
         const wineName = fields['Vinos'] || 'Vino Sin Nombre'
     const wineData = {
       name: wineName,
       code: fields['Código'] || vino.id,
       slug: wineName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
       categoryId: defaultCategory.id,
       regionId: defaultRegion.id,
       producer: fields['Productor'] || 'Laberinto',
       basePrice: parseFloat(fields['Precio']) || 0,
       description: fields['Características Generales'] || null,
       tastingNotes: fields['Resumen de Características'] || null,
       pairingNotes: fields['Recomendación de Maridaje'] || null,
       barcode: fields['Barcode'] || null,
       isActive: true
     }

    try {
      const wine = await prisma.wine.upsert({
        where: { code: wineData.code },
        update: wineData,
        create: wineData
      })
      migrations.push(wine.id)
    } catch (error) {
      console.error(`Error migrating vino ${vino.id}:`, error)
    }
  }

  console.log(`✅ Migrated ${migrations.length} wines`)
  return migrations
}

/**
 * Migrate Experiencias to Experiences table
 */
async function migrateExperiencias() {
  console.log('\n✨ Migrating Experiencias to Experiences...')
  const experiencias = loadAirtableTable('Experiencias')
  
  // Get default location
  let defaultLocation = await prisma.location.findFirst()
  if (!defaultLocation) {
         defaultLocation = await prisma.location.create({
       data: {
         name: 'Laberinto Vineyard',
         type: 'VINEYARD',
         address: 'Valle de Uco, Mendoza',
         city: 'Tunuyán',
         country: 'Argentina',
         isActive: true
       }
     })
  }

  const migrations = []
  
  for (const experiencia of experiencias) {
    const fields = experiencia.fields
    
    const expData = {
      name: fields['Experiencia'] || 'Experiencia Sin Nombre',
      slug: (fields['Experiencia'] || 'experiencia').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      type: fields['Modalidad'] === 'Privada' ? 'PRIVATE_TASTING' : 'GROUP_TASTING' as any,
      description: fields['Descripción'] || null,
      duration: parseInt(fields['Duración en minutos']) || 90,
      maxParticipants: parseInt(fields['Máximo de participantes']) || 12,
      basePrice: parseFloat(fields['Precio base']) || 50000,
      locationId: defaultLocation.id,
      isActive: true,
      metadata: {
        airtableId: experiencia.id,
        modalidad: fields['Modalidad'],
        includes: fields['Incluye'],
        restrictions: fields['Restricciones']
      }
    }

    try {
      const experience = await prisma.experience.upsert({
        where: { slug: expData.slug },
        update: expData,
        create: expData
      })
      migrations.push(experience.id)
    } catch (error) {
      console.error(`Error migrating experiencia ${experiencia.id}:`, error)
    }
  }

  console.log(`✅ Migrated ${migrations.length} experiences`)
  return migrations
}

/**
 * Migrate Eventos to Events table
 */
async function migrateEventos() {
  console.log('\n📅 Migrating Eventos to Events...')
  const eventos = loadAirtableTable('Eventos')
  
  // Get first experience and location
  const experience = await prisma.experience.findFirst()
  const location = await prisma.location.findFirst()
  
  if (!experience || !location) {
    console.log('⚠️  Skipping events migration - need experiences and locations first')
    return []
  }

  const migrations = []
  
  for (const evento of eventos) {
    const fields = evento.fields
    
    const startTime = fields['Fecha y hora de inicio'] ? new Date(fields['Fecha y hora de inicio']) : new Date()
    const endTime = fields['Fecha Hora término'] ? new Date(fields['Fecha Hora término']) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
    
    const eventData = {
      experienceId: experience.id,
      locationId: location.id,
      startTime,
      endTime,
      maxParticipants: parseInt(fields['Máximo de participantes']) || 12,
      status: fields['Estado'] === 'Cancelado' ? 'CANCELLED' : 'SCHEDULED' as any,
      metadata: {
        airtableId: evento.id,
        experienceName: fields['Nombre de Experiencia'],
        activities: fields['Actividades Seleccionadas'],
        badge: fields['Badge'],
        notes: fields['Notas Internas']
      }
    }

    try {
      const event = await prisma.event.create({
        data: eventData
      })
      migrations.push(event.id)
    } catch (error) {
      console.error(`Error migrating evento ${evento.id}:`, error)
    }
  }

  console.log(`✅ Migrated ${migrations.length} events`)
  return migrations
}

/**
 * Migrate Reservas to Bookings table
 */
async function migrateReservas() {
  console.log('\n📋 Migrating Reservas to Bookings...')
  const reservas = loadAirtableTable('Reservas')
  
  const migrations = []
  
  for (const reserva of reservas) {
    const fields = reserva.fields
    
    // Find organizer user
    const organizerEmail = fields['Correo Lider (from Grupo)']
    let organizer = null
    if (organizerEmail) {
      organizer = await prisma.user.findUnique({ where: { email: organizerEmail } })
    }
    
    // Find event
    const event = await prisma.event.findFirst()
    if (!event || !organizer) continue

    const totalAmount = parseFloat(fields['Total a pagar grupo final']) || parseFloat(fields['Precio Total Hipotético']) || 0
    const paidAmount = parseFloat(fields['Pagado Total']) || 0
    
    let status = 'PENDING'
    if (fields['Estado']?.includes('realizada')) status = 'COMPLETED'
    else if (fields['Estado']?.includes('abandonada')) status = 'CANCELLED'
    else if (paidAmount >= totalAmount) status = 'PAID'
    else if (paidAmount > 0) status = 'PARTIALLY_PAID'

    const bookingData = {
      organizerId: organizer.id,
      eventId: event.id,
      totalParticipants: parseInt(fields['Tamaño Grupo (from Grupo)']) || 2,
      adultsCount: parseInt(fields['Bebedores']) || 2,
      childrenCount: parseInt(fields['Niños menores de 12 (Reserva)']) || 0,
      nonDrinkersCount: parseInt(fields['No Beben mayores de 12']) || 0,
      subtotal: totalAmount,
      totalAmount: totalAmount,
      status: status as any,
      specialRequests: fields['Notas Especiales'],
      notes: fields['Observaciones'],
      metadata: {
        airtableId: reserva.id,
        reservaId: fields['Reserva ID'],
        progreso: fields['Progreso'],
        descuentos: fields['Total Descuentos'],
        abono: fields['Abono']
      }
    }

    try {
      const booking = await prisma.booking.create({
        data: bookingData
      })
      migrations.push(booking.id)
    } catch (error) {
      console.error(`Error migrating reserva ${reserva.id}:`, error)
    }
  }

  console.log(`✅ Migrated ${migrations.length} bookings`)
  return migrations
}

/**
 * Main migration function
 */
async function migrateAirtableData() {
  console.log('🚀 Starting Airtable to PostgreSQL migration...')
  
  try {
    // Check if Airtable export exists
    if (!fs.existsSync(AIRTABLE_EXPORT_PATH)) {
      console.error('❌ Airtable export not found. Please run export first:')
      console.log('cd laberinto-booking && npm run export:airtable')
      process.exit(1)
    }

    // Run migrations in order (due to dependencies)
    const results = {
      customers: await migrateContactos(),
      wines: await migrateVinos(), 
      experiences: await migrateExperiencias(),
      events: await migrateEventos(),
      bookings: await migrateReservas()
    }

    console.log('\n🎉 Migration completed!')
    console.log('📊 Summary:')
    console.log(`   👥 Customers: ${results.customers.length}`)
    console.log(`   🍷 Wines: ${results.wines.length}`)
    console.log(`   ✨ Experiences: ${results.experiences.length}`)
    console.log(`   📅 Events: ${results.events.length}`)
    console.log(`   📋 Bookings: ${results.bookings.length}`)
    
    return results

  } catch (error) {
    console.error('💥 Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateAirtableData()
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

export { migrateAirtableData } 