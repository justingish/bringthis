import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist or the link may be invalid.
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create a New Signup Sheet
      </Link>
    </div>
  );
}
