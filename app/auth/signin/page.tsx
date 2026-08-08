"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Vui lòng nhập GitHub token");
      return;
    }
    setLoading(true);
    setError("");

    const res = await signIn("github-token", {
      token: token.trim(),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Token không hợp lệ. Vui lòng kiểm tra lại.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">🔐 Đăng nhập</h1>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>ℹ️ Phân quyền truy cập</strong>
          </p>
          <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
            <li><strong>Có GitHub token</strong> → quyền nhập liệu / chỉnh sửa</li>
            <li><strong>Không đăng nhập</strong> → chỉ xem dữ liệu</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleTokenLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Token của bạn được xác minh trực tiếp với GitHub và KHÔNG được lưu trữ.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {loading ? "Đang xác minh..." : "🔓 Mở khóa quyền nhập liệu"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          👁️ Tiếp tục như khách (chỉ xem)
        </button>
      </div>
    </div>
  );
}
