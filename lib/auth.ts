import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: 6, // Permitir senhas mais curtas
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // atualiza a cada 1 dia
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://192.168.3.115:3000",
    "http://localhost:3001",
    "http://192.168.3.115:3001"
  ],
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
      },
      role: {
        type: "string",
        required: true,
      },
      team: {
        type: "string",
        required: true,
      },
      setor: {
        type: "string",
        required: false,
      },
      empresa: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        required: false,
      },
    },
  },
})
