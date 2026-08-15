interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function AnalyticsCard({ title, value, subtitle }: AnalyticsCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}
