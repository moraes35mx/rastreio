'use client';

import { STATUS_META, type Status } from '@/lib/status';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${meta.color} ${meta.textColor} ${meta.borderColor} ${sizeClasses[size]}`}
    >
      <Icon size={iconSize[size]} />
      {meta.label}
    </span>
  );
}
