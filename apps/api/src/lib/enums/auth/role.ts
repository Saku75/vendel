enum AuthRole {
  SuperAdmin = "super_admin",
  Admin = "admin",
  User = "user",
  Guest = "guest",
}

const AuthRoleHierarchy: Record<AuthRole, number> = {
  [AuthRole.Guest]: 0,
  [AuthRole.User]: 1,
  [AuthRole.Admin]: 2,
  [AuthRole.SuperAdmin]: 3,
} as const;

function hasRequiredRole(
  userRole: AuthRole | null,
  minRole: AuthRole,
): boolean {
  if (!userRole) return false;
  return AuthRoleHierarchy[userRole] >= AuthRoleHierarchy[minRole];
}

export { AuthRole, AuthRoleHierarchy, hasRequiredRole };
