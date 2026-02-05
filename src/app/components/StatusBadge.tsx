// Reusable status badge component with consistent styling
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export type StatusType = 'success' | 'failed' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-[var(--status-success-bg)]',
      textColor: 'text-[var(--status-success)]',
      label: 'Success'
    },
    failed: {
      icon: XCircle,
      bgColor: 'bg-[var(--status-failed-bg)]',
      textColor: 'text-[var(--status-failed)]',
      label: 'Failed'
    },
    pending: {
      icon: Clock,
      bgColor: 'bg-[var(--status-pending-bg)]',
      textColor: 'text-[var(--status-pending)]',
      label: 'Pending'
    }
  };

  const { icon: Icon, bgColor, textColor, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${bgColor} ${textColor}`}>
      <Icon className="size-4" />
      <span className="text-sm">{children || label}</span>
    </span>
  );
}
