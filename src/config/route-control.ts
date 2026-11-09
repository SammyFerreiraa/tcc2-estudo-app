import { UserRole } from "@prisma/client";

const allAllowed = [UserRole.MEMBER, UserRole.MANAGER, UserRole.ADMIN];

export const publicRoutes = ["/login", "/signup", "/auth/verify-token", "/unauthorized"];

export const routesPermissions = [
  {
    path: "/",
    rolesAllowed: allAllowed,
  },
  {
    path: "/tasks",
    rolesAllowed: allAllowed,
  },
  {
    path: "/admin-page",
    rolesAllowed: [UserRole.ADMIN],
  },
  {
    path: "/member-page",
    rolesAllowed: [UserRole.MEMBER],
  },
];
