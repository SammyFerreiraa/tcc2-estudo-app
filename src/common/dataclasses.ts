import type { Prisma } from "@prisma/client";

export interface ITokenPayload {
  uid: number;
  name: string | null;
  email: string | null;
  exp: number;
  iat: number;
}

export type IUser = Prisma.UserGetPayload<object>;
