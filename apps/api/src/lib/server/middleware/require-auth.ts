import { Context } from "hono";
import { createMiddleware } from "hono/factory";

import { AuthRole, AuthStatus } from "$lib/enums";
import { HonoEnv } from "$lib/server";
import { Err } from "$lib/types/result";

type AuthContext = NonNullable<HonoEnv["Variables"]["auth"]> & {
  status: AuthStatus.Authenticated;
};

type AuthorizeCallback = (
  c: Context<HonoEnv>,
  auth: AuthContext,
) => boolean | Promise<boolean>;

interface RequireAuthOptions {
  /** Minimum required role (optional) */
  minRole?: AuthRole;
  /** Custom authorization callback for complex checks */
  authorize?: AuthorizeCallback;
  /** Custom 403 message when authorization fails */
  forbiddenMessage?: string;
}

const ROLE_HIERARCHY: Record<AuthRole, number> = {
  [AuthRole.Guest]: 0,
  [AuthRole.User]: 1,
  [AuthRole.Admin]: 2,
  [AuthRole.SuperAdmin]: 3,
};

function hasRequiredRole(
  userRole: AuthRole | null,
  minRole: AuthRole,
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

export function requireAuth(options: RequireAuthOptions = {}) {
  return createMiddleware<HonoEnv>(async (c, next) => {
    const auth = c.var.auth;

    // Check if user is authenticated
    if (auth.status !== AuthStatus.Authenticated) {
      return c.json(
        {
          ok: false,
          status: 401,
          message: "Not authenticated",
        } satisfies Err,
        401,
      );
    }

    // Type assertion safe here since we checked status above
    const authenticatedAuth = auth as AuthContext;

    // Check role-based authorization
    if (
      options.minRole &&
      !hasRequiredRole(authenticatedAuth.user.role, options.minRole)
    ) {
      return c.json(
        {
          ok: false,
          status: 403,
          message: options.forbiddenMessage || "Insufficient permissions",
        } satisfies Err,
        403,
      );
    }

    // Check custom authorization
    if (options.authorize) {
      const authorized = await options.authorize(c, authenticatedAuth);
      if (!authorized) {
        return c.json(
          {
            ok: false,
            status: 403,
            message: options.forbiddenMessage || "Access denied",
          } satisfies Err,
          403,
        );
      }
    }

    await next();
  });
}

// Convenience functions for common use cases
export const requireGuest = () => requireAuth({ minRole: AuthRole.Guest });
export const requireUser = () => requireAuth({ minRole: AuthRole.User });
export const requireAdmin = () => requireAuth({ minRole: AuthRole.Admin });
export const requireSuperAdmin = () =>
  requireAuth({ minRole: AuthRole.SuperAdmin });
