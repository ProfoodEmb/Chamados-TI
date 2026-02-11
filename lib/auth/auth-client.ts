import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://192.168.3.115:3000",
    "http://localhost:3001", 
    "http://192.168.3.115:3001"
  ]
})

export const { signIn, signOut, signUp, useSession } = authClient
