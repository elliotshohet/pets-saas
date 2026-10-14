import 'dotenv/config';
import { spawnSync } from 'node:child_process';
for (const key of ['DATABASE_URL', 'APP_URL', 'ADMIN_EMAIL']) {
  if (!process.env[key]) throw new Error(`Missing ${key}. Follow README local setup.`);
}
for (const args of [
  ['run', 'db:generate'],
  ['run', 'db:migrate'],
  ['exec', 'tsx', '--', 'scripts/demo-owner.ts'],
  ['run', 'db:seed'],
]) {
  const result = spawnSync('npm', args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) throw new Error('Database setup command failed');
}
