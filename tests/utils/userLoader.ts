import fs from 'fs';
import path from 'path';

export interface StoredUser {
  role: string;
  email: string;
  password: string;
  loginContext: 'assessment' | 'console';
  shouldHaveOrganization: boolean;
}

export function getLatestUserByRole(role: string): StoredUser {
  const filePath = path.join(process.cwd(), 'artifacts', 'created-users.json');
  const users: StoredUser[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const matches = users.filter(u => u.role === role);
  if (!matches.length) {
    throw new Error(`No user found for role: ${role}`);
  }

  return matches[matches.length - 1];
}