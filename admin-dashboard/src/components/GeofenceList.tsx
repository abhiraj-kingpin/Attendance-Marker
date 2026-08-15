import type { GeofenceEntry } from '../types';

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : 'Never';
}

export default function GeofenceList({ geofences }: { geofences: GeofenceEntry[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Room</th>
              <th className="px-4 py-2 font-medium">Building</th>
              <th className="px-4 py-2 font-medium">Subject</th>
              <th className="px-4 py-2 font-medium">Coordinates</th>
              <th className="px-4 py-2 font-medium">Radius (m)</th>
              <th className="px-4 py-2 font-medium">Times used</th>
              <th className="px-4 py-2 font-medium">Last used</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {geofences.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-2 text-gray-900">{g.room_number ?? '—'}</td>
                <td className="px-4 py-2 text-gray-500">{g.building ?? '—'}</td>
                <td className="px-4 py-2 text-gray-500">{g.subject_name ?? '—'}</td>
                <td className="px-4 py-2 text-gray-500">
                  {g.latitude.toFixed(4)}, {g.longitude.toFixed(4)}
                </td>
                <td className="px-4 py-2 text-gray-500">{g.radius_meters}</td>
                <td className="px-4 py-2 text-gray-500">{g.usage_count}</td>
                <td className="px-4 py-2 text-gray-500">{formatDate(g.last_used)}</td>
              </tr>
            ))}
            {geofences.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  No geofences yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
