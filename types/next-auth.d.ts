import type { User } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: "admin" | "editor" | "viewer";
    githubId?: string;
  }

  interface Session {
    user: User & {
      role: "admin" | "editor" | "viewer";
      githubId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "editor" | "viewer";
    githubId?: string;
  }
}
