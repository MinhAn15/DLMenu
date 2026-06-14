import React from 'react';
import Card from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number; // Positive is up, negative is down
  trendLabel?: string;
  icon?: string;
}

export default function StatCard({ title, value, trend, trendLabel, icon }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-sm font-medium ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {trend > 0 ? '↑' : trend < 0 ? '↓' : ''} {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-xs text-gray-400">{trendLabel}</span>}
        </div>
      )}
    </Card>
  );
}
