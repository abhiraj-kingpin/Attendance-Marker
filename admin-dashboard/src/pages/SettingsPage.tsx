import { useEffect, useState } from 'react';
import { api } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

interface AppSettings {
  defaultAttendanceMode: 'manual' | 'partial' | 'automatic';
  ocrEnabled: boolean;
  predictionsEnabled: boolean;
  locationTrackingEnabled: boolean;
}

interface ErrorLogEntry {
  id: string;
  message: string;
  path: string | null;
  createdAt: string;
}

const MODES: AppSettings['defaultAttendanceMode'][] = ['manual', 'partial', 'automatic'];

export default function SettingsPage() {
  const { logout } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get<AppSettings>('/api/admin/settings').then((res) => setSettings(res.data));
    api.get<ErrorLogEntry[]>('/api/admin/errors?limit=20').then((res) => setErrors(res.data));
  }

  useEffect(load, []);

  async function updateSettings(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      const { data } = await api.put<AppSettings>('/api/admin/settings', patch);
      setSettings(data);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-4">
        These are stored server-side, but nothing currently reads them to change behavior — mobile/'s attendance mode
        is a per-user local setting, and this backend's own logic doesn't check these flags yet. Storage and this UI
        exist; enforcement is a separate step.
      </p>

      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Default attendance mode</p>
        <div className="flex gap-2">
          {MODES.map((mode) => (
            <button
              key={mode}
              disabled={saving}
              onClick={() => updateSettings({ default_attendance_mode: mode })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
                settings.defaultAttendanceMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Feature flags</p>
        {[
          { key: 'ocr_enabled', label: 'OCR scanning', value: settings.ocrEnabled },
          { key: 'predictions_enabled', label: 'Predictions', value: settings.predictionsEnabled },
          { key: 'location_tracking_enabled', label: 'Location tracking', value: settings.locationTrackingEnabled },
        ].map((flag) => (
          <label key={flag.key} className="flex items-center justify-between py-2 text-sm text-gray-700">
            {flag.label}
            <input
              type="checkbox"
              checked={flag.value}
              disabled={saving}
              onChange={(e) => updateSettings({ [flag.key]: e.target.checked })}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Recent errors</p>
        {errors.length === 0 ? (
          <p className="text-sm text-gray-400">No errors logged.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {errors.map((e) => (
              <li key={e.id} className="py-2 text-xs">
                <span className="text-gray-400">{new Date(e.createdAt).toLocaleString()}</span>{' '}
                <span className="text-gray-500">{e.path}</span>
                <p className="text-red-600">{e.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={logout} className="text-sm font-medium text-red-600">
        Log out
      </button>
    </div>
  );
}
