import fs from 'fs';
import path from 'path';
import { generatePassword } from './passwordGenerator';

/**
 * ✅ Role MUST be an enum (runtime + type-safe)
 */
export enum Role {
  Student = 'Student',
  Business = 'Business',
  Professional = 'Professional',
  Individual = 'Individual'
}

export function createUser(role: Role) {
  const timestamp = Date.now();
  const env = process.env.ENV || 'dev'; // ✅ capture environment

  const user = {
    role,
    name: `${role}-User`,
    email: `${role.toLowerCase()}-${timestamp}@yopmail.com`,
    password: generatePassword(),
    env, // ✅ environment added
    createdAt: new Date().toISOString(), // ✅ helpful for debugging
  };

  // ✅ Environment-specific file (mixing users across envs)
  const filePath = path.join(
    process.cwd(),
    'artifacts',
    `created-users-test.json`
  );

  const existing = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : [];

  existing.push(user);

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  return user;
}