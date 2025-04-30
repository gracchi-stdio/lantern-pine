import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-2xl mx-auto mt-20 px-4 w-full">
        <div className="bg-white rounded-lg shadow-sm border-t-4 border-red-500 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Unauthorized
          </h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <Link
            href="/"
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
