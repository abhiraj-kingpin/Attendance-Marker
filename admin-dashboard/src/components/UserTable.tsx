import type { AdminUserRow } from '../types';

interface UserTableProps {
  users: AdminUserRow[];
  page: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
}

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : '—';
}

export default function UserTable({ users, page, onPageChange, hasNextPage }: UserTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium">Last login</th>
              <th className="px-4 py-2 font-medium">Subjects</th>
              <th className="px-4 py-2 font-medium">Attendance %</th>
              <th className="px-4 py-2 font-medium">Last activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 text-gray-900">{u.email}</td>
                <td className="px-4 py-2 text-gray-500">{formatDate(u.created_at)}</td>
                <td className="px-4 py-2 text-gray-500">{formatDate(u.last_login)}</td>
                <td className="px-4 py-2 text-gray-500">{u.subjects_count}</td>
                <td className="px-4 py-2 text-gray-500">{u.attendance_percent != null ? `${u.attendance_percent}%` : '—'}</td>
                <td className="px-4 py-2 text-gray-500">{formatDate(u.last_activity)}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="text-sm text-gray-600 disabled:opacity-30"
        >
          ← Previous
        </button>
        <span className="text-xs text-gray-400">Page {page + 1}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="text-sm text-gray-600 disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
