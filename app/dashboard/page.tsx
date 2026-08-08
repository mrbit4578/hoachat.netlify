"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChemicalProduct } from "@/app/types";

export default function Dashboard() {
  const { data: session } = useSession();
  const [chemicals, setChemicals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "certified" | "non-certified">("all");

  useEffect(() => {
    fetchChemicals();
  }, [search, filter]);

  const fetchChemicals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filter === "certified") params.append("certified", "true");
      if (filter === "non-certified") params.append("certified", "false");

      const res = await fetch(`/api/chemicals?${params}`);
      const data = await res.json();
      setChemicals(data.data || []);
    } catch (error) {
      console.error("Error fetching chemicals:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: chemicals.length,
    certified: chemicals.filter(c => c.zdhcCertified).length,
    compliant: chemicals.filter(c => c.compliance?.complianceLevel === "Full").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">📊 Chemical Dashboard</h1>
        {session?.user?.role === "admin" || session?.user?.role === "editor" ? (
          <Link
            href="/chemical/new"
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg transition"
          >
            + Add Chemical
          </Link>
        ) : null}
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
          <div className="text-gray-600 text-sm">Total Chemicals</div>
          <div className="text-4xl font-bold text-blue-600">{stats.total}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
          <div className="text-gray-600 text-sm">ZDHC Certified</div>
          <div className="text-4xl font-bold text-green-600">{stats.certified}</div>
          <div className="text-xs text-gray-500 mt-2">
            {stats.total > 0 ? ((stats.certified / stats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
          <div className="text-gray-600 text-sm">Fully Compliant</div>
          <div className="text-4xl font-bold text-purple-600">{stats.compliant}</div>
          <div className="text-xs text-gray-500 mt-2">
            {stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <input
          type="text"
          placeholder="Search by product name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <div className="flex gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("certified")}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              filter === "certified"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            ZDHC Certified
          </button>
          <button
            onClick={() => setFilter("non-certified")}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              filter === "non-certified"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Non-Certified
          </button>
        </div>
      </div>

      {/* Chemicals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : chemicals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No chemicals found. {session?.user?.role === "admin" || session?.user?.role === "editor" ? "Add one now!" : ""}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Product Name</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Manufacturer</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">ZDHC Certified</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">Compliance</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">Issues</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chemicals.map((chemical) => (
                  <tr key={chemical.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{chemical.productName}</div>
                      <div className="text-sm text-gray-500">{chemical.productCode}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{chemical.manufacturer}</td>
                    <td className="px-6 py-4 text-center">
                      {chemical.zdhcCertified ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                          ✓ Yes
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                          ✗ No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {chemical.compliance?.complianceLevel === "Full" ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                          Full
                        </span>
                      ) : chemical.compliance?.complianceLevel === "Partial" ? (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                          Partial
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                          Non-Compliant
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {chemical.compliance?.issues?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <Link
                        href={`/chemical/${chemical.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        View
                      </Link>
                      {session?.user?.role === "admin" || session?.user?.role === "editor" ? (
                        <>
                          <span className="text-gray-400">|</span>
                          <Link
                            href={`/chemical/${chemical.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-800 font-bold"
                          >
                            Edit
                          </Link>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
