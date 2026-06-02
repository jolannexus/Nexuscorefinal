import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 NexusCore Seed Starting...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@nexuscore.app";
  let adminPassword = process.env.SEED_ADMIN_PASSWORD;
  let isGeneratedPassword = false;

  if (!adminPassword) {
    adminPassword = crypto.randomBytes(12).toString("hex");
    isGeneratedPassword = true;
  }

  // Cek/buat Platform Tenant
  let platformTenant = await prisma.tenant.findUnique({
    where: { slug: "platform" },
  });

  if (!platformTenant) {
    platformTenant = await prisma.tenant.create({
      data: {
        name: "NexusCore Platform",
        slug: "platform",
        status: "ACTIVE",
        operationMode: "MANAGED_DEPOSIT",
      },
    });
    console.log(`✅ Platform Tenant: NexusCore Platform (id: ${platformTenant.id})`);
  } else {
    console.log(`✅ Platform Tenant ditemukan: NexusCore Platform (id: ${platformTenant.id})`);
  }

  // Cek admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        displayName: "Platform Admin",
        role: "PLATFORM_ADMIN",
        tenantId: platformTenant.id,
      },
    });

    console.log(`✅ Platform Admin dibuat: ${adminUser.email}`);

    // Create wallet for admin
    await prisma.wallet.create({
      data: {
        userId: adminUser.id,
        tenantId: platformTenant.id,
        balance: 0,
        frozenBalance: 0,
      },
    });

    console.log(`✅ Wallet admin diinisialisasi: balance Rp 0`);

    console.log(`🔑 Password: ${adminPassword}`);
    if (isGeneratedPassword) {
      console.log("⚠️  SIMPAN PASSWORD INI! Tidak akan ditampilkan lagi.");
    }
  } else {
    console.log(`ℹ️  Admin user ${adminEmail} sudah ada. (Skip pembuatan)`);
  }

  console.log("🎉 Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
