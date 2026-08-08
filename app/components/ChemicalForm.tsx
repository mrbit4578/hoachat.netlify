"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChemicalProduct } from "@/app/types";

interface ChemicalFormProps {
  initialData?: Partial<ChemicalProduct>;
  isEditing?: boolean;
}

export default function ChemicalForm({ initialData, isEditing = false }: ChemicalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [components, setComponents] = useState(
    initialData?.chemicalComposition || [{ componentName: "", casNumber: "", percentage: 0 }]
  );

  const [formData, setFormData] = useState({
    productName: initialData?.productName || "",
    productCode: initialData?.productCode || "",
    manufacturer: initialData?.manufacturer || "",
    zdhcCertified: initialData?.zdhcCertified || false,
    zdhcLevel: (initialData?.zdhcLevel as "ZDHC Gateway" | "ZDHC Approved" | "ZDHC Audited") || "ZDHC Gateway",
    zdhcCertificateUrl: initialData?.zdhcCertificateUrl || "",
    zdhcCertificateExpiry: initialData?.zdhcCertificateExpiry
      ? new Date(initialData.zdhcCertificateExpiry).toISOString().split("T")[0]
      : "",
    certificateNumber: initialData?.certificateNumber || "",
    certifyingBody: initialData?.certifyingBody || "",
  });

  const handleComponentChange = (index: number, field: string, value: any) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setComponents(newComponents);
  };

  const addComponent = () => {
    setComponents([...components, { componentName: "", casNumber: "", percentage: 0 }]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        ...formData,
        zdhcCertified: Boolean(formData.zdhcCertified),
        chemicalComposition: components.filter(c => c.componentName && c.casNumber),
        hazardousSubstances: [],
      };

      const url = isEditing
        ? `/api/chemicals/${initialData?.id}`
        : `/api/chemicals`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || "An error occurred");
        return;
      }

      router.push(`/chemical/${result.data.id}`);
    } catch (err) {
      setError("Failed to save chemical");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Code *
            </label>
            <input
              type="text"
              value={formData.productCode}
              onChange={(e) =>
                setFormData({ ...formData, productCode: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Manufacturer *
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) =>
                setFormData({ ...formData, manufacturer: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Certifying Body
            </label>
            <input
              type="text"
              value={formData.certifyingBody}
              onChange={(e) =>
                setFormData({ ...formData, certifyingBody: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* ZDHC Certification */}
      <div>
        <h2 className="text-2xl font-bold mb-6">ZDHC Certification</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.zdhcCertified === true}
                onChange={(e) =>
                  setFormData({ ...formData, zdhcCertified: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-sm font-bold text-gray-700">
                ZDHC Certified
              </span>
            </label>
          </div>

          {formData.zdhcCertified && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Certification Level
                </label>
                <select
                  value={formData.zdhcLevel}
                  onChange={(e) => {
                    const value = e.target.value as "ZDHC Gateway" | "ZDHC Approved" | "ZDHC Audited";
                    setFormData({ ...formData, zdhcLevel: value });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ZDHC Gateway">ZDHC Gateway</option>
                  <option value="ZDHC Approved">ZDHC Approved</option>
                  <option value="ZDHC Audited">ZDHC Audited</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Certificate Number
                </label>
                <input
                  type="text"
                  value={formData.certificateNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, certificateNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Certificate Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.zdhcCertificateExpiry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      zdhcCertificateExpiry: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Certificate URL
                </label>
                <input
                  type="url"
                  value={formData.zdhcCertificateUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      zdhcCertificateUrl: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="https://..."
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chemical Composition */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Chemical Composition</h2>
        <div className="space-y-4">
          {components.map((component, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Component Name *
                  </label>
                  <input
                    type="text"
                    value={component.componentName}
                    onChange={(e) =>
                      handleComponentChange(index, "componentName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., Sodium Chloride"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    CAS Number *
                  </label>
                  <input
                    type="text"
                    value={component.casNumber}
                    onChange={(e) =>
                      handleComponentChange(index, "casNumber", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., 7732-18-5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Percentage
                  </label>
                  <input
                    type="number"
                    value={component.percentage}
                    onChange={(e) =>
                      handleComponentChange(index, "percentage", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {components.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeComponent(index)}
                  className="text-red-600 hover:text-red-800 font-bold text-sm"
                >
                  Remove Component
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addComponent}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition"
          >
            + Add Component
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold px-8 py-3 rounded-lg transition"
        >
          {loading ? "Saving..." : isEditing ? "Update Chemical" : "Create Chemical"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
