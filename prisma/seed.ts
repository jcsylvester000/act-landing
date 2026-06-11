// ACT — Database seed: service catalog (real pricing), staff accounts, technicians.
// Run with: npm run db:seed   (idempotent — uses upsert throughout)
// DEV-ONLY default passwords — change before public launch.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Service Catalog (prices = ACT's real per-unit rates) ──────────────────
  const catalog = [
    {
      serviceType: 'BasicCleaning' as const,
      name: 'Basic Cleaning',
      description: 'Thorough clean of filters, coils, and drainage. Prevents mold and keeps the unit at full efficiency.',
      pricePerUnitSplit: 1500, pricePerUnitWindow: 1200, pricePerUnitCassette: 1800,
      reservationFee: 0, requiresQuote: false,
    },
    {
      serviceType: 'DeepClean' as const,
      name: 'Deep Clean / Chemical Wash',
      description: 'Complete chemical wash and disinfection. Removes buildup and bacteria, restores cooling performance.',
      pricePerUnitSplit: 2500, pricePerUnitWindow: 2000, pricePerUnitCassette: 3000,
      reservationFee: 0, requiresQuote: false,
    },
    {
      serviceType: 'ACInstallation' as const,
      name: 'AC Installation',
      description: 'New unit installation. Price quoted per job after assessment.',
      requiresQuote: true, reservationFee: 0,
    },
    {
      serviceType: 'RepairDiagnostics' as const,
      name: 'Repair & Diagnostics',
      description: 'Fault diagnosis and repair. Price quoted per job after assessment.',
      requiresQuote: true, reservationFee: 0,
    },
    {
      serviceType: 'RefrigerantRecharge' as const,
      name: 'Refrigerant Recharge',
      description: 'Freon top-up / recharge. Price quoted per job depending on refrigerant type and volume.',
      requiresQuote: true, reservationFee: 0,
    },
  ];
  for (const item of catalog) {
    await prisma.serviceCatalogItem.upsert({
      where: { serviceType: item.serviceType },
      update: item,
      create: item,
    });
  }
  console.log(`✓ Service catalog: ${catalog.length} services`);

  // ── Staff accounts (dev-only passwords) ───────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  const operatorHash = await bcrypt.hash('operator123', 10);

  await prisma.client.upsert({
    where: { email: 'admin@act.ph' },
    update: {},
    create: {
      id: 'ADMIN001', role: 'admin', firstName: 'Admin', lastName: 'ACT',
      email: 'admin@act.ph', passwordHash: adminHash, phone: '09171111111',
    },
  });
  await prisma.client.upsert({
    where: { email: 'maria@act.ph' },
    update: {},
    create: {
      id: 'OP001', role: 'operator', firstName: 'Maria', lastName: 'Santos',
      email: 'maria@act.ph', passwordHash: operatorHash, phone: '09172222222',
      operatorStatus: 'Active',
      assignedCities: ['Binan', 'SanPedro', 'StaRosa', 'Cabuyao', 'Muntinlupa', 'Carmona', 'GMACavite'],
    },
  });
  console.log('✓ Staff: ADMIN001 (admin@act.ph), OP001 (maria@act.ph)');

  // ── Technicians (the 3 real outsourced techs) ─────────────────────────────
  const techs = [
    { id: 'TECH001', fullName: 'Mark Santos', phone: '09171234567', type: 'Outsource' as const, skillLevel: 'Senior' as const, coverageCities: ['Binan', 'SanPedro', 'Muntinlupa'] as const, averageRating: 4.8, totalJobsCompleted: 127 },
    { id: 'TECH002', fullName: 'Jose Reyes', phone: '09281234567', type: 'Outsource' as const, skillLevel: 'Lead' as const, coverageCities: ['StaRosa', 'Cabuyao', 'Binan'] as const, averageRating: 4.9, totalJobsCompleted: 215 },
    { id: 'TECH003', fullName: 'Carlo Cruz', phone: '09391234567', type: 'Outsource' as const, skillLevel: 'Junior' as const, coverageCities: ['Carmona', 'GMACavite', 'SanPedro'] as const, averageRating: 4.5, totalJobsCompleted: 43 },
  ];
  for (const t of techs) {
    await prisma.technician.upsert({
      where: { id: t.id },
      update: { ...t, coverageCities: [...t.coverageCities] },
      create: { ...t, coverageCities: [...t.coverageCities], isAvailable: true, active: true },
    });
  }
  console.log(`✓ Technicians: ${techs.length}`);
}

main()
  .then(() => console.log('Seed complete.'))
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
