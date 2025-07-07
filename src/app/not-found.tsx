import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-6">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Sorry, Page Not Found</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
        The page you are looking for is not available or may have been moved to another location.<br />
        You can return to the home page or browse other sections.
      </p>
      <Link href="/">
        <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">Back to Home</span>
      </Link>
    </div>
  );
} 