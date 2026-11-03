import prisma from "./prisma";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/app/(auth)/login/lib/zodLogin";

export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const { data, success } = loginSchema.safeParse(credentials);

        if (!success) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValidPassword = await bcrypt.compare(data.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;