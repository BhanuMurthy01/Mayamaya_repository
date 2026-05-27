import fs from 'fs';
import path from 'path';

export interface PersistedUser {
  role: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  env: string; // ✅ added
}

/**
 * Persist created users to JSON for audit & reuse.
 * This file is NOT source-controlled.
 */
export function persistUser(user: PersistedUser) {
  const env = process.env.ENV || 'dev'; // ✅ capture env

  const artifactsDir = path.resolve(process.cwd(), 'artifacts');

  // ✅ env-based file (best practice)
  const filePath = path.join(
    artifactsDir,
    `created-users-${env}.json`
  );

  // Ensure artifacts directory exists
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir);
  }

  const existing: PersistedUser[] =
    fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      : [];

  existing.push(user);

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  console.log(`✅ [${env}] User persisted: ${user.email}`);
}