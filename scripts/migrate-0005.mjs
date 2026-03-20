import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = neon(process.env.DATABASE_URL);

const migration = readFileSync(join(__dirname, '../drizzle/0005_issue_date.sql'), 'utf8');
const statements = migration.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

for (const stmt of statements) {
    console.log('Running:', stmt);
    await sql.query(stmt);
    console.log('Done.');
}
console.log('Migration 0005 applied successfully.');
