"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChemicalForm from "@/app/components/ChemicalForm";

export default function NewChemicalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    // Check if user has permission to create
    if (session?.user && (session.user as any).role === "viewer") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">➕ Add New Chemical</h1>
        <p className="text-gray-600 mt-2">Create a new chemical product in the system</p>
      </div>

      <ChemicalForm />
    </div>
  );
}
