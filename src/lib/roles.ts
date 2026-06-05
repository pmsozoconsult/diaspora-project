export const Roles = {
  CLIENT: "CLIENT",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
} as const;

export type AppRole = (typeof Roles)[keyof typeof Roles];
