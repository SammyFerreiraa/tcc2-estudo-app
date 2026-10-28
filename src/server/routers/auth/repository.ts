import type { UserRole } from "@prisma/client";
import { isBefore } from "date-fns";
import type { SessionUser } from "@/common/auth";
import { prisma } from "@/server/config/prisma";

type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
};

export const authRepository = {
  findUserByEmail: async (email: string) => {
    return await prisma.user.findUnique({ where: { email }, select: { id: true } });
  },

  createMember: async (data: { name: string; email: string; passwordHash: string }) => {
    return await prisma.user.create({
      data: { ...data, role: "MEMBER" },
      select: { id: true, email: true, name: true, role: true, image: true },
    });
  },

  findVerificationCode: async (token: string) => {
    return await prisma.verificationCode.findFirst({
      where: { code: token, used: false },
      include: { user: true },
    });
  },

  markVerificationCodeAsUsed: async (id: string) => {
    return await prisma.verificationCode.update({
      where: { id },
      data: { used: true },
    });
  },

  isVerificationCodeExpired: (record: { expiresAt: Date }) => {
    return isBefore(record.expiresAt, new Date());
  },

  buildSessionUser: (user: UserRecord): SessionUser => {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    };
  },
};
