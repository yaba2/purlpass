import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    const email = 'admin@punchmunchcrunch.com';
    const password = 'admin123';
    const displayName = 'Admin User';

    console.log('Creating admin user...');

    // Check if admin already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      console.log('Admin user already exists');
      console.log('Email:', email);
      console.log('Password:', password);
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const newUser = await db.insert(users).values({
      uid: crypto.randomUUID(),
      email,
      displayName,
      passwordHash,
      role: 'admin',
      isActive: true,
    }).returning();

    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Display Name:', displayName);
    console.log('Role: admin');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
