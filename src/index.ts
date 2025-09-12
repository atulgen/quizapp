// scripts/seedAdmin.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { admins } from "./db/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const plainPassword = 'Rashigupta@1234'; // 👈 replace with a secure password or get from env
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin: typeof admins.$inferInsert = {
    username: 'rashi_gupta',
    email: 'rashigupta@gmail.com',
    password: hashedPassword,
    firstName: 'Rashi',
    lastName: 'Gupta',
    isActive: true,
  };

  // Insert admin if not already exists
  const existing = await db
    .select()
    .from(admins)
    .where(eq(admins.email, admin.email));

  if (existing.length > 0) {
    console.log(`Admin with email ${admin.email} already exists!`);
  } else {
    await db.insert(admins).values(admin);
    console.log('✅ Admin user created!');
  }

  // Optional: list all admins
  const allAdmins = await db.select().from(admins);
  console.log('📋 All admins in DB:', allAdmins);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
