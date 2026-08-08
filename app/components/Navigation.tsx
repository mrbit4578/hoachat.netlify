"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navigation() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold hover:text-blue-100">
              🧪 Chemical Control
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="hover:text-blue-100 transition">
                Home
              </Link>
              <Link href="/dashboard" className="hover:text-blue-100 transition">
                Dashboard
              </Link>
              {session?.user?.role === "admin" && (
                <Link href="/admin" className="hover:text-blue-100 transition">
                  Admin
                </Link>
              )}
              {(session?.user?.role === "admin" || session?.user?.role === "editor") && (
                <Link href="/chemical/new" className="hover:text-blue-100 transition">
                  + Add Chemical
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm">
                  {session.user?.name} ({session.user?.role})
                </span>
                {session.user?.avatar && (
                  <img
                    src={session.user.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/" className="block hover:text-blue-100">
              Home
            </Link>
            <Link href="/dashboard" className="block hover:text-blue-100">
              Dashboard
            </Link>
            {session?.user?.role === "admin" && (
              <Link href="/admin" className="block hover:text-blue-100">
                Admin
              </Link>
            )}
            {(session?.user?.role === "admin" || session?.user?.role === "editor") && (
              <Link href="/chemical/new" className="block hover:text-blue-100">
                + Add Chemical
              </Link>
            )}
            {session ? (
              <button
                onClick={() => signOut()}
                className="w-full text-left bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/auth/signin" className="block hover:text-blue-100">
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
