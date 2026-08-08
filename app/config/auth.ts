import type { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

/**
 * GitHub OAuth Provider Configuration
 */
const GITHUB_AUTHORIZED_USERS = (process.env.GITHUB_AUTHORIZED_USERS || "").split(',').filter(Boolean);
const GITHUB_ADMIN_USERS = (process.env.GITHUB_ADMIN_USERS || "mrbit4578").split(',').filter(Boolean);

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "zdhc-demo-fallback-secret-change-me",
  session: { strategy: "jwt" },
  providers: [
    // Option 1: GitHub OAuth (requires OAuth app env vars)
    GitHub({
      clientId: process.env.NEXT_PUBLIC_GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    // Option 2: GitHub Personal Access Token (no setup needed)
    // User pastes their GitHub token -> verified against GitHub API -> editor/admin role
    Credentials({
      id: "github-token",
      name: "GitHub Token",
      credentials: {
        token: { label: "GitHub Personal Access Token", type: "password" },
      },
      async authorize(credentials) {
        const token = (credentials?.token || "") as string;
        if (!token) return null;

        try {
          const res = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": "chemical-control-system",
              Accept: "application/vnd.github+json",
            },
          });
          if (!res.ok) return null;
          const profile = await res.json();
          const login: string = profile.login || "";
          if (!login) return null;

          const role = GITHUB_ADMIN_USERS.includes(login) ? "admin" : "editor";

          return {
            id: String(profile.id),
            name: login,
            email: profile.email || `${login}@users.noreply.github.com`,
            image: profile.avatar_url,
            role,
          };
        } catch {
          return null;
        }
      },
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

        // Role: from credentials authorize() or from GitHub OAuth username
        if (user.role) {
          token.role = user.role;
        } else {
          const githubLogin = (profile?.login as string) || "";
          if (GITHUB_ADMIN_USERS.includes(githubLogin)) {
            token.role = "admin";
          } else if (GITHUB_AUTHORIZED_USERS.includes(githubLogin) || githubLogin) {
            token.role = "editor";
          } else {
            token.role = "viewer";
          }
        }

        token.githubId = profile?.id || user.id;
      }
      return token;
    },

    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as any) || "viewer";
        (session.user as any).email = token.email as string;
        (session.user as any).name = token.name as string;
        (session.user as any).avatar = token.picture as string;
        (session.user as any).githubId = token.githubId as string;
      }
      return session;
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
