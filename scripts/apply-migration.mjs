import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex);
    let value = trimmed.slice(separatorIndex + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

const migrationPath = process.argv[2];

if (!migrationPath) {
  console.error('Usage: node scripts/apply-migration.mjs <migration.sql>');
  process.exit(1);
}

loadEnvFile(path.resolve('.env.local'));

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

const resolvedMigrationPath = path.resolve(migrationPath);
const sqlText = fs.readFileSync(resolvedMigrationPath, 'utf8');
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1 });

try {
  await sql.unsafe(sqlText);
  console.log(`Applied migration: ${path.relative(process.cwd(), resolvedMigrationPath)}`);
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}

