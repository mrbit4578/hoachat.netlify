import type { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

/**
 * GitHub OAuth Provider Configuration
 */
const GITHUB_AUTHORIZED_USERS = (process.env.GITHUB_AUTHORIZED_USERS || "").split(',').filter(Boolean);
const GITHUB_ADMIN_USERS = (process.env.GITHUB_ADMIN_USERS || "").split(',').filter(Boolean);

export const authConfig: NextAuthOptions = {
  providers: [
    GitHub({
      clientId: process.env.NEXT_PUBLIC_GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    jwt({ token, user, profile }: { token: JWT; user?: any; profile?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        // Set role based on GitHub username
        const githubLogin = (profile?.login as string) || "";
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
    
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as any;
        (session.user as any).email = token.email as string;
        (session.user as any).name = token.name as string;
        (session.user as any).avatar = token.picture as string;
        (session.user as any).githubId = token.githubId as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }: { user?: any }) {
      console.log(`User signed in: ${user?.email} via GitHub`);
    },
    async signOut() {
      console.log("User signed out");
    },
  },
};

/**
 * Middleware to check user permissions
 */
export function requireRole(requiredRole: string) {
  return (userRole: string) => {
    const roleHierarchy: Record<string, number> = { admin: 3, editor: 2, viewer: 1 };
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    const userLevel = roleHierarchy[userRole] || 0;
    return userLevel >= requiredLevel;
  };
}

/**
 * Get public user profile data (safe to expose)
 */
export function getPublicUserData(user: any) {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
  };
}
