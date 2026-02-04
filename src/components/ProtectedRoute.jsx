import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAdmin, showDevAuth, setShowDevAuth } = useAuth();

  // If not admin and route requires admin, show locked screen
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-lg shadow p-8">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            This area is for admins only. Please contact an organizer for access.
          </p>
          <a
            href="/"
            className="inline-block bg-green-700 text-white font-medium py-2 px-6 rounded hover:bg-green-800 transition"
          >
            Back to Registration
          </a>
        </div>
      </div>
    );
  }

  return children;
}
