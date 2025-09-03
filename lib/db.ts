// lib/db.ts

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema/index';

let db: ReturnType<typeof drizzle>;

try {
    const sql = neon(process.env.DATABASE_URL!);

    db = drizzle(sql, { schema });

    console.log('✅ Drizzle DB initialized successfully');
} catch (error: any) {
    if (error.code === 'ENOTFOUND') {
        console.error('❌ Database connection failed: Invalid DATABASE_URL');
    } else if (error.code === 'ECONNREFUSED') {
        console.error('❌ Database connection failed: Connection refused');
    } else if (error.code === 'EHOSTUNREACH') {
        console.error('❌ Database connection failed: Host unreachable');
    } else {
        console.error('❌ Unexpected error initializing Drizzle DB:', error);
    }
    throw error; // Let the app crash here if DB is critical
}

export { db };
