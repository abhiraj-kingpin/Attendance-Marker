import { useCallback, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { api } from '../services/apiService';
import AnalyticsCard from '../components/AnalyticsCard';
import type { Analytics, AttendanceLogEntry } from '../types';

const PIE_COLORS = ['#3b82f6', '#9ca3af']; // auto, manual
const REFRESH_INTERVAL_MS = 30_000;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [log, setLog] = useState<AttendanceLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [analyticsRes, logRes] = await Promise.all([
        api.get<Analytics>('/api/admin/analytics'),
        api.get<AttendanceLogEntry[]>('/api/admin/attendance-log?limit=20'),
      ]);
      setAnalytics(analyticsRes.data);
      setLog(logRes.data);
    } catch {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error || !analytics) return <p className="text-red-600">{error ?? 'No data.'}</p>;

  const pieData = [
    { name: 'Automatic', value: analytics.attendance_today.auto_marked },
    { name: 'Manual', value: analytics.attendance_today.manual_marked },
  ];
  const ocrData = [{ name: 'OCR accuracy', value: analytics.ocr_accuracy_percent ?? 0 }];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <button
          onClick={load}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <AnalyticsCard title="Total users" value={analytics.total_users} />
        <AnalyticsCard title="Active today" value={analytics.active_users_today} />
        <AnalyticsCard title="Attendance marked today" value={analytics.attendance_today.total} />
        <AnalyticsCard
          title="OCR accuracy"
          value={analytics.ocr_accuracy_percent != null ? `${analytics.ocr_accuracy_percent}%` : 'No scans yet'}
        />
        <AnalyticsCard
          title="Geo-tracking health"
          value={analytics.geo_tracking_health_percent != null ? `${analytics.geo_tracking_health_percent}%` : '—'}
          subtitle="Share of attendance marked automatically"
        />
        <AnalyticsCard
          title="Avg attendance"
          value={analytics.average_attendance_percent != null ? `${analytics.average_attendance_percent}%` : '—'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Auto vs manual (today)</p>
          {analytics.attendance_today.total === 0 ? (
            <p className="text-sm text-gray-400">No attendance marked today yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">OCR accuracy</p>
          {analytics.ocr_accuracy_percent == null ? (
            <p className="text-sm text-gray-400">No scans logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ocrData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <p className="text-sm font-medium text-gray-700 mb-2">Recent attendance</p>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Subject</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Method</th>
                <th className="px-4 py-2 font-medium">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {log.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-2 text-gray-900">{entry.user_email}</td>
                  <td className="px-4 py-2 text-gray-500">{entry.subject_name}</td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(entry.timestamp)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.marking_method === 'automatic' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {entry.marking_method}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{entry.room_number ?? '—'}</td>
                </tr>
              ))}
              {log.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No attendance records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
