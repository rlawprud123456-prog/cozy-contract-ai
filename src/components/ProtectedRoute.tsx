import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  user: any;
  children: React.ReactNode;
}

export default function ProtectedRoute({ user, children }: ProtectedRouteProps) {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
