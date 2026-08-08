"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChemicalProduct } from "@/app/types";

export default function ChemicalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const [chemical, setChemical] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { id: paramId } = await params;
      setId(paramId);
    })();
  }, [params]);

  useEffect(() => {
    if (id) fetchChemical();
  }, [id]);

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

  const compliance = chemical.compliance;
  const complianceColor =
    compliance?.complianceLevel === "Full"
      ? "bg-green-100 text-green-800"
      : compliance?.complianceLevel === "Partial"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">{chemical.productName}</h1>
          <p className="text-gray-600 mt-2">Code: {chemical.productCode}</p>
        </div>

        <div className="space-x-2">
          {session?.user?.role === "admin" || session?.user?.role === "editor" ? (
            <Link
              href={`/chemical/${chemical.id}/edit`}
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-6 py-3 rounded-lg transition"
            >
              Edit
            </Link>
          ) : null}
          <Link
            href="/dashboard"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-lg transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-8 rounded-lg shadow space-y-4">
            <h2 className="text-2xl font-bold">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Manufacturer</p>
                <p className="text-lg font-bold text-gray-900">{chemical.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created By</p>
                <p className="text-lg font-bold text-gray-900">{chemical.createdBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(chemical.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(chemical.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* ZDHC Certification */}
          <div className="bg-white p-8 rounded-lg shadow space-y-4">
            <h2 className="text-2xl font-bold">ZDHC Certification</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Certified</p>
                {chemical.zdhcCertified ? (
                  <p className="text-lg font-bold text-green-600">✓ Yes</p>
                ) : (
                  <p className="text-lg font-bold text-red-600">✗ No</p>
                )}
              </div>

              {chemical.zdhcCertified && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Certification Level</p>
                    <p className="text-lg font-bold text-gray-900">{chemical.zdhcLevel}</p>
                  </div>

                  {chemical.certificateNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Certificate Number</p>
                      <p className="text-lg font-bold text-gray-900">
                        {chemical.certificateNumber}
                      </p>
                    </div>
                  )}

                  {chemical.certifyingBody && (
                    <div>
                      <p className="text-sm text-gray-600">Certifying Body</p>
                      <p className="text-lg font-bold text-gray-900">
                        {chemical.certifyingBody}
                      </p>
                    </div>
                  )}

                  {chemical.zdhcCertificateExpiry && (
                    <div>
                      <p className="text-sm text-gray-600">Certificate Expiry</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(chemical.zdhcCertificateExpiry).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {chemical.zdhcCertificateUrl && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Certificate URL</p>
                      <a
                        href={chemical.zdhcCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-bold break-all"
                      >
                        {chemical.zdhcCertificateUrl}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chemical Composition */}
          <div className="bg-white p-8 rounded-lg shadow space-y-4">
            <h2 className="text-2xl font-bold">Chemical Composition</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-bold text-gray-700">
                      Component Name
                    </th>
                    <th className="px-4 py-2 text-left font-bold text-gray-700">
                      CAS Number
                    </th>
                    <th className="px-4 py-2 text-right font-bold text-gray-700">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chemical.chemicalComposition?.map((comp: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{comp.componentName}</td>
                      <td className="px-4 py-2 font-mono text-gray-600">
                        {comp.casNumber}
                      </td>
                      <td className="px-4 py-2 text-right">{comp.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compliance Status */}
          <div className={`p-6 rounded-lg shadow text-white ${
            compliance?.complianceLevel === "Full"
              ? "bg-green-600"
              : compliance?.complianceLevel === "Partial"
              ? "bg-yellow-600"
              : "bg-red-600"
          }`}>
            <p className="text-sm opacity-90">ZDHC Compliance Status</p>
            <p className="text-3xl font-bold mt-2">
              {compliance?.complianceLevel}
            </p>
            <p className="text-xs mt-2 opacity-90">
              Last checked: {new Date(compliance?.lastChecked).toLocaleDateString()}
            </p>
          </div>

          {/* Issues */}
          {compliance?.issues && compliance.issues.length > 0 ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Compliance Issues</h3>
              <div className="space-y-3">
                {compliance.issues.map((issue: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded ${
                      issue.severity === "Critical"
                        ? "bg-red-100 border-l-4 border-red-600"
                        : issue.severity === "High"
                        ? "bg-orange-100 border-l-4 border-orange-600"
                        : issue.severity === "Medium"
                        ? "bg-yellow-100 border-l-4 border-yellow-600"
                        : "bg-blue-100 border-l-4 border-blue-600"
                    }`}
                  >
                    <p className="font-bold text-sm">{issue.issueType}</p>
                    <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                    <p className="text-xs font-bold mt-2">
                      Severity: <span className="uppercase">{issue.severity}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-100 border border-green-300 rounded-lg p-6">
              <p className="text-green-800 font-bold">✓ No compliance issues</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
