import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../services/apiService';
import GeofenceList from '../components/GeofenceList';
import type { GeofenceEntry } from '../types';

export default function GeofencesPage() {
  const [geofences, setGeofences] = useState<GeofenceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ label: '', room_number: '', building: '', latitude: '', longitude: '', radius_meters: '50' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<GeofenceEntry[]>('/api/admin/geofences')
      .then((res) => setGeofences(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/api/geofences', {
        label: form.label,
        room_number: form.room_number || undefined,
        building: form.building || undefined,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radius_meters: Number(form.radius_meters) || 50,
      });
      setForm({ label: '', room_number: '', building: '', latitude: '', longitude: '', radius_meters: '50' });
      setFormOpen(false);
      load();
    } catch {
      setError('Could not create geofence — check the coordinates.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Geofences</h1>
        <button
          onClick={() => setFormOpen((o) => !o)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          {formOpen ? 'Cancel' : 'Add geofence'}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-white p-4 grid grid-cols-2 gap-3 max-w-xl">
          <input
            required
            placeholder="Label (e.g. MAIT main building)"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Room number"
            value={form.room_number}
            onChange={(e) => setForm((f) => ({ ...f, room_number: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Building"
            value={form.building}
            onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            step="any"
            placeholder="Latitude"
            value={form.latitude}
            onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            step="any"
            placeholder="Longitude"
            value={form.longitude}
            onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Radius (m)"
            value={form.radius_meters}
            onChange={(e) => setForm((f) => ({ ...f, radius_meters: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 rounded-md bg-blue-600 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save geofence'}
          </button>
        </form>
      )}

      {loading ? <p className="text-gray-500">Loading…</p> : <GeofenceList geofences={geofences} />}
    </div>
  );
}
