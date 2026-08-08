import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { User } from "@/app/types";

/**
 * GitHub OAuth Provider Configuration
 * Users need to:
 * 1. Create GitHub OAuth App at https://github.com/settings/developers
 * 2. Set Authorization callback URL to: http://localhost:3000/api/auth/callback/github
 * 3. Copy Client ID and Client Secret to .env.local
 */
const GITHUB_AUTHORIZED_USERS = process.env.GITHUB_AUTHORIZED_USERS?.split(',') || [];
const GITHUB_ADMIN_USERS = process.env.GITHUB_ADMIN_USERS?.split(',') || [];

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.NEXT_PUBLIC_GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      // Request additional scopes if needed
      // scope: "user:email,read:user,read:org",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { pathname } }) {
      const isOnAdminPanel = pathname?.startsWith("/admin");
      const isOnDashboard = pathname?.startsWith("/dashboard");
      const isOnEditPage = pathname?.startsWith("/chemical/new") || pathname?.startsWith("/chemical/edit");
      
      // Only admin and editors can access admin and edit pages
      if (isOnAdminPanel || isOnEditPage) {
        return !!auth?.user;
      }
      
      // Everyone can view dashboard
      if (isOnDashboard) {
        return true;
      }
      
      return true;
    },
    
    jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        // Set role based on GitHub username
        const githubLogin = profile?.login as string || "";
        if (GITHUB_ADMIN_USERS.includes(githubLogin)) {
          token.role = "admin";
        } else if (GITHUB_AUTHORIZED_USERS.includes(githubLogin) || githubLogin) {
          token.role = "editor";
        } else {
          token.role = "viewer";
        }
        
        token.githubId = profile?.id;
      }
      return token;
    },
    
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as User["role"];
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.avatar = token.picture as string;
        session.user.githubId = token.githubId as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, profile }) {
      console.log(`User signed in: ${user.email} via GitHub`);
    },
    async signOut() {
      console.log("User signed out");
    },
  },
} satisfies NextAuthConfig;

/**
 * Middleware to check user permissions
 */
export function requireRole(requiredRole: User["role"]) {
  return (userRole: User["role"]) => {
    const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };
    const requiredLevel = roleHierarchy[requiredRole];
    const userLevel = roleHierarchy[userRole];
    return userLevel >= requiredLevel;
  };
}

/**
 * Get public user profile data (safe to expose)
 */
export function getPublicUserData(user: User) {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
  };
}
