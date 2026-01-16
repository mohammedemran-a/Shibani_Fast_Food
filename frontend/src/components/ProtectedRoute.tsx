import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
}

export const ProtectedRoute = ({ children, permission }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ms-3 text-lg text-foreground">جاري التحميل...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check permission if required
  if (permission && user) {
    const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
    const isAdmin = userRole?.toLowerCase().includes('admin') || userRole?.toLowerCase().includes('super');
    
    // Admin has all permissions, others must have the specific permission
    if (!isAdmin) {
      const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
      if (!userPermissions.includes(permission)) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};
