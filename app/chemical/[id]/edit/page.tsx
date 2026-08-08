"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChemicalForm from "@/app/components/ChemicalForm";
import { ChemicalProduct } from "@/app/types";

export default function EditChemicalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chemical, setChemical] = useState<Partial<ChemicalProduct> | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    // Async params unwrap
    (async () => {
      const { id: paramId } = await params;
      setId(paramId);
    })();
  }, [params]);

  useEffect(() => {
    // Check authorization
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    if (session?.user && (session.user as any).role === "viewer") {
      router.push("/dashboard");
    }

    if (id) fetchChemical();
  }, [id, session, status, router]);

  const fetchChemical = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/chemicals/${id}`);
      const data = await res.json();
      if (data.success) {
        setChemical(data.data);
      }
    } catch (error) {
      console.error("Error fetching chemical:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!chemical) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chemical not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">✏️ Edit Chemical</h1>
        <p className="text-gray-600 mt-2">{chemical.productName}</p>
      </div>

      <ChemicalForm initialData={chemical} isEditing={true} />
    </div>
  );
}
