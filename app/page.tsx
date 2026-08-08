import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 text-center">
        <h1 className="text-5xl font-bold mb-4">🧪 Chemical Control System</h1>
        <p className="text-xl mb-8">
          Manage and control chemicals according to ZDHC standards
        </p>
        <div className="space-x-4">
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded hover:bg-blue-100 transition"
          >
            View Dashboard
          </Link>
          {!session ? (
            <Link
              href="/auth/signin"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded transition"
            >
              Sign In with GitHub
            </Link>
          ) : (
            (session.user?.role === "admin" || session.user?.role === "editor") && (
              <Link
                href="/chemical/new"
                className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-8 py-3 rounded transition"
              >
                Add New Chemical
              </Link>
            )
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-blue-50 p-8 rounded-lg border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold mb-4">📊 Dashboard</h2>
          <p className="text-gray-700 mb-4">
            View all chemicals and their ZDHC compliance status at a glance.
          </p>
          <Link href="/dashboard" className="text-blue-600 font-bold hover:underline">
            Go to Dashboard →
          </Link>
        </div>

        <div className="bg-green-50 p-8 rounded-lg border-l-4 border-green-600">
          <h2 className="text-2xl font-bold mb-4">✅ ZDHC Certified</h2>
          <p className="text-gray-700 mb-4">
            Only ZDHC certified chemicals are permitted. Our system automatically validates compliance.
          </p>
          <Link
            href="/dashboard?certified=true"
            className="text-green-600 font-bold hover:underline"
          >
            View Certified →
          </Link>
        </div>

        <div className="bg-purple-50 p-8 rounded-lg border-l-4 border-purple-600">
          <h2 className="text-2xl font-bold mb-4">🔐 Access Control</h2>
          <p className="text-gray-700 mb-4">
            Sign in with GitHub to get editor access. Viewers can only read data.
          </p>
          {session ? (
            <p className="text-purple-600 font-bold">
              Your role: <span className="uppercase">{session.user?.role}</span>
            </p>
          ) : (
            <Link href="/auth/signin" className="text-purple-600 font-bold hover:underline">
              Sign In →
            </Link>
          )}
        </div>
      </section>

      {/* ZDHC Info Section */}
      <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-4">🏆 ZDHC Compliance</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">What is ZDHC?</h3>
            <p className="text-gray-700 mb-4">
              The ZDHC Gateway (Zero Discharge of Hazardous Chemicals) is an initiative to 
              eliminate hazardous chemicals from the global textile and apparel supply chain.
            </p>
            <p className="text-gray-700">
              Our system helps you manage and control chemicals to ensure ZDHC compliance.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">ZDHC Certification Levels</h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                <strong>Gateway:</strong> Products that meet ZDHC standards
              </li>
              <li>
                <strong>Approved:</strong> Certified by ZDHC approved manufacturers
              </li>
              <li>
                <strong>Audited:</strong> Passed third-party audit
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">📚 How to Use</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">For Viewers</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Visit the Dashboard to see all chemicals</li>
              <li>Filter by ZDHC certification status</li>
              <li>Click on any chemical to see detailed information</li>
              <li>View compliance reports and certifications</li>
            </ol>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">For Editors/Admins</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Sign in with GitHub to unlock editor features</li>
              <li>Add new chemicals with ZDHC information</li>
              <li>Update existing chemical records</li>
              <li>View compliance validation results</li>
              {session?.user?.role === "admin" && (
                <li>Manage user access and delete records</li>
              )}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session && (
        <section className="bg-blue-600 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-lg mb-6">
            Sign in with GitHub to unlock editor access and start managing chemicals
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded hover:bg-blue-100 transition"
          >
            Sign In Now
          </Link>
        </section>
      )}
    </div>
  );
}
