import { TEST_USERS, UserRole, TestUser } from './testUsers';

export function getUser(role: UserRole): TestUser {
  const user = TEST_USERS[role];

  if (!user) {
    throw new Error(`❌ No test user configured for role: ${role}`);
  }

  return user;
}
