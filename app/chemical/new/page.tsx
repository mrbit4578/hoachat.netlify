import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChemicalForm from "@/app/components/ChemicalForm";

export default async function NewChemicalPage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    redirect("/auth/signin");
  }

  // Check if user has permission to create
  if (session.user?.role === "viewer") {
    redirect("/dashboard");
  }

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
