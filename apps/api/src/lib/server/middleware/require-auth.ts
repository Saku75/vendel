import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

import { AuthRole, hasRequiredRole } from "$lib/enums/auth/role";
import { AuthStatus } from "$lib/enums/auth/status";
import type { ServerEnv } from "$lib/server";
import { response } from "$lib/server/response";
import type {
  AuthContext,
  AuthContextAuthenticatedOrExpired,
} from "$lib/types/auth/context";

type AuthorizeCallback = (
  c: Context<ServerEnv>,
  auth: AuthContext,
) => boolean | Promise<boolean>;

interface RequireAuthOptions {
  minRole?: AuthRole;
  authorize?: AuthorizeCallback;
  allowExpired?: boolean;
  customMessage?: {
    unauthenticated?: string;
    forbidden?: string;
  };
}

function requireAuth(options: RequireAuthOptions = {}) {
  return createMiddleware<ServerEnv>(async (c, next) => {
    const auth = c.var.auth;

    if (
      auth.status === AuthStatus.Unauthenticated ||
      (auth.status === AuthStatus.Expired && !options.allowExpired)
    ) {
      return response(c, {
        status: 401,
        content: {
          message:
            options.customMessage?.unauthenticated || "Not authenticated",
        },
      });
    }

    if (
      options.minRole &&
      !hasRequiredRole(auth.access.user.role, options.minRole)
    ) {
      return response(c, {
        status: 403,
        content: {
          message:
            options.customMessage?.forbidden || "Insufficient permissions",
        },
      });
    }

    if (options.authorize) {
      const authorized = await options.authorize(c, auth);
      if (!authorized) {
        return response(c, {
          status: 403,
          content: {
            message: options.customMessage?.forbidden || "Access denied",
          },
        });
      }
    }

    await next();
  });
}

const requireGuest = () => requireAuth({ minRole: AuthRole.Guest });
const requireUser = () => requireAuth({ minRole: AuthRole.User });
const requireAdmin = () => requireAuth({ minRole: AuthRole.Admin });
const requireSuperAdmin = () => requireAuth({ minRole: AuthRole.SuperAdmin });

function getAuth(
  c: Context<ServerEnv>,
  options: { allowExpired: true },
): AuthContextAuthenticatedOrExpired;
function getAuth(
  c: Context<ServerEnv>,
  options?: { allowExpired?: false },
): AuthContextAuthenticatedOrExpired & { status: AuthStatus.Authenticated };
function getAuth(
  c: Context<ServerEnv>,
  options?: { allowExpired?: boolean },
): AuthContextAuthenticatedOrExpired {
  const auth = c.var.auth;

  if (auth.status === AuthStatus.Unauthenticated) {
    throw new Error(
      "Require auth middleware error: Expected authenticated user.",
    );
  }

  if (auth.status === AuthStatus.Expired && !options?.allowExpired) {
    throw new Error(
      "Require auth middleware error: Expected non-expired token.",
    );
  }

  return auth;
}

export {
  getAuth,
  requireAdmin,
  requireAuth,
  requireGuest,
  requireSuperAdmin,
  requireUser,
};
