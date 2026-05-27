export type UserRole =
  | 'Console'
  | 'Individual'
  | 'Student'
  | 'Professional';

export interface TestUser {
  email: string;
  password: string;
}

export const TEST_USERS: Record<UserRole, TestUser> = {
  Console: {
    email: 'business-1779347161455@yopmail.com',
    password: 'ETY;1?j#',
  },
  Individual: {
    email: 'mayamaya_ind_user_dev@yopmail.com',
    password: 'Srushti@0509',
  },
  Student: {
    email: 'mayamaya_ind_user_dev@yopmail.com',
    password: 'Srushti@0509',
  },
  Professional: {
    email: 'mayamaya_ind_user_dev@yopmail.com',
    password: 'Srushti@0509',
  },
};