const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Utility function to create slugs
function createSlug(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function importAirtableData() {
  console.log('🚀 Starting Airtable data import...');
  
  const airtableBasePath = path.join(__dirname, '../../laberinto-booking/airtable-export');
  
  try {
    // 1. Clear existing data
    console.log('🧹 Clearing old data...');
    await prisma.wineSaleItem.deleteMany({});
    await prisma.wineSale.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.experience.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.wine.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('  ✓ Old data cleared.');
    
    // 2. Import Users/Customers
    console.log('👥 Importing Users/Customers...');
    const contactData = JSON.parse(fs.readFileSync(path.join(airtableBasePath, 'Contactos.json'), 'utf8'));
    for (const record of contactData.records) {
      if (record.fields['Correo Electrónico']) {
        await prisma.user.upsert({
          where: { email: record.fields['Correo Electrónico'] },
          update: {
            airtableId: record.id,
            name: record.fields['Nombre Completo'] || record.fields.Nombre || record.fields['Correo Electrónico'],
            phone: record.fields['Número de Teléfono'] || null,
          },
          create: {
            airtableId: record.id,
            email: record.fields['Correo Electrónico'],
            name: record.fields['Nombre Completo'] || record.fields.Nombre || record.fields['Correo Electrónico'],
            phone: record.fields['Número de Teléfono'] || null,
          }
        });
      } else if (record.fields['Nombre Completo']) {
        // Handle customers without email (create with dummy email)
        const dummyEmail = `${record.id}@laberinto-temp.com`;
        await prisma.user.upsert({
          where: { email: dummyEmail },
          update: {
            airtableId: record.id,
            name: record.fields['Nombre Completo'],
            phone: record.fields['Número de Teléfono'] || null,
          },
          create: {
            airtableId: record.id,
            email: dummyEmail,
            name: record.fields['Nombre Completo'],
            phone: record.fields['Número de Teléfono'] || null,
          }
        });
      }
    }
    console.log(`  ✓ Imported and updated ${contactData.records.length} customers.`);
    
    // 3. Import Wines
    console.log('🍷 Importing Wines...');
    const wineData = JSON.parse(fs.readFileSync(path.join(airtableBasePath, 'Vinos.json'), 'utf8'));
    const defaultCategory = await prisma.wineCategory.findFirst();
    const defaultRegion = await prisma.wineRegion.findFirst();
    
    for (const record of wineData.records) {
      if (record.fields.Vinos) {
        await prisma.wine.create({
          data: {
            airtableId: record.id,
            name: record.fields.Vinos,
            code: record.fields.Código || `WINE-${record.id}`,
            slug: createSlug(record.fields.Vinos),
            producer: 'Laberinto',
            basePrice: parseFloat(record.fields.Precio || '0'),
            description: record.fields['Notas de Cata'] || record.fields.Descripción || null,
            isActive: true,
            categoryId: defaultCategory.id,
            regionId: defaultRegion.id,
          }
        });
      }
    }
    console.log(`  ✓ Imported ${wineData.records.length} wines.`);
    
    // 4. Import Locations
    console.log('📍 Importing Locations...');
    const locationData = JSON.parse(fs.readFileSync(path.join(airtableBasePath, 'Locaciones.json'), 'utf8'));
    for (const record of locationData.records) {
      if (record.fields['Location Name']) {
        await prisma.location.create({
          data: {
            airtableId: record.id,
            name: record.fields['Location Name'],
            type: record.fields.Type || 'Unknown',
            address: record.fields.Address || null,
            city: record.fields.City || null,
            country: record.fields.Country || 'Chile'
          }
        });
      }
    }
    console.log(`  ✓ Imported ${locationData.records.length} locations.`);
    
    // 5. Import Experiences
    console.log('✨ Importing Experiences...');
    const experienceData = JSON.parse(fs.readFileSync(path.join(airtableBasePath, 'Experiencias.json'), 'utf8'));
    const defaultLocation = await prisma.location.findFirst();
    
    for (const record of experienceData.records) {
      if (record.fields.Experiencia) {
        await prisma.experience.create({
          data: {
            airtableId: record.id,
            name: record.fields.Experiencia,
            slug: createSlug(record.fields.Experiencia),
            type: record.fields.Modalidad || 'WINE_TASTING',
            description: record.fields.Descripción || record.fields['Descripción larga'] || '',
            duration: parseInt(record.fields['Duración en minutos']) || 120,
            maxParticipants: 15, // Default based on typical group sizes
            basePrice: parseFloat(record.fields.Precio || '0'),
            locationId: defaultLocation.id,
            isActive: true,
          }
        });
      }
    }
    console.log(`  ✓ Imported ${experienceData.records.length} experiences.`);

    // 6. Import Events
    console.log('📅 Importing Events...');
    const eventData = JSON.parse(fs.readFileSync(path.join(airtableBasePath, 'Eventos.json'), 'utf8'));
    
    for (const record of eventData.records) {
      if (record.fields.Evento && record.fields['Fecha y hora de inicio']) {
        const experienceAirtableId = record.fields.Experiencia?.[0];
        const experience = experienceAirtableId 
          ? await prisma.experience.findUnique({ where: { airtableId: experienceAirtableId } })
          : await prisma.experience.findFirst();
        
        if (experience) {
          const startTime = new Date(record.fields['Fecha y hora de inicio']);
          const endTime = record.fields['Fecha y Hora término'] 
            ? new Date(record.fields['Fecha y Hora término'])
            : new Date(startTime.getTime() + (experience.duration * 60 * 1000));

          await prisma.event.create({
            data: {
              airtableId: record.id,
              title: record.fields.Evento,
              experienceId: experience.id,
              locationId: experience.locationId,
              startTime: startTime,
              endTime: endTime,
              maxCapacity: parseInt(record.fields.Asistentes) || experience.maxParticipants,
              status: record.fields['Estado Evento'] === 'pasado' ? 'COMPLETED' : 'SCHEDULED',
              priceOverride: record.fields.Precio?.[0] ? parseFloat(record.fields.Precio[0]) : null,
            }
          });
        }
      }
    }
    console.log(`  ✓ Imported ${eventData.records.length} events.`);

    // 7. Import Products/Extras
    console.log('🛍️ Importing Products/Extras...');
    const productData = JSON.parse(fs.readFileSync(path.join(airtableBasePath, 'Productos.json'), 'utf8'));
    
    for (const record of productData.records) {
      if (record.fields.Name && record.fields['Precio (from Vino)']?.[0]) {
        await prisma.product.create({
          data: {
            airtableId: record.id,
            name: record.fields['Nombre Vino'] || record.fields.Name,
            description: `Wine product: ${record.fields.Name}`,
            price: parseFloat(record.fields['Precio (from Vino)'][0]),
            category: 'wine',
            isActive: true,
          }
        });
      }
    }
    
    // Add some standard extras that are commonly offered
    const standardExtras = [
      {
        name: 'Almuerzo Premium',
        description: 'Almuerzo de 3 tiempos maridado con nuestros vinos',
        price: 35000,
        category: 'food'
      },
      {
        name: 'Tabla de Quesos',
        description: 'Selección de quesos artesanales chilenos',
        price: 15000,
        category: 'food'
      },
      {
        name: 'Transporte desde Santiago',
        description: 'Transporte ida y vuelta desde Santiago',
        price: 25000,
        category: 'transport'
      },
      {
        name: 'Humitas y Empanaditas',
        description: 'Comida local tradicional chilena',
        price: 12000,
        category: 'food'
      }
    ];

    for (const extra of standardExtras) {
      await prisma.product.create({
        data: {
          airtableId: `standard-${createSlug(extra.name)}`,
          name: extra.name,
          description: extra.description,
          price: extra.price,
          category: extra.category,
          isActive: true,
        }
      });
    }
    
    console.log(`  ✓ Imported ${productData.records.length} wine products and ${standardExtras.length} standard extras.`);

    // 8. Import Wine Sales and Sale Items
    console.log('🛒 Importing Wine Sales...');
    const salesData = JSON.parse(fs.readFileSync(path.join(airtableBasePath, 'Venta_de_Vinos.json'), 'utf8'));
    
    for (const record of salesData.records) {
      const customerAirtableId = record.fields.Cliente?.[0];
      if (!customerAirtableId) {
        console.warn(`  - Skipping sale ${record.fields['Número de Venta'] || record.id} due to missing customer.`);
        continue;
      }

      const customer = await prisma.user.findUnique({ where: { airtableId: customerAirtableId } });
      if (!customer) {
        console.warn(`  - Skipping sale ${record.fields['Número de Venta'] || record.id}, customer with Airtable ID ${customerAirtableId} not found.`);
        continue;
      }

      // Parse the sale date correctly
      let saleDate;
      if (record.fields['Fecha de Venta']) {
        saleDate = new Date(record.fields['Fecha de Venta']);
      } else {
        saleDate = new Date(record.createdTime);
      }

      const sale = await prisma.wineSale.create({
        data: {
          airtableId: record.id,
          customerId: customer.id,
          totalAmount: parseFloat(record.fields['Total de la Venta'] || '0'),
          saleDate: saleDate,
          status: 'COMPLETED',
          notes: record.fields['Número de Venta'] || null,
        }
      });

      // Import sale items
      const wineAirtableIds = record.fields.Vinos;
      if (wineAirtableIds && wineAirtableIds.length > 0) {
        for (const wineAirtableId of wineAirtableIds) {
          const wine = await prisma.wine.findUnique({ where: { airtableId: wineAirtableId } });
          if (wine) {
            await prisma.wineSaleItem.create({
              data: {
                airtableId: `${record.id}-${wine.id}`,
                saleId: sale.id,
                wineId: wine.id,
                quantity: 1, // Default quantity since Airtable doesn't specify individual quantities
                unitPrice: wine.basePrice,
                totalPrice: wine.basePrice
              }
            });
          } else {
            console.warn(`  - Could not find wine with Airtable ID ${wineAirtableId} for sale ${sale.id}`);
          }
        }
      }

      console.log(`  ✓ Created sale: ${record.fields['Número de Venta']} - ${customer.name} - $${record.fields['Total de la Venta']} - ${saleDate.toDateString()}`);
    }
    console.log(`  ✓ Imported ${salesData.records.length} wine sales.`);
    
    console.log('\n🎉 Airtable import completed successfully!');

  } catch (error) {
    console.error('❌ An error occurred during the import process:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importAirtableData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 