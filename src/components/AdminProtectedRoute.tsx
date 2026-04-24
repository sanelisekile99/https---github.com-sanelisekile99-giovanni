import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export default function AdminProtectedRoute({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const auth = await isAdminAuthenticated();
        if (mounted) {
          setIsAuthenticated(auth);
          setLoading(false);
        }
      } catch (error) {
        console.error('Admin authentication check failed:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-sm text-[#8B8B8B]">Verifying admin access...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
