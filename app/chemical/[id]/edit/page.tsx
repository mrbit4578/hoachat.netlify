"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import ChemicalForm from "@/app/components/ChemicalForm";
import { ChemicalProduct } from "@/app/types";

export default function EditChemicalPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const [chemical, setChemical] = useState<Partial<ChemicalProduct> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authorization
    if (!session) {
      redirect("/auth/signin");
    }
    if (session.user?.role === "viewer") {
      redirect("/dashboard");
    }

    fetchChemical();
  }, [params.id, session]);

  const fetchChemical = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/chemicals/${params.id}`);
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
