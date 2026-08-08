import NextAuth from "next-auth";
import { authConfig } from "@/app/config/auth";

// Export NextAuth handlers and utilities
const authInstance = NextAuth(authConfig);

export const handlers = authInstance.handlers;
export const signIn = authInstance.signIn;
export const signOut = authInstance.signOut;

// Dummy auth export for backward compatibility
// In Next.js 16 with NextAuth v5, use middleware for auth checks
export const auth = async () => null;

export default authInstance;
