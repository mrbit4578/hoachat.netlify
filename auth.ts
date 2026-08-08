import NextAuth from "next-auth";
import { authConfig } from "@/app/config/auth";

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
