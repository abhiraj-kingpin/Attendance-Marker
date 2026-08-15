import { useEffect, useState } from 'react';
import { api } from '../services/apiService';
import UserTable from '../components/UserTable';
import type { AdminUserRow } from '../types';

const PAGE_SIZE = 50;

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { limit: PAGE_SIZE, offset: page * PAGE_SIZE };
    if (search.trim()) params.search = search.trim();
    api
      .get<AdminUserRow[]>('/api/admin/users', { params })
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Users</h1>

      <input
        type="search"
        placeholder="Search by email…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        className="mb-4 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
      />

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <UserTable users={users} page={page} onPageChange={setPage} hasNextPage={users.length === PAGE_SIZE} />
      )}
    </div>
  );
}
