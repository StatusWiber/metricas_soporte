import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed interaction types with expected MTTR from reference sheet
  const tiposInteraccion = [
    { nombre: 'CONSULTAS ADICIONALES', promedio_minutos: 3.73 },
    { nombre: 'TV', promedio_minutos: 4.35 },
    { nombre: 'SIN INTERNET', promedio_minutos: 3.83 },
    { nombre: 'INTERMITENCIAS / LENTITUD', promedio_minutos: 5.22 },
    { nombre: 'DERIVACIÓN DE CHAT', promedio_minutos: 0.67 },
  ];

  for (const tipo of tiposInteraccion) {
    await prisma.tipoInteraccion.upsert({
      where: { nombre: tipo.nombre },
      update: { promedio_minutos: tipo.promedio_minutos },
      create: tipo,
    });
  }
  console.log(`✓ ${tiposInteraccion.length} interaction types seeded`);

  // Seed operators
  const operadores = [
    { id: 'OPE-CRISTIAN', nombre: 'CRISTIAN' },
    { id: 'OPE-ROCIO', nombre: 'ROCIO' },
    { id: 'OPE-NICOLAS', nombre: 'NICOLÁS' },
    { id: 'OPE-GUSTAVO', nombre: 'GUSTAVO' },
    { id: 'OPE-FEDE', nombre: 'FEDE' },
  ];

  for (const op of operadores) {
    await prisma.operador.upsert({
      where: { id: op.id },
      update: { nombre: op.nombre },
      create: op,
    });
  }
  console.log(`✓ ${operadores.length} operators seeded`);

  // Seed reference times (mirrors TipoInteraccion averages as initial dataset)
  const tipos = await prisma.tipoInteraccion.findMany();
  for (const tipo of tipos) {
    await prisma.referenciaTiempos.upsert({
      where: { id: `ref-${tipo.id}` },
      update: { promedio_minutos: tipo.promedio_minutos },
      create: {
        id: `ref-${tipo.id}`,
        tipo_interaccion_id: tipo.id,
        promedio_minutos: tipo.promedio_minutos,
        cantidad_muestras: 1,
      },
    });
  }
  console.log(`✓ ${tipos.length} reference times seeded`);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
