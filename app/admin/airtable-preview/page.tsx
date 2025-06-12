import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import * as fs from 'fs';
import * as path from 'path';

export const metadata: Metadata = {
  title: 'Vista Previa de Datos Airtable - Admin',
  description: 'Vista previa completa de los datos exportados desde Airtable',
}

// This function runs on the server and reads the actual Airtable export files
async function getAirtableData() {
  const airtableBasePath = path.join(process.cwd(), '..', 'laberinto-booking', 'airtable-export');
  
  try {
    // Read export summary
    const summaryPath = path.join(airtableBasePath, 'export-summary.json');
    const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    
    // Read sample data from key tables
    const contactosPath = path.join(airtableBasePath, 'Contactos.json');
    const experienciasPath = path.join(airtableBasePath, 'Experiencias.json');
    const reservasPath = path.join(airtableBasePath, 'Reservas.json');
    const vinosPath = path.join(airtableBasePath, 'Vinos.json');
    
    const contactos = JSON.parse(fs.readFileSync(contactosPath, 'utf8'));
    const experiencias = JSON.parse(fs.readFileSync(experienciasPath, 'utf8'));
    const reservas = JSON.parse(fs.readFileSync(reservasPath, 'utf8'));
    const vinos = JSON.parse(fs.readFileSync(vinosPath, 'utf8'));
    
    return {
      summary: summaryData,
      contactos: contactos.records.slice(0, 10), // Show first 10 records
      experiencias: experiencias.records,
      reservas: reservas.records.slice(0, 10),
      vinos: vinos.records.slice(0, 10)
    };
  } catch (error) {
    console.error('Error reading Airtable data:', error);
    return null;
  }
}

function TableSummary({ summary }: { summary: any }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Resumen de Exportación</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{summary.totals.totalRecords}</div>
          <div className="text-sm text-gray-600">Total Registros</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{summary.totals.successfulTables}</div>
          <div className="text-sm text-gray-600">Tablas Exportadas</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">{summary.totals.failedTables}</div>
          <div className="text-sm text-gray-600">Tablas con Error</div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tabla</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registros</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summary.tables.map((table: any, index: number) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {table.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {table.recordCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    table.hasError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {table.hasError ? 'Error' : 'Exitoso'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExperienciasPreview({ experiencias }: { experiencias: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">✨ Experiencias ({experiencias.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experiencias.map((exp: any) => (
          <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">{exp.fields['Experiencia']}</h4>
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Modalidad:</strong> {exp.fields['Modalidad']}</p>
              <p><strong>Precio:</strong> ${exp.fields['Precio']?.toLocaleString()} CLP</p>
              <p><strong>Duración:</strong> {exp.fields['Duración en minutos']} minutos</p>
            </div>
            {exp.fields['Descripción'] && (
              <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                {exp.fields['Descripción']}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactosPreview({ contactos }: { contactos: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Contactos (primeros 10 de {contactos.length})</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contactos.map((contacto: any) => (
              <tr key={contacto.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {contacto.fields['Nombre Completo'] || `${contacto.fields['Nombre']} ${contacto.fields['Apellido']}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contacto.fields['Correo Electrónico']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contacto.fields['Número de Teléfono']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contacto.fields['RUT']}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VinosPreview({ vinos }: { vinos: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">🍷 Vinos (primeros 10)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vinos.map((vino: any) => (
          <div key={vino.id} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">{vino.fields['Vinos']}</h4>
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Código:</strong> {vino.fields['Código']}</p>
              <p><strong>Precio:</strong> ${vino.fields['Precio']?.toLocaleString()} CLP</p>
              <p><strong>Productor:</strong> {vino.fields['Productor']}</p>
            </div>
            {vino.fields['Características Generales'] && (
              <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                {vino.fields['Características Generales']}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MigrationActions() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Acciones de Migración</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          📊 Validar Datos
        </button>
        <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          🔄 Ejecutar Migración
        </button>
        <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          ✅ Verificar Resultados
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Importante:</strong> La migración importará todos los datos a PostgreSQL manteniendo las relaciones 
          entre tablas. Esto incluye contactos → usuarios, experiencias → productos, reservas → bookings, etc.
        </p>
      </div>
    </div>
  );
}

export default async function AirtablePreviewPage() {
  const data = await getAirtableData();
  
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vista Previa de Datos Airtable</h1>
            <p className="text-gray-600">Los datos de Airtable no están disponibles</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            ← Volver al Dashboard
          </Link>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No se pudieron cargar los datos exportados desde Airtable. Verifica que los archivos JSON estén 
            disponibles en la carpeta laberinto-booking/airtable-export/.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vista Previa de Datos Airtable</h1>
          <p className="text-gray-600">Revisión completa de los datos exportados listos para migrar</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
          ← Volver al Dashboard
        </Link>
      </div>

      <Suspense fallback={<div>Cargando datos...</div>}>
        <TableSummary summary={data.summary} />
        <ExperienciasPreview experiencias={data.experiencias} />
        <ContactosPreview contactos={data.contactos} />
        <VinosPreview vinos={data.vinos} />
        <MigrationActions />
      </Suspense>
    </div>
  );
} 