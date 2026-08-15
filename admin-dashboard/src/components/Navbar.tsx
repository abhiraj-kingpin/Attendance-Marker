import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
      <span className="font-semibold text-gray-900">Attendance Marker · Admin</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button
          onClick={logout}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
