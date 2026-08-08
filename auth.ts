import NextAuth from "next-auth";
import { authConfig } from "@/app/config/auth";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
