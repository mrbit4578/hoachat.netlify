import { getServerSession } from "next-auth";
import { authConfig } from "@/app/config/auth";

/**
 * Server-side session helper (next-auth v4)
 * Usage: const session = await auth();
 */
export const auth = () => getServerSession(authConfig);

export { authConfig };
