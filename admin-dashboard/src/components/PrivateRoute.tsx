import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { token, isAdmin, isLoading } = useAuth();

  if (isLoading) return <p className="p-6 text-gray-500">Loading…</p>;
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
}
