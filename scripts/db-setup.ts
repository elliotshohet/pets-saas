import 'dotenv/config';
import { mkdtempSync, cpSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
for (const key of [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'DEMO_EMAIL',
  'DEMO_PASSWORD',
]) {
  if (!process.env[key]) throw new Error(`Missing ${key}. Follow README local setup.`);
}
if (
  process.env.BETTER_AUTH_SECRET!.length < 32 ||
  process.env.DEMO_PASSWORD!.length < 12 ||
  process.env.DEMO_PASSWORD!.length > 128
)
  throw new Error('Auth secret must have at least 32 characters; demo password must have 12–128.');
const run = (args: string[], env = process.env) => {
  const result = spawnSync('npm', args, { stdio: 'inherit', env });
  if (result.status !== 0) throw new Error('Database setup command failed');
};
const staged = mkdtempSync(join(tmpdir(), 'pets-migrations-'));
try {
  for (const entry of readdirSync('prisma/migrations')) {
    if (entry !== '20261013000100_require_owner')
      cpSync(resolve('prisma/migrations', entry), join(staged, entry), { recursive: true });
  }
  run(['run', 'db:generate']);
  run(['run', 'db:migrate'], { ...process.env, PRISMA_MIGRATIONS_PATH: staged });
  run(['exec', 'tsx', '--', 'scripts/demo-owner.ts']);
  run(['run', 'db:migrate']);
  run(['run', 'db:seed']);
} finally {
  rmSync(staged, { recursive: true, force: true });
}
