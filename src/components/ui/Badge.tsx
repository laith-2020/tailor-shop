import React from 'react';
import { cn } from '@/utils/cn';
import type { OrderStatus, UserRole } from '@/types/database';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'neutral';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-amber-100 text-amber-800 border-amber-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const statusConfig: Record<OrderStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' | 'danger' }> = {
    new: { label: 'جديد', variant: 'info' },
    in_progress: { label: 'قيد التفصيل', variant: 'warning' },
    ready: { label: 'جاهز', variant: 'success' },
    delivered: { label: 'تم التسليم', variant: 'neutral' },
    cancelled: { label: 'ملغي', variant: 'danger' },
  };

  const config = statusConfig[status] || { label: status, variant: 'neutral' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  const roleConfig: Record<UserRole, { label: string; variant: 'default' | 'neutral' }> = {
    owner: { label: 'مدير المتجر', variant: 'default' },
    staff: { label: 'موظف تفصيل', variant: 'neutral' },
  };

  const config = roleConfig[role] || { label: role, variant: 'neutral' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
