export const UserRole = {
  GOD: 'GOD',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CLIENT: 'CLIENT'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
